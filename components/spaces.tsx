"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useGlobalContext } from "@/context/store";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Spaces() {
  const route = useRouter();
  const { userId } = useGlobalContext();
  const [overdueSpace, setOverdueSpace] = useState<any[]>([]);
  const [adminOverdueSpace, setAdminOverdueSpace] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState(null);

  const [allSpace, setAllSpace] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [userSpace, setUserSpace] = useState<any[]>([]);
  const [addLoader, setAddLoader] = useState<string[]>([]);

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .select("*")
          .eq("is_deleted", false);

        if (taskError) {
          console.error(taskError);
          return;
        }
        if (taskData) {
          const { data: teamData, error: teamError } = await supabase
            .from("spaces")
            .select("*")
            .eq("is_deleted", false);

          if (teamError) {
            console.error(teamError);
            return;
          }

          setAdminOverdueSpace(teamData);

          const filteredTasks = taskData
            .map((task) => {
              const team = teamData.find((space) => space.id === task.space_id);
              if (team && task.mentions?.includes(`@${userId?.entity_name}`)) {
                return { ...task, space_name: team.space_name };
              }
              return null;
            })
            .filter(Boolean);

          // Remove duplicates by using a Set for space names
          const uniqueOverdue = Array.from(
            new Set(filteredTasks.map((task) => task.space_name))
          ).map((space_name) =>
            filteredTasks.find((task) => task.space_name === space_name)
          );

          setOverdueSpace(uniqueOverdue);
          // setAdminOverdueSpace(uniqueAdminOverdue);
        }
      } catch (err) {
        console.error("Error fetching task data:", err);
      }
    };

    fetchSpace();
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: spaces } = await supabase
        .from("spaces")
        .select("*")
        .eq("is_deleted", false);
      const { data: teams } = await supabase
        .from("teams")
        .select("*")
        .eq("is_deleted", false);
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_deleted", false);

      if (spaces) setAllSpace(spaces);
      if (teams) setAllTeams(teams);
      if (tasks) setAllTasks(tasks);
    };
    fetchData();
  }, []);

  const handleSpaceClick = (spaceId: any) => {
    setAddLoader((prev: any) => [...prev, spaceId]);
    (prev: any) => prev.filter((id: any) => id !== spaceId);
    route.push(`/test-task/${spaceId}`);
  };

  useEffect(() => {
    if (userId?.role === "owner") {
      setUserSpace([...allSpace]);
    } else {
      const matchedTeams = allTeams.filter((team) =>
        team.members.some(
          (member: any) => member.entity_name === userId?.entity_name
        )
      );
      const matchedSpaceIds = new Set(
        matchedTeams.map((team) => team.space_id)
      );

      const matchedSpaces = allSpace.filter((space) =>
        matchedSpaceIds.has(space.id)
      );
      setUserSpace(matchedSpaces);
    }
  }, [allSpace, allTeams, userId]);

  return (
    <>
      <main className="w-full px-[18px] py-[18px]">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold font-geist text-black">
            Spaces
          </h4>
          <Drawer>
            <DrawerTrigger asChild>
              <p className="text-[#1A56DB]  font-geist font-medium  text-sm cursor-pointer">
                View all
              </p>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Spaces</DrawerTitle>
                </DrawerHeader>
                <div className="pb-7">
                  <ul>
                    {userSpace.map((spaceName, index) => (
                      <li
                        key={index}
                        className={`flex items-center justify-between text-black py-2 px-4 border-b border-[#D4D4D8] ${
                          selectedSpace === spaceName.space_name
                            ? "bg-gray-100"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedSpace(spaceName.space_name);
                          console.log(spaceName.id);
                          handleSpaceClick(spaceName.id);
                        }}
                      >
                        <span>{spaceName.space_name}</span>
                        {selectedSpace === spaceName.space_name && (
                          <Check className="text-black" size={18} />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex flex-wrap justify-start items-center gap-2 mt-3">
          {userSpace.length > 0 ? (
            userSpace.map((spaceName, index) => (
              <p
                key={index}
                className="bg-[#294480] text-white py-2 px-4 rounded-lg"
                style={
                  addLoader.includes(spaceName.id)
                    ? { pointerEvents: "none" }
                    : {}
                }
                onClick={() => handleSpaceClick(spaceName.id)}
              >
                {addLoader.includes(spaceName.id) ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    key={spaceName.id}
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#fff"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="#fff"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  spaceName.space_name
                )}
              </p>
            ))
          ) : (
            <p className="text-gray-500">No spaces available</p>
          )}
        </div>
      </main>
    </>
  );
}
