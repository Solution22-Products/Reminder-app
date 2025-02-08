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
  access : { space: boolean; team: boolean; task: boolean; all: boolean };
}

interface props {
  notifyMobTrigger : any;
  setNotifyMobTrigger : any
  test : any;
  setTest : any
}

const Footer : React.FC<props> = ({notifyMobTrigger, setNotifyMobTrigger, test, setTest }) => {
  const pathname = usePathname();
  const route = useRouter();
  const [userId, setUserId] = useState<UserData | null>(null);
  const [unNotifiedTask, setUnNotifiedTask] = useState<any[]>([]);
  const [adminTaskNotify, setAdminTaskNotify] = useState<any[]>([]);

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

    useEffect(() => {
      getUnnotifiedTasks();
    },[userId, notifyMobTrigger, test]);

  return (
    <footer className="fixed  z-[1] bottom-0 w-full h-[83px] pt-[12px] pb-[30px]  border border-gray-300 bg-white flex justify-around items-center">
      {/* Home Link */}

      <div
        className="flex flex-col items-center"
        onClick={() => route.push("/home")}
      >
        <House
          className={`w-[22px] h-[22px] ${
            isActive("/home") ? "text-primaryColor-700" : "text-gray-400"
          } hover:text-[#1A56DB]`}
          style={{
            transition: "color 0.2s ease-in-out, text-shadow 0.2s ease-in-out",
            ...(isActive("/home") && {
              textShadow: "0 0 8px #1A56DB, 0 0 15px #1A56DB",
            }),
          }}
        />
        <p
          className={`font-inter font-medium text-xs  ${
            isActive("/home") ? "text-[#1A56DB]" : "text-gray-400"
          } hover:text-[#1A56DB]`}
          style={{
            transition: "color 0.2s ease-in-out",
          }}
        >
          Home
        </p>
      </div>

      {/* Task Link */}
      <div
        className="flex flex-col items-center"
        onClick={() => route.push("/task")}
      >
        <ListChecks
          className={`w-[22px] h-[22px] ${
            isActive("/task") ? "text-[#1A56DB]" : "text-gray-400"
          } hover:text-[#1A56DB]`}
          style={{
            transition: "color 0.2s ease-in-out, text-shadow 0.2s ease-in-out",
            ...(isActive("/task") && {
              textShadow: "0 0 8px #1A56DB, 0 0 15px #1A56DB",
            }),
          }}
        />
        <p
          className={`font-inter font-medium text-xs ${
            isActive("/task") ? "text-[#1A56DB]" : "text-gray-400"
          } hover:text-[#1A56DB]`}
          style={{
            transition: "color 0.2s ease-in-out",
          }}
        >
          Task
        </p>
      </div>

      {/* Notification Link */}
      <div
        className="flex flex-col items-center relative"
        onClick={() => route.push("/notification")}
      >
        <BellDot
          className={`w-[22px] h-[22px] ${
            isActive("/notification") ? "text-[#1A56DB]" : "text-gray-400"
          } hover:text-[#1A56DB]`}
          style={{
            transition: "color 0.2s ease-in-out, text-shadow 0.2s ease-in-out",
            ...(isActive("/notification") && {
              textShadow: "0 0 8px #1A56DB, 0 0 15px #1A56DB",
            }),
          }}
        />
        <span className="absolute -top-0.5 right-[15px] bg-red-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] text-white">
            {userId?.role === "owner"
              ? adminTaskNotify.length
              : unNotifiedTask.length}
          </span>
        <p
          className={`font-inter font-medium text-xs ${
            isActive("/notification") ? "text-[#1A56DB]" : "text-gray-400"
          } hover:text-[#1A56DB]`}
          style={{
            transition: "color 0.2s ease-in-out",
          }}
        >
          Notification
        </p>
      </div>
    </footer>
  );
};

export default Footer;
