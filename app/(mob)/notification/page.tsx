"use client";
import { useGlobalContext } from "@/context/store";
import { supabase } from "@/utils/supabase/supabaseClient";
import { LogOut, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import Image from "next/image";
import smile from "@/public/images/smile-img.png";
import profile from "@/public/images/img-placeholder.svg";
import "./style.css";
import { useRouter } from "next/navigation";
import { logout } from "@/app/(signin-setup)/logout/action";
import { OverdueListSkeleton } from "@/app/(web)/components/skeleton-ui";
import Footer from "../footer/page";

// interface NotificationProps {
//   notifyMobTrigger : any
//   setNotifyMobTrigger : any
// }

const Notification = () => {
  const { userId} = useGlobalContext();
  const route = useRouter();
  const [unNotifiedTask, setUnNotifiedTask] = useState<any[]>([]);
  const [adminTaskNotify, setAdminTaskNotify] = useState<any[]>([]);
  const [isRemoving, setIsRemoving] = useState<Record<number, boolean>>({});
  const [selectOpen, setSelectOpen] = useState(false);
  const [profileLoader, setProfileLoader] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(false);

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

  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingOut(true); // Show loader when logging out
    await logout();
    setIsLoggingOut(false); // Hide loader after logout completes
  };

  const handleCheckNotification = async (id: number) => {
    setIsRemoving((prev) => ({ ...prev, [id]: true }));

    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("tasks")
          .update({ notify_read: true })
          .eq("id", id);

        if (error) {
          console.error("Error updating notify_read:", error);
          return;
        }

        setUnNotifiedTask((prev) => prev.filter((task) => task.id !== id));
        setAdminTaskNotify((prev) => prev.filter((task) => task.id !== id));
        setIsRemoving((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        setTest((prev) => !prev);
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }, 300); // Duration matches the animation time
  };

  const handleClearNotification = async () => {
    const tasksToUpdate =
      userId?.role === "owner" ? adminTaskNotify : unNotifiedTask;
    const taskIds = tasksToUpdate.map((task: any) => task.id);

    tasksToUpdate.forEach((task: any) => {
      setIsRemoving((prev) => ({ ...prev, [task.id]: true }));
    });

    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("tasks")
          .update({ notify_read: true })
          .in("id", taskIds);

        if (error) {
          console.error("Error clearing notifications:", error);
          return;
        }

        if (userId?.role === "owner") {
          setAdminTaskNotify([]);
        } else {
          setUnNotifiedTask([]);
        }

        setIsRemoving({});
        setTest((prev) => !prev);
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }, 300); // Duration matches the animation time
  };

  useEffect(() => {
    getUnnotifiedTasks();
  }, [userId, test]);

  useEffect(() => {
    const redirectToTask = () => {
      route.push("/notification");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
      setLoading(false);
      return;
    } else {
      route.push("/dashboard");
      setLoading(false);
    }
  }, [route]);

  return (
    <>
    <div className="w-full h-full p-[18px]">
      <div className="w-full flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Notification</h1>
        <Select open={selectOpen} onOpenChange={setSelectOpen}>
          <SelectTrigger className="w-auto h-[44px] border-none focus-visible:border-none focus-visible:outline-none text-sm font-bold shadow-none pl-2 justify-start gap-1">
            <div className="flex items-center">
              <Image
                src={userId?.profile_image || profile}
                width={44}
                height={44}
                alt="User Image"
                className="rounded"
              />
            </div>
          </SelectTrigger>
          <SelectContent className="w-[150px] py-3">
            {/* <div className="py-3 my-3 text-gray-700 border-t border-b border-gray-200 px-3 cursor-pointer"> */}
            <p
              onClick={() => {
                setProfileLoader(true);
                setTimeout(() => {
                  route.push("/profile");
                  setProfileLoader(false);
                }, 1000);
              }}
              className={`text-sm pb-3 mb-3 pl-3.5 border-b border-gray-300 font-medium cursor-pointer`}
            >
              {profileLoader ? (
                <svg
                  className="animate-spin h-5 w-5 m-auto"
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
                    className="opacity-100"
                    fill="#1A56DB"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Your Profile"
              )}
            </p>
            {/* </div> */}
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
                        <div className="ml-20 flex items-center justify-center text-center">
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
                        <p className="text-sm text-[#F05252] px-3 flex items-center gap-2 cursor-pointer">
                          <LogOut size={20} />
                          Sign Out
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
          </SelectContent>
        </Select>
      </div>
      <div className="w-full  h-[calc(100vh-185px)] overflow-y-scroll playlist-scroll">
        {loading ? (
          <OverdueListSkeleton />
        ) : (
          <div className="w-full flex flex-col justify-between items-center">
            {(userId?.role === "owner" ? adminTaskNotify : unNotifiedTask)
              .length > 0 ? (
              (userId?.role === "owner" ? adminTaskNotify : unNotifiedTask).map(
                (item: any) => (
                  <div
                    key={item.id}
                    className={`w-full flex justify-between items-center mb-2 border rounded-[10px] border-[#E1E1E1] pb-2 transition-all duration-300 px-2.5 bg-white ${
                      isRemoving[item.id] ? "opacity-0 -translate-x-10" : ""
                    }`}
                  >
                    <div className="w-[80%]">
                      <p className="text-sm text-[#A6A6A7] font-medium font-geist pt-2">
                        {format(new Date(item.created_at), "dd MMMM, yyyy")}
                      </p>
                      <p className="pt-1 text-sm">
                        <span className="text-base font-semibold">
                          {item.created_by}
                        </span>{" "}
                        assigned task to
                        <span className="font-bold text-sm">
                          {item.mentions
                            .map((mention: string) =>
                              mention.split("@").join(" ")
                            )
                            .join(", ")}
                        </span>{" "}
                      </p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <X
                            size={16}
                            className="cursor-pointer"
                            onClick={() => handleCheckNotification(item.id)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark as read</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              )
            ) : (
              <p className="py-2 text-base text-gray-500 h-[90vh] flex justify-center items-center">
                No notifications found.
              </p>
            )}
          </div>
        )}

        {userId?.role === "User" && unNotifiedTask.length > 0 && (
          <div className="w-full flex gap-2 pb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className="text-sm text-[#1A56DB] ml-auto cursor-pointer underline sticky bottom-0"
                    onClick={handleClearNotification}
                  >
                    Clear all
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        {userId?.role === "owner" && adminTaskNotify.length > 0 && (
          <div className="w-full flex gap-2 pb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className="text-sm text-[#1A56DB] ml-auto cursor-pointer underline sticky bottom-0"
                    onClick={handleClearNotification}
                  >
                    Clear all
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as read</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <div className="flex justify-center items-center py-5 font-geist gap-1">
          <Image
            src={smile}
            alt="smile-img"
            width={300}
            height={300}
            className="w-[42px] h-[42px] grayscale"
          />
          <p className="text-[#A7A7AB] text-[12px]">
            That's all for today !!!!
          </p>
        </div>
      </div>

      
    </div>
    <Footer
        //  notifyMobTrigger = {notifyMobTrigger} setNotifyMobTrigger = {setNotifyMobTrigger} test = {''} setTest={''}
         />
    </>
  );
};
export default Notification;
