"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ClipboardList, Kanban, LayoutDashboard, LogOut } from "lucide-react";
import Notification from "@/app/(web)/components/notificationComp";
import Image from "next/image";
import { useGlobalContext } from "@/context/store";
import { getLoggedInUserData } from "@/app/(signin-setup)/sign-in/action";
import { supabase } from "@/utils/supabase/supabaseClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { logout } from "@/app/(signin-setup)/logout/action";
import SidebarNotification from "@/app/(web)/components/sidebarNotify";
import { Button } from "./ui/button";

interface ProfileData {
  username: string;
  email: string;
  profile_image: string;
  role: string;
}

const WebSidebar = () => {
  const { userId } = useGlobalContext();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [sideNotifyTrigger, setSideNotifyTrigger] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} className="mr-2" />,
    },
    {
      label: "Task View",
      path: "/admin-view",
      icon: <ClipboardList size={20} className="mr-2" />,
    },
    {
      label: "Kanban View",
      path: "/canban-view",
      icon: <Kanban size={20} className="mr-2" />,
    },
  ];

  const handleNavigation = (path: string) => {
    if (pathname === path) return;
    setLoading(true);
    startTransition(() => {
      router.push(path);
    });
  };

  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingOut(true); // Show loader when logging out
    await logout();
    setIsLoggingOut(false); // Hide loader after logout completes
  };

  useEffect(() => {
    const getUser = async () => {
      const user = await getLoggedInUserData();
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("userId", user.id)
        .single();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      setProfile(data);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="flex flex-col justify-between h-screen">
      <div>
        <div className="border-b border-zinc-300 py-1 pb-2">
          <img
            src="/images/s22_remain.png"
            alt="Logo"
            className="cursor-pointer w-[120px] ml-[25px]"
            onClick={() => handleNavigation("/dashboard")}
          />
        </div>

        <div className="flex flex-col space-y-4 mt-4 px-3">
          {navItems.map(({ label, path, icon }) => {
            const isActive = pathname === path;
            return (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                className={`flex items-center text-sm font-medium px-3 py-2 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 rounded-[10px] text-white shadow"
                    : "hover:text-blue-600"
                }`}
              >
                {icon}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        {/* <Notification notificationTrigger="" /> */}
        <SidebarNotification notifyTrigger={sideNotifyTrigger} />
        <div className="flex items-center justify-between gap-2 px-[12px] mt-2 py-4">
          <div className="flex items-center gap-2">
            {profile?.profile_image && (
              <Image
                src={profile.profile_image}
                alt="Logo"
                width={38}
                height={38}
                className="w-[38px] h-[38px] rounded-full"
              />
            )}
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="p-0 border-none m-0 text-md font-bold hover:bg-transparent h-fit shadow-none">
                      {profile?.username
                        ? profile.username.length > 8
                          ? profile.username.slice(0, 6) + "..."
                          : profile.username
                        : "Guest"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{profile?.username}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {/* <p className="text-md font-bold m-0 p-0">
                {profile?.username
                  ? profile.username.length > 8
                    ? profile.username.slice(0, 6) + "..."
                    : profile.username
                  : "Guest"}
              </p> */}
              <p className="text-sm font-medium text-zinc-500 -mt-1 p-0 capitalize">
                {profile?.role}
              </p>
            </div>
          </div>
          <>
            <form onSubmit={handleLogout} className="flex">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      typeof="submit"
                      className="rounded bg-button_orange text-white cursor-pointer hover:bg-button_orange relative"
                      style={isLoggingOut ? { pointerEvents: "none" } : {}}
                    >
                      {isLoggingOut ? (
                        <div className=" flex items-center justify-center text-center">
                          <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
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
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-400 flex items-center gap-2 cursor-pointer">
                          <LogOut size={18} />
                        </p>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>
          </>
        </div>
      </div>

      {(loading || isPending) && (
        <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default WebSidebar;
