"use client";
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";

interface Props {
  text: string;
  setText: (text: string) => void;
  setTaskErrorMessage: (error: boolean) => void;
}

interface MentionableEntity {
  id: number;
  name: string;
  type: EntityType;
  email: string;
}

type EntityType = "Employee" | "Team" | "Space";

// Define a color mapping for each entity type
const entityTypeColors: Record<EntityType, string> = {
  Employee: "#518A37",
  Team: "#8692ee",
  Space: "#df478e",
};

const MentionInput: React.FC<Props> = ({
  text,
  setText,
  setTaskErrorMessage,
}) => {
  const [suggestions, setSuggestions] = useState<MentionableEntity[]>([]);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(
    null
  );
  const [mentionableEntities, setMentionableEntities] = useState<
    MentionableEntity[]
  >([]);
  const editableRef = useRef<HTMLDivElement | null>(null);

  // Fetch mentionable entities from the database
  const getMentions = async () => {
    const { data, error } = await supabase
      .from("employee_entities")
      .select("*");
    if (error) {
      console.error("Database Error:", error);
      return;
    }
    setMentionableEntities(data);
  };

  useEffect(() => {
    getMentions();
  }, []);

  // Handle user input to detect mentions and update text
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    console.log(text, "typed Text");
    const mentions = text.match(/@\w+/g) || []; // Find all mentions
    const content = text.replace(/@\w+/g, "").trim();
    if (content.length < 0 && mentions.length < 0) {
      setTaskErrorMessage(true);
    } else {
      setTaskErrorMessage(false);
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
            entity.name
              .toLowerCase()
              .startsWith(mentionQuery.toLowerCase().trim())
          );
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
      const mentionText = `@${entity.name} `;
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

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {Object.keys(groupedSuggestions).length > 0 && (
        <div
          style={{
            listStyle: "none",
            padding: "10px",
            margin: "5px 0",
            border: "1px solid #ddd",
            borderRadius: "5px",
            maxWidth: "360px",
            width: "100%",
            backgroundColor: "#f9f9f9",
            position: "absolute",
            zIndex: 10,
            bottom: "100px",
            left: 0,
            textAlign: "left",
            minHeight: "auto",
            maxHeight: "400px",
            overflowY: "scroll",
          }}
        >
          {(
            Object.entries(groupedSuggestions) as [
              EntityType,
              MentionableEntity[]
            ][]
          ).map(([type, entities]) => (
            <div key={type} style={{ marginBottom: "5px" }}>
              <div
                style={{ fontWeight: "bold", color: entityTypeColors[type] }}
              >
                {type}
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
                  {entity.name}
                  {entity.email && <p className="text-xs">{entity.email}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div
        contentEditable
        ref={editableRef}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        // className='text-red-500'
        // className={`${mentionColor} ? 'text-red-500' : 'text-black'`}
        style={{
          width: "100%",
          padding: "10px",
          minHeight: "100px",
          borderRadius: "5px",
          border: "1px solid #ddd",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          outline: "none",
          textAlign: "left",
        }}
      />
    </div>
  );
};

export default MentionInput;
