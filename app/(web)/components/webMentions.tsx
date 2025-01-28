"use client";
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";

interface Props {
  text: string;
  setText: any;
  taskErrorMessage: any;
  setTaskErrorMessage: any;
  allTasks: any;
  teamId: number;
  taskId: number;
  taskStatus: boolean;
  mentionTrigger: boolean;
  setMentionTrigger: any;
}

interface MentionableEntity {
  id: number;
  name: string;
  type: EntityType;
  email: string;
  entity_name: string;
}

type EntityType = "Employee" | "Team" | "Space";

// Define a color mapping for each entity type
// const entityTypeColors: Record<EntityType, string> = {
//   Employee: "#518A37",
//   Team: "#8692ee",
//   Space: "#df478e",
// };

const WebMentionInput: React.FC<Props> = ({
  text,
  setText,
  taskErrorMessage,
  setTaskErrorMessage,
  allTasks,
  teamId,
  taskId,
  taskStatus,
  mentionTrigger,
  setMentionTrigger,
}) => {
  const [suggestions, setSuggestions] = useState<MentionableEntity[]>([]);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(
    null
  );
  const [mentionableEntities, setMentionableEntities] = useState<
    MentionableEntity[]
  >([]);
  const editableRef = useRef<HTMLDivElement | null>(null);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*");
      if (error) throw error;
      if (data) {
        return data;
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  };

  useEffect(() => {
    // if (mentionTrigger) {
      fetchTasks();
      handleInput({} as React.FormEvent<HTMLDivElement>);
    // }
  }, [mentionTrigger, setMentionTrigger]);

  // Handle user input to detect mentions and update text
  const handleInput = async (e: React.FormEvent<HTMLDivElement>) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from("teams")
        .select("members")
        .eq("id", teamId);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        // Safely access and transform members
        const entities = memberData.flatMap((team) => team.members || []);
        setMentionableEntities(entities);
      } else {
        console.warn("No team members found for the given team ID.");
      }
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    }

    console.log(text, "typed Text");
    const mentions = text.match(/@\w+/g) || []; // Find all mentions
    const content = text.replace(/@\w+/g, "").trim();
    if (content.length < 0 && mentions.length < 0) {
      setTaskErrorMessage({ status: true, errorId: taskId });
    } else {
      setTaskErrorMessage({ status: false, errorId: taskId });
      if (editableRef.current) {
        const plainText = editableRef.current.innerText || "";
        setText(plainText);
        const selection = window.getSelection();
        let cursorPosition = 0;
        const childNodes = Array.from(editableRef.current.childNodes);

        for (const node of childNodes) {
          if (node === selection?.focusNode) {
            cursorPosition += selection.focusOffset;
            break;
          } else if (node.nodeType === Node.TEXT_NODE) {
            cursorPosition += node.textContent?.length ?? 0;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            cursorPosition += node.textContent?.length ?? 0;
          }
        }

        // Check if user is typing a mention
        if (mentionStartIndex !== null && cursorPosition > mentionStartIndex) {
          const mentionQuery = plainText.slice(
            mentionStartIndex + 1,
            cursorPosition
          );
          const filteredSuggestions = mentionableEntities.filter((entity) =>
            entity.entity_name
              .toLowerCase()
              .includes(mentionQuery.toLowerCase())
          );
          console.log(filteredSuggestions, " filtered suggestions");
          setSuggestions(filteredSuggestions);
        } else {
          setSuggestions([]);
          setMentionStartIndex(null);
        }
      }
    }
  };

  // Insert mention as plain text instead of HTML
  const selectMention = (entity: MentionableEntity) => {
    if (mentionStartIndex !== null && editableRef.current) {
      const plainText = editableRef.current.innerText || "";
      const mentionText = `@${entity.entity_name} `;
      const beforeMention = plainText.slice(0, mentionStartIndex);
      const afterMention = plainText.slice(
        mentionStartIndex + mentionText.length - 1
      );

      const newContent = `${beforeMention}${mentionText}${afterMention}`;
      editableRef.current.innerText = newContent;
      setText(newContent);

      setSuggestions([]);
      setMentionStartIndex(null);

      // Move cursor to end of inserted mention
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(editableRef.current.childNodes[0], newContent.length);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  // Track '@' character to start mention mode
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (e.key === "@") {
      let offset = 0;
      const childNodes = Array.from(editableRef.current!.childNodes);

      for (const node of childNodes) {
        if (node === selection?.focusNode) {
          offset += selection.focusOffset;
          break;
        } else if (node.nodeType === Node.TEXT_NODE) {
          offset += node.textContent?.length ?? 0;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          offset += node.textContent?.length ?? 0;
        }
      }
      setMentionStartIndex(offset ?? null);
    }
  };

  // Group suggestions by entity type
  const groupedSuggestions = suggestions.reduce((acc, entity) => {
    (acc[entity.type] = acc[entity.type] || []).push(entity);
    return acc;
  }, {} as Record<EntityType, MentionableEntity[]>);

  const handleAllMention = () => {
    if (mentionableEntities.length > 0 && editableRef.current) {
      let plainText = editableRef.current.innerText || "";

      // Remove standalone '@' symbols with empty space next to them
      plainText = plainText.replace(/@\s+/g, "");

      // Construct the mentions list with specific formatting
      const mentionTexts = mentionableEntities.map((entity, index) =>
        index === 0 ? entity.entity_name : ` @${entity.entity_name}`
      );

      // Construct the new content
      const newContent = `${plainText}${mentionTexts.join("")}`.trim();
      editableRef.current.innerText = newContent;
      setText(newContent);

      setSuggestions([]);
      setMentionStartIndex(null);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }} className="py-1.5">
      {Object.keys(groupedSuggestions).length > 0 && (
        <div
          style={{
            listStyle: "none",
            padding: "0px",
            margin: "5px 0",
            border: "1px solid #ddd",
            borderRadius: "5px",
            maxWidth: "360px",
            width: "100%",
            backgroundColor: "#f9f9f9",
            position: "absolute",
            zIndex: 99999,
            bottom: "40px",
            left: "0px",
            textAlign: "left",
            minHeight: "auto",
            maxHeight: "140px",
            overflowY: "auto",
          }}
        >
          {(
            Object.entries(groupedSuggestions) as [
              EntityType,
              MentionableEntity[]
            ][]
          ).map(([type, entities]) => (
            <div key={type} style={{ marginBottom: "3px" }}>
              <div
                className="cursor-pointer hover:bg-gray-300 p-2 pb-1 pl-2.5"
                onClick={handleAllMention}
              >
                @all
              </div>
              {entities.map((entity) => (
                <div
                  className="cursor-pointer hover:bg-gray-300 rounded"
                  key={entity.id}
                  onClick={() => selectMention(entity)}
                  style={{
                    padding: "5px 10px",
                    cursor: "pointer",
                    color: "#333",
                  }}
                >
                  {entity.entity_name}
                  {entity.email && <p className="text-xs">{entity.email}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {allTasks && teamId && taskId ? (
        allTasks.map(
          (task: any) =>
            teamId === task.team_id &&
            taskId === task.id && (
              <div
                key={task.id}
                contentEditable
                ref={editableRef}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={handleInput}
                style={{
                  width: "100%",
                  minHeight: "30px",
                  borderRadius: "5px",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  outline: "none",
                  textAlign: "left",
                }}
                className={`${
                  taskErrorMessage.errorId === task.id &&
                  taskErrorMessage.status === true
                    ? "border border-red-500 p-1"
                    : "border-none"
                } text-sm ${
                  taskStatus === true
                    ? "pointer-events-none"
                    : "pointer-events-auto"
                }`}
              >
                <span className="font-bold text-primaryColor-700">
                  {task.mentions}
                </span>{" "}
                {task.task_content}
              </div>
            )
        )
      ) : 
      (
        <div
          contentEditable
          ref={editableRef}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleInput}
          style={{
            width: "100%",
            minHeight: "65px",
            borderRadius: "5px",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            outline: "none",
            textAlign: "left",
          }}
          className={`${
            taskErrorMessage.status === true
              ? "border border-red-500 p-1"
              : "border-none"
          } text-sm`}
        ></div>
      )
      }
    </div>
  );
};

export default WebMentionInput;
