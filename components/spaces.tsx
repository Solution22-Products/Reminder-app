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
} from "@/components/ui/drawer"
import { Check } from "lucide-react";

export default function Spaces() {
  const { userId } = useGlobalContext();
  const [overdueSpace, setOverdueSpace] = useState<any[]>([]);
  const [adminOverdueSpace, setAdminOverdueSpace] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  
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

  return (
    <main className="w-full px-[18px] py-[18px]">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold font-geist text-black">Spaces</h4>
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
              {(userId?.role === "owner" ? adminOverdueSpace : overdueSpace).map((spaceName, index) => (
                <li
                key={index}
                className={`flex items-center justify-between text-black py-2 px-4 border-b border-[#D4D4D8] ${
                  selectedSpace === spaceName.space_name ? "bg-gray-100" : ""
                }`}
                onClick={() => {setSelectedSpace(spaceName.space_name); console.log(spaceName.space_id)}}
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
        {(overdueSpace.length > 0 || adminOverdueSpace.length > 0) ? (
          (userId?.role === "owner" ? adminOverdueSpace : overdueSpace).map((spaceName, index) => (
            <p
              key={index}
              className="bg-[#294480] text-white py-2 px-4 rounded-lg"
            >
              {spaceName.space_name}
            </p>
          ))
        ) : (
          <p className="text-gray-500">No spaces available</p>
        )}
      </div>
    </main>
  );
}
