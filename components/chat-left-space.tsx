"use client";
import { supabase } from "@/utils/supabase/supabaseClient";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SendHorizontal } from "lucide-react";

interface ChatLeftSpaceProps {
  selectedTeamId: string | null;
  selectedSpaceId: string | null;
  selectedUserId: string | null;
  spaces: any[];
  teams: any[];
  members: any[];
  isLoading: boolean;
}

const ChatLeftSpace = ({
  selectedTeamId,
  selectedSpaceId,
  selectedUserId,
  spaces,
  teams,
  members,
  isLoading,
}: ChatLeftSpaceProps) => {
  // Find the selected items by ID
  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);
  const selectedMember = members.find((member) => member.id === selectedUserId);

  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [memberTasks, setMemberTasks] = useState<any[]>([]);

  const fetchTasks = async () => {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false)
      .eq("space_id", selectedSpaceId)
      .eq("team_id", selectedTeamId);
    if (error) {
      console.error("Error fetching tasks:", error);
    } else {
      console.log(tasks);
      setAllTasks(tasks);
      //   const a = tasks.filter((task) => task?.mentions?.includes(`@${selectedMember?.entity_name}`))
      //   setMemberTasks(a)
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedSpaceId, selectedTeamId]);

  return (
    <div className="relative h-[100dvh]">
      <h1 className="text-2xl font-bold mb-6 pl-6 pt-6">Chat Dashboard</h1>
      {/* Scrollable Content */}
      <div className="p-6 pt-0 pb-20 w-full h-[calc(100dvh-180px)] overflow-y-auto">
        

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            {/* <h2 className="text-lg font-semibold mb-3">Selected Items</h2> */}

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div>
                {allTasks.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-3">Tasks</h2>
                    <div className="space-y-3">
                      {allTasks.map((task) => (
                        <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                          {/* <p className="text-xs text-gray-500  mt-1">ID: {task.id}</p> */}
                          <p className="text-medium text-gray-500  mt-1"><span className="text-blue-700">{task.mentions}</span> {task.task_content}</p>
                          <p className="text-xs text-gray-500  mt-1">Created: {task.time}</p>
                          <p className="text-xs text-gray-500  mt-1">Due date: {task.due_date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-4">
                    <h2 className="text-lg font-semibold mb-3">Tasks</h2>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-400 italic">No tasks found</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Input - Fixed width issue */}
      <div className="w-[50%] fixed bottom-4 left-[290px] bg-white z-50 rounded-full shadow-2xl">
        <div className="max-w-full px-4 py-4">
          <Input
            type="text"
            placeholder="Search"
            className="w-[91%] rounded-lg border border-gray-300 focus:ring-2 outline-none"
          />
        </div>
        <Button className="w-fit absolute bottom-4 right-0 transform -translate-x-1/2"><SendHorizontal className="h-6 w-6" /></Button>
      </div>
    </div>
  );
};

export default ChatLeftSpace;
