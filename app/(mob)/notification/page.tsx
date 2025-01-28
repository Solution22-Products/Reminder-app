"use client";
import { useGlobalContext } from "@/context/store";
import { supabase } from "@/utils/supabase/supabaseClient";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import smile from "@/public/images/smile-img.png";
import profile from "@/public/images/img-placeholder.svg";
import './style.css';

interface NotificationProps {
  notificationTrigger: any;
}

const Notification = () => {
  const { userId } = useGlobalContext();
  const [unNotifiedTask, setUnNotifiedTask] = useState<any[]>([]);
  const [adminTaskNotify, setAdminTaskNotify] = useState<any[]>([]);
  const [isRemoving, setIsRemoving] = useState<Record<number, boolean>>({});

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
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }, 300); // Duration matches the animation time
  };

  useEffect(() => {
    getUnnotifiedTasks();
  }, [userId]);
  return (
    <div className="w-full h-full p-[18px]">
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Notification</h1>
        <Image
          src={userId?.profile_image || profile}
          width={44}
          height={44}
          alt="User Image"
          className="rounded-full border border-[#D6D6D6]"
        />
      </div>
      <div className="w-full  h-[calc(100vh-185px)] overflow-y-scroll playlist-scroll">
      <div className="w-full flex flex-col justify-between items-center">
        {(userId?.role === "owner" ? adminTaskNotify : unNotifiedTask).length >
        0 ? (
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
                        .map((mention: string) => mention.split("@").join(" "))
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
        <p className="text-[#A7A7AB] text-[12px]">That's all for today !!!!</p>
      </div>
      </div>
    </div>
  );
};
export default Notification;
