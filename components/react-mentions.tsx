"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { MentionsInput, Mention } from "react-mentions";

interface MentionData {
  id: number;
  display: string;
}

const ReactMentions = () => {
  const [spaces, setSpaces] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [mentionedSpaces, setMentionedSpaces] = useState<{ id: number; name: string }[]>([]);
  const [taskLoading, setTaskLoading] = useState(true);

  const fetchTaskData = async () => {
    try {
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_deleted", false);

      if (taskError) {
        console.error(taskError);
        setTaskLoading(false);
        return;
      }

      if (taskData) {
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("is_deleted", false);

        if (teamError) {
          console.error(teamError);
          setTaskLoading(false);
          return;
        }

        const { data: spaceData, error: spaceError } = await supabase
          .from("spaces")
          .select("*")
          .eq("is_deleted", false);

        if (spaceError) {
          console.error(spaceError);
          setTaskLoading(false);
          return;
        }

        const transformedSpaces = spaceData.map((space) => {
          const relatedTasks = taskData.filter((task) => task.space_id === space.id);
          const mentions = relatedTasks.flatMap((task) => task.mentions || []);
          const teamNames = relatedTasks
            .map((task) => {
              const team = teamData.find((team) => team.id === task.team_id);
              return team ? team.team_name : null;
            })
            .filter(Boolean);

          return {
            id: space.id,
            display: space.space_name,
            mentions: Array.from(new Set(mentions)),
            teams: Array.from(new Set(teamNames)),
          };
        });

        setSpaces(transformedSpaces as any);
        setTaskLoading(false);
      }
    } catch (err) {
      console.error("Error fetching task data:", err);
      setTaskLoading(false);
    }
  };

  const extractMentions = (value: string) => {
    const mentionRegex = /@\[(.*?)\]\((\d+)\)/g; // Matches format @[name](id)
    const matches = Array.from(value.matchAll(mentionRegex)).map((match) => ({
      name: match[1],
      id: parseInt(match[2], 10),
    }));
    setMentionedSpaces(matches);
  };

  const handleChange = (event: { target: { value: string } }) => {
    setInputValue(event.target.value);
    extractMentions(event.target.value);
  };

  useEffect(() => {
    fetchTaskData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">React Mentions Input</h1>
      {taskLoading ? (
        <p>Loading...</p>
      ) : (
        <MentionsInput
          value={inputValue}
          onChange={handleChange}
          placeholder="Type @ to mention a space"
          className="mentions-input border p-2 rounded-md w-full"
        >
          <Mention
  trigger="@"
  data={spaces.map((space) => ({
    id: space.id,
    display: `${space.display} (Teams: ${space.teams.join(", ")}, Mentions: ${space.mentions.join(", ")})`,
  })) as MentionData[]} // Use the type interface here
  displayTransform={(id, display) => `@[${display}](${id})`}
  className="mentions bg-gray-200"
/>
        </MentionsInput>
      )}
      {mentionedSpaces.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold">Mentioned Spaces:</h2>
          <ul className="list-disc list-inside">
            {mentionedSpaces.map((space, index) => (
              <li key={index}>
                {space.name} (ID: {space.id})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReactMentions;