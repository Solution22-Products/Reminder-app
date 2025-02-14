"use client";

import { OverdueSkeleton } from "@/app/(web)/components/skeleton-ui";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useGlobalContext } from "@/context/store";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Task {
  id: number;
  team_id: number;
  team_name?: string;
  mentions?: string;
  task_content?: string;
  due_date: string;
  task_status: string;
  time?: string;
}

interface OverDueProps {
  taskTrigger: any;
}

const OverDue: React.FC<OverDueProps> = ({ taskTrigger }) => {
  const { userId } = useGlobalContext();
  const router = useRouter();
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [adminOverdueTasks, setAdminOverdueTasks] = useState<Task[]>([]);
  const [taskLoading, setTaskLoading] = useState(true);

  const fetchTaskData = async () => {
    try {
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*, team_name:teams(team_name)")
        .eq("is_deleted", false);

      if (taskError) throw taskError;

      const now = Date.now();
      
      const filteredTasks = taskData
        .map((task: any) => ({ ...task, team_name: task.team_name?.team_name }))
        .filter(
          (task) =>
            new Date(task.due_date).getTime() < now &&
            task.mentions?.includes(`@${userId?.entity_name}`)
        );

      const adminOverdue = taskData
        .map((task: any) => ({ ...task, team_name: task.team_name?.team_name }))
        .filter((task) => new Date(task.due_date).getTime() < now);

      setOverdueTasks(filteredTasks);
      setAdminOverdueTasks(adminOverdue);
    } catch (err) {
      console.error("Error fetching task data:", err);
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [userId, taskTrigger]);

  const tasksToShow = userId?.role === "owner" ? adminOverdueTasks : overdueTasks;

  return (
    <div className="px-[18px] font-geist">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold text-black">Overdue Tasks</h4>
        <p
          className="text-[#1A56DB] font-medium text-sm cursor-pointer"
          onClick={() => router.push("/overdue-task")}
        >
          View all
        </p>
      </div>

      {taskLoading ? (
        <OverdueSkeleton />
      ) : tasksToShow.length === 0 ? (
        <p className="text-center text-base pt-8">No Overdue Tasks</p>
      ) : (
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent>
            {tasksToShow.map((task) => (
              task.task_content && task.team_name && (
                <CarouselItem
                  key={task.id}
                  className="basis-[62%] md:basis-auto lg:basis-1/3 flex-none pl-2"
                >
                  <div className="p-1 w-[260px]">
                    <Card>
                      <CardContent className="aspect-square p-3 w-full flex flex-col justify-between h-[186px]">
                        <div className="w-full">
                          <div className="flex justify-between items-center">
                            <p className="text-[#737373] bg-[#F4F4F8] text-sm font-semibold px-3 py-0.5 rounded-full">
                              {task.team_name.length > 15
                                ? task.team_name.slice(0, 15) + "..."
                                : task.team_name}
                            </p>
                            <p className="text-[12px] text-[#A6A6A7] font-medium">
                              {task.time || ""}
                            </p>
                          </div>
                          <p className="text-black mt-2 text-sm">
                      <span className="font-semibold inline-block">
                      {Array.isArray(task.mentions) ? task.mentions.map((mention: string) => `${mention}`).join(" ") : task.mentions}
                      </span>{" "}
                      
                      {task.task_content.length > 40  ? task.task_content.slice(0, 40) + "..." : task.task_content}
                    </p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
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
                                : task.task_status === "Internal feedback"
                                ? "text-[#142D57] bg-[#DEE9FC]"
                                : "text-[#3FAD51] bg-[#E5F8DA]"
                            }`}
                          >
                            {task.task_status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              )
            ))}
          </CarouselContent>
        </Carousel>
      )}
    </div>
  );
};

export default OverDue;
