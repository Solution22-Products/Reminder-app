"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { MentionsInput, Mention } from "react-mentions";
import { useGlobalContext } from "@/context/store";
import { getLoggedInUserData } from "@/app/(signin-setup)/sign-in/action";

interface MentionData {
  id: number;
  display: string;
}

const ReactMentions = () => {
  const { userId } = useGlobalContext();
  const [spaces, setSpaces] = useState<MentionData[]>([]);
  const [teams, setTeams] = useState<MentionData[]>([]);
  const [employees, setEmployees] = useState<MentionData[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [mentionedItems, setMentionedItems] = useState<
    { id: number; name: string }[]
  >([]);
  const [taskLoading, setTaskLoading] = useState(true);
  const [mentionLevel, setMentionLevel] = useState<number>(1);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
  const [adminOverdueTasks, setAdminOverdueTasks] = useState<any[]>([]);

  const fetchTaskData = async () => {
    try {
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_deleted", false);

      if (taskError) throw taskError;

      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("is_deleted", false);

      if (teamError) throw teamError;

      const { data: spaceData, error: spaceError } = await supabase
        .from("spaces")
        .select("*")
        .eq("is_deleted", false);

      if (spaceError) throw spaceError;

      setAdminOverdueTasks(spaceData);
      const filteredTasks = taskData
        .map((task) => {
          const team = teamData.find((team) => team.id === task.team_id);
          const space = spaceData.find((space) => space.id === task.space_id);
          if (
            team &&
            space &&
            task.mentions?.includes(`@${userId?.entity_name}`)
          ) {
            return {
              ...task,
              team_name: team.team_name,
              space_name: space.space_name,
            };
          }
          return null;
        })
        .filter(Boolean);

      // const overdue = filteredTasks.filter((task) =>
      //   new Date(task.due_date).getTime()
      // );
      const adminOverdue = taskData.map((task) => {
        const team = teamData.find((team) => team.id === task.team_id);
        const space = spaceData.find((space) => space.id === task.space_id);
        return team && space
          ? {
              ...task,
              team_name: team.team_name,
              space_name: space.space_name,
            }
          : null;
      });

      // setOverdueTasks(filteredTasks);
      // setAdminOverdueTasks(adminOverdue);
      setTaskLoading(false);

      const getUniqueItems = <T, K extends keyof T>(array: T[], key: K) => {
        const seen = new Set();
        return array.filter((item) => {
          const value = item[key];
          if (!seen.has(value)) {
            seen.add(value);
            return true;
          }
          return false;
        });
      };
      
      const getUniqueMentions = (data: typeof adminOverdue | typeof filteredTasks) => {
        const seenMentions = new Set<string>();
        return data.flatMap((emp) =>
          Array.isArray(emp.mentions)
            ? emp.mentions
                .filter((mention: string) => {
                  if (!seenMentions.has(mention)) {
                    seenMentions.add(mention);
                    return true;
                  }
                  return false;
                })
                .map((mention: string, index: number) => ({
                  id: emp.id * 100 + index,
                  display: mention,
                }))
            : []
        );
      };
      
      const sourceData = userId?.role === "owner" ? adminOverdueTasks : filteredTasks;
      
      setSpaces(
        getUniqueItems(
          sourceData.map((space) => ({ id: space.id, display: space.space_name })),
          "display"
        )
      );
      
      // setTeams(
      //   getUniqueItems(
      //     sourceData.map((team) => ({ id: team.id, display: team.team_name })),
      //     "display"
      //   )
      // );
      
      // setEmployees(getUniqueMentions(sourceData.filter((emp) => emp.mentions)));
      

    } catch (err) {
      console.error("Error fetching task data:", err);
      setTaskLoading(false);
    }
  };

  const extractMentions = (value: string) => {
    const mentionRegex = /@\[(.*?)\]\((\d+)\)/g;
    const matches = Array.from(value.matchAll(mentionRegex)).map((match) => ({
      name: match[1],
      id: parseInt(match[2], 10),
    }));
    setMentionedItems(matches);
  };

  const handleChange = (event: { target: { value: string } }) => {
    setInputValue(event.target.value);
    extractMentions(event.target.value);
    if (event.target.value === "") {
      setMentionedItems([]);
      setMentionLevel(1);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [userId]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">React Mentions Input</h1>
      {taskLoading ? (
        <p>Loading...</p>
      ) : (
        <MentionsInput
          value={inputValue}
          onChange={handleChange}
          placeholder="Type @ to mention spaces, teams, or employees"
          className="mentions-input border p-2 rounded-md w-full"
        >
          <Mention
            trigger="@"
            data={
              mentionLevel === 1
                ? spaces
                : mentionLevel === 2
                ? teams
                : mentionLevel >= 3
                ? employees
                : []
            }
            displayTransform={(id, display) => `@${display}`}
            onAdd={() => setMentionLevel((prev) => prev + 1)}
          />
        </MentionsInput>
      )}
      {mentionedItems.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold">Mentioned Items:</h2>
          <ul className="list-disc list-inside">
            {mentionedItems.map((item, index) => (
              <li key={index}>
                {item.name} (ID: {item.id})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReactMentions;
