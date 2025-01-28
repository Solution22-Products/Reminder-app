 "use client";
import { useGlobalContext } from "@/context/store";
import Image from "next/image";
import profile from "@/public/images/img-placeholder.svg";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { OverdueListSkeleton } from "@/app/(web)/components/skeleton-ui";
import "./style.css";
import { useRouter } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OverdueTaskPage = () => {
  const { userId } = useGlobalContext();
  const route = useRouter();
  const [overdueTasks, setOverdueTasks] = useState<any>([]);
  const [adminOverdueTasks, setAdminOverdueTasks] = useState<any>([]);
  const [taskLoading, setTaskLoading] = useState(true);
  const [date, setDate] = useState<Date>();
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>("");

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

        const now = new Date().getTime();

        const filteredTasks = taskData
          .map((task) => {
            const team = teamData.find((team) => team.id === task.team_id);
            const space = spaceData.find((space) => space.id === task.space_id);
            if (
              team &&
              space &&
              task.mentions?.includes(`@${userId?.entity_name}`)
            ) {
              return {
                ...task,
                team_name: team.team_name,
                space_name: space.space_name,
              };
            }
            return null;
          })
          .filter(Boolean);

        const overdue = filteredTasks.filter(
          (task) => new Date(task.due_date).getTime() < now
        );

        const adminOverdue = taskData
          .map((task) => {
            const team = teamData.find((team) => team.id === task.team_id);
            const space = spaceData.find((space) => space.id === task.space_id);
            return team && space
              ? {
                  ...task,
                  team_name: team.team_name,
                  space_name: space.space_name,
                }
              : null;
          })
          .filter((task) => task && new Date(task.due_date).getTime() < now);

        setOverdueTasks(overdue);
        setAdminOverdueTasks(adminOverdue);
        setTaskLoading(false);
      }
    } catch (err) {
      console.error("Error fetching task data:", err);
      setTaskLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };

    return date.toLocaleDateString("en-GB", options); // 'en-GB' gives the format "23 Aug 2024"
  };

  const handleUpdateTask = async (id: number) => {
    try {
      // Fetch the task data
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false);
  
      if (taskError) throw new Error("Failed to fetch task details");
  
      if (!taskData || taskData.length === 0) {
        console.error("Task not found");
        return;
      }
  
      const currentTask = taskData[0];
  
      // Prepare updated fields
      const updatedFields: { due_date?: string; task_status?: string } = {};
  
      if (date) {
        updatedFields.due_date = formatDate(date as Date);
      } else {
        updatedFields.due_date = currentTask.due_date; // Keep the old value if no new date is provided
      }
  
      if (taskStatus) {
        updatedFields.task_status = taskStatus;
      } else {
        updatedFields.task_status = currentTask.task_status; // Keep the old value if no new status is provided
      }
  
      // Update the task
      const { error } = await supabase
        .from("tasks")
        .update(updatedFields)
        .eq("id", id);
  
      if (error) throw new Error("Failed to update the task");
  
      // Refresh task data and reset state
      fetchTaskData();
      setOpenTaskId(null);
      setDate(undefined);
  
      // Send a success notification
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Overdue Task Update", {
            body: "The overdue task has been updated successfully!",
            icon: "/path/to/icon.png", // Optional
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("Overdue Task Update", {
                body: "The overdue task has been updated successfully!",
                icon: "/path/to/icon.png", // Optional
              });
            }
          });
        }
      }
    } catch (err : any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong. Please try again.",
        duration: 3000,
      });
    }
  };  

  useEffect(() => {
    fetchTaskData();

    if (overdueTasks.length > 0 || adminOverdueTasks.length > 0) {
      setTimeout(() => {
        setTaskLoading(false);
      }, 1000);
    }
  }, [userId]);

  useEffect(() => {
    const redirectToTask = () => {
      route.push("/overdue-task");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
    } else {
      route.push("/dashboard");
    }
  }, [route]);

  if (taskLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div id="wifi-loader">
          <svg className="circle-outer" viewBox="0 0 86 86">
            <circle className="back" cx="43" cy="43" r="40"></circle>
            <circle className="front" cx="43" cy="43" r="40"></circle>
            <circle className="new" cx="43" cy="43" r="40"></circle>
          </svg>
          <svg className="circle-middle" viewBox="0 0 60 60">
            <circle className="back" cx="30" cy="30" r="27"></circle>
            <circle className="front" cx="30" cy="30" r="27"></circle>
          </svg>
          <svg className="circle-inner" viewBox="0 0 34 34">
            <circle className="back" cx="17" cy="17" r="14"></circle>
            <circle className="front" cx="17" cy="17" r="14"></circle>
          </svg>
          <div className="text" data-text="Loading"></div>
        </div>
      </div>
    ); // Simple loader UI
  }

  return (
    <main className="p-[18px] pb-0">
      <Toaster />
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Overdue Task</h1>
        <Image
          src={userId?.profile_image || profile}
          width={44}
          height={44}
          alt="User Image"
          className="rounded-full border border-[#D6D6D6]"
        />
      </div>

      <div className="w-full h-[calc(100vh-170px)] overflow-y-scroll playlist-scroll">
        {taskLoading ? (
          <OverdueListSkeleton />
        ) : adminOverdueTasks.length === 0 || overdueTasks.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-[#A6A6A7] text-lg font-medium">
              No Overdue Task
            </p>
          </div>
        ) : (
          (userId?.role === "owner" ? adminOverdueTasks : overdueTasks).map(
            (task: any, index: number) => (
              <div key={index}>
                <div
                  onClick={() => setOpenTaskId(task.id)}
                  className="p-3 w-full bg-white border border-[#E1E1E1] mb-3 rounded-[10px] cursor-pointer"
                >
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <p className="text-[#737373] bg-[#F4F4F8] text-sm font-semibold px-2 py-0.5 rounded-full">
                          {task.team_name}
                        </p>
                        <p className="text-[#737373] bg-[#F4F4F8] text-sm font-semibold px-2 py-0.5 rounded-full">
                          {task.space_name}
                        </p>
                      </div>
                      <p className="text-[12px] text-[#A6A6A7] font-medium">
                        {task.time}
                      </p>
                    </div>
                    <p className="text-black mt-2 text-sm">
                      <span className="font-semibold inline-block">
                        {task.mentions}
                      </span>{" "}
                      {task.task_content}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-red-500 font-bold text-[12px]">
                      {new Date(task.due_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`rounded-3xl text-sm font-semibold py-1.5 px-2 ${
                        task.task_status === "todo"
                          ? "text-reddish bg-[#F8DADA]"
                          : task.task_status === "In progress"
                          ? "text-[#EEA15A] bg-[#F8F0DA]"
                          : task.task_status === "feedback"
                          ? "text-[#142D57] bg-[#DEE9FC]"
                          : "text-[#3FAD51] bg-[#E5F8DA]"
                      }`}
                    >
                      {task.task_status}
                    </span>
                  </div>
                </div>

                {openTaskId === task.id && (
                  <Drawer
                    open={openTaskId === null ? false : true}
                    onOpenChange={() => setOpenTaskId(null)}
                  >
                    <DrawerContent className="px-4">
                      <DrawerHeader className="flex justify-between items-center px-0">
                        <DrawerTitle>Update task</DrawerTitle>
                        {
                          userId?.role === "User" &&
                          task.task_status === "Completed" ? (
                          <Button className="w-[120px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none text-[#3FAD51] bg-[#E5F8DA] hover:bg-[#E5F8DA] hover:text-[#3FAD51]">
                            Completed
                          </Button>
                        ) : (
                          <Select
                            defaultValue={task.task_status || "todo"}
                            onValueChange={(value) => setTaskStatus(value)}
                          >
                            <SelectTrigger
                              className={`w-[120px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none ${
                                task.task_status === "todo"
                                  ? "text-reddish bg-[#F8DADA]"
                                  : task.task_status ===
                                    "In progress"
                                  ? "text-[#EEA15A] bg-[#F8F0DA]"
                                  : task.task_status ===
                                    "feedback"
                                  ? "text-[#142D57] bg-[#DEE9FC]"
                                  : "text-[#3FAD51] bg-[#E5F8DA]"
                              }`}
                            >
                              <SelectValue placeholder="status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="todo">
                                To Do
                              </SelectItem>
                              <SelectItem value="In progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="feedback">
                                Feedback
                              </SelectItem>
                              {userId?.role ===
                                "owner" && (
                                <SelectItem value="Completed">
                                  Completed
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>)
                        }
                      </DrawerHeader>
                      <div className="p-4 border border-[#CECECE] rounded-[10px]">
                        <p>
                          <span className="text-[#BA6A6A]">
                            @{task.space_name}
                          </span>{" "}
                          <span className="text-[#5898C6]">
                            @{task.team_name}
                          </span>{" "}
                          <span className="text-[#518A37]">
                            {task.mentions}
                          </span>{" "}
                          {task.task_content}
                        </p>
                      </div>
                      <div className="w-full flex items-center gap-3 mt-5 mb-8">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-1/2 justify-center text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              {/* <CalendarIcon /> */}
                              {date ? (
                                format(date, "PPP")
                              ) : (
                                <span>{task.due_date}</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Button
                          className="bg-[#1A56DB] text-white hover:bg-[#1A56DB] font-medium text-sm text-center shadow-none w-1/2 rounded-[10px]"
                          onClick={() => handleUpdateTask(task.id)}
                        >
                          Update
                        </Button>
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
              </div>
            )
          )
        )}
      </div>
    </main>
  );
};

export default OverdueTaskPage;
