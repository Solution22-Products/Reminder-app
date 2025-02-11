"use client";
import { usePathname, useRouter } from "next/navigation";
import { ListChecks } from "lucide-react";
import { House } from "lucide-react";
import { BellDot } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useGlobalContext } from "@/context/store";
import { getLoggedInUserData } from "@/app/(signin-setup)/sign-in/action";

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  mobile: string;
  password: string;
  profile_image: string;
  entity_name: string;
  access: { space: boolean; team: boolean; task: boolean; all: boolean };
}

// interface props {
//   notifyMobTrigger : any;
//   setNotifyMobTrigger : any
//   test : any;
//   setTest : any
// }

const Footer = () => {
  const pathname = usePathname();
  const route = useRouter();
  const [userId, setUserId] = useState<UserData | null>(null);
  const [unNotifiedTask, setUnNotifiedTask] = useState<any[]>([]);
  const [adminTaskNotify, setAdminTaskNotify] = useState<any[]>([]);
  const [addLoader, setAddLoader] = useState<string[]>([]);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await getLoggedInUserData();

        if (!user?.id) {
          console.log("No logged-in user found");
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("userId", user?.id) // Ensure the key matches the actual column name in your table
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }

        setUserId(data);
      } catch (error) {
        console.error("Unexpected error fetching user:", error);
      }
    };

    getUser();
  }, []);

  const getUnnotifiedTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("notify_read", false)
        .eq("is_deleted", false);

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      if (data) {
        const filteredTasks = data.filter(
          (item: any) =>
            Array.isArray(item.mentions) &&
            item.mentions.some((mention: string) =>
              mention.includes(`@${userId?.entity_name}`)
            )
        );

        setAdminTaskNotify(
          data.filter((item: any) => Array.isArray(item.mentions))
        );
        setUnNotifiedTask(filteredTasks);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handleSpaceClick = (spaceId: any) => {
    setAddLoader((prev: any) => [...prev, spaceId]);
    (prev: any) => prev.filter((id: any) => id !== spaceId);
    route.push(`/${spaceId}`);
  };

  useEffect(() => {
    getUnnotifiedTasks();
  }, [userId]);

  return (
    <footer className="fixed  z-[1] bottom-0 w-full h-[83px] pt-[12px] pb-[30px]  border border-gray-300 bg-white flex justify-around items-center">
      {/* Home Link */}

      <div
        className={`flex flex-col items-center cursor-pointer group ${
          isActive("/home") ? "text-[#1A56DB]" : "text-gray-400"
        }`}
        style={addLoader.includes("home") ? { pointerEvents: "none" } : {}}
        onClick={() => handleSpaceClick("home")}
      >
        {addLoader.includes('home') ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            key="task"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="#1A56DB"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="#1A56DB"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
        <div className="w-full flex flex-col items-center">
        <House className="w-[22px] h-[22px] group-hover:text-[#1A56DB] transition-all duration-200" />
        <p className="font-inter font-medium text-xs group-hover:text-[#1A56DB] transition-all duration-200">
          Home
        </p>
        </div>
        )}
      </div>

      <div
        className={`flex flex-col items-center cursor-pointer group ${
          isActive("/task") ? "text-[#1A56DB]" : "text-gray-400"
        }`}
        style={addLoader.includes("task") ? { pointerEvents: "none" } : {}}
        onClick={() => handleSpaceClick("task")}
      >
        {addLoader.includes('task') ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            key="task"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="#1A56DB"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="#1A56DB"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <div>
            <ListChecks className="w-[22px] h-[22px] group-hover:text-[#1A56DB] transition-all duration-200" />
            <p className="font-inter font-medium text-xs group-hover:text-[#1A56DB] transition-all duration-200">
              Task
            </p>
          </div>
        )}
      </div>

      <div
        className={`flex flex-col items-center cursor-pointer group relative ${
          isActive("/notification") ? "text-[#1A56DB]" : "text-gray-400"
        }`}
        style={addLoader.includes("notification") ? { pointerEvents: "none" } : {}}
        onClick={() => handleSpaceClick("notification")}
      >
        {addLoader.includes('notification') ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            key="task"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="#1A56DB"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="#1A56DB"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
        <div className="flex flex-col items-center">
        <BellDot className="w-[22px] h-[22px] group-hover:text-[#1A56DB] transition-all duration-200" />
        <span className="absolute -top-0.5 right-[15px] bg-red-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] text-white">
          {userId?.role === "owner"
            ? adminTaskNotify.length
            : unNotifiedTask.length}
        </span>
        <p className="font-inter font-medium text-xs group-hover:text-[#1A56DB] transition-all duration-200">
          Notification
        </p>
        </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
