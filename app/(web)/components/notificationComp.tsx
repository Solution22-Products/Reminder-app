import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useGlobalContext } from "@/context/store";
import { supabase } from "@/utils/supabase/supabaseClient";
import { BellDot, X } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationProps {
  notificationTrigger: any;
}

const Notification: React.FC<NotificationProps> = ({ notificationTrigger }) => {
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
  }, [userId, notificationTrigger]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-[40px] rounded-[10px] h-[42px] relative"
        >
          <BellDot className="w-6 h-6" />{" "}
          <span className="absolute -top-1 -right-0.5 bg-red-500 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] text-white">
            {userId?.role === "owner"
              ? adminTaskNotify.length
              : unNotifiedTask.length}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="font-inter" style={{ maxWidth: "500px" }}>
        <SheetHeader>
          <SheetTitle className="text-[#6B7280] text-base -mt-3">
            NOTIFICATIONS
          </SheetTitle>
        </SheetHeader>
        <div className="w-full h-full pt-3">
          <div className="w-full max-h-[88vh] flex flex-col justify-between items-center overflow-y-scroll playlist-scroll">
            {(userId?.role === "owner" ? adminTaskNotify : unNotifiedTask)
              .length > 0 ? (
              (userId?.role === "owner" ? adminTaskNotify : unNotifiedTask).map(
                (item: any) => (
                  <div
                    key={item.id}
                    className={`w-full flex justify-between items-center mb-2 border-b border-gray-200 pb-2 transition-all duration-300 ${
                      isRemoving[item.id] ? "opacity-0 -translate-x-10" : ""
                    }`}
                  >
                    <div className="w-[80%]">
                      <p className="pt-2 text-sm">
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
                      <p className="text-sm text-[#A6A6A7] font-inter">
                        {format(
                          new Date(item.created_at),
                          "EEEE, MMMM dd, yyyy 'at' hh:mm a"
                        )}
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
            <SheetFooter className="w-full flex gap-2 pb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p
                      className="text-sm text-[#1A56DB] cursor-pointer underline sticky bottom-0"
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
            </SheetFooter>
          )}
          {userId?.role === "owner" && adminTaskNotify.length > 0 && (
            <SheetFooter className="w-full flex gap-2 pb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p
                      className="text-sm text-[#1A56DB] cursor-pointer underline sticky bottom-0"
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
            </SheetFooter>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Notification;
