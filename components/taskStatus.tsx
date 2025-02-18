import { useGlobalContext } from "@/context/store";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useEffect, useState } from "react";

export default function TaskStatus() {
  const { userId } = useGlobalContext();

  const [taskDetails, setTaskDetails] = useState<any[]>([]);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [overdueTasks, setOverdueTasks] = useState<number>(0);
  const [adminOverdueTasks, setAdminOverdueTasks] = useState<number>(0);

  const taskData = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false);
    if (error) {
      console.log(error);
    }

    if (data) {
      const includesTrueTasks = data.filter((task) =>
        task?.mentions?.includes(`@${userId?.entity_name}`)
      );

      setTaskDetails(includesTrueTasks);

      setCompletedTasks(
        data
          .map((task) => task.task_status)
          .filter((task) => task === "Completed").length
      );
      // Count overdue tasks
      const now = new Date().getTime();
      const overdue = data.filter(
        (task) => new Date(task.due_date).getTime() < now && task.task_status !== "Completed"
      ).length;
      const adminOverdue = includesTrueTasks.filter(
        (task) => new Date(task.due_date).getTime() < now && task.task_status !== "Completed"
      ).length;
      setOverdueTasks(overdue);
      setAdminOverdueTasks(adminOverdue);
      setTotalTasks(data.length);
    }
  };

  useEffect(() => {
    taskData();
  }, [totalTasks, completedTasks, overdueTasks, taskDetails]);

  return (
    <div className="w-full flex space-x-2 px-[18px] py-[18px]">
      <div className="rounded-xl bg-white shadow w-2/6">
        <div className="flex flex-col items-center h-[110.33px] w-[88px]  rounded-[14px] justify-evenly">
          <span className="text-sm text-[12px] font-[600] text-[#000000]">
            Task <br></br>Created
          </span>
          <span className="text-[#14B8A6] text-xl font-bold">
            {userId?.role === "owner" ? totalTasks : taskDetails.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-evenly rounded-[14px] bg-white items-center w-2/6 ">
        <span className="text-sm text-[12px] font-[600] text-[#000000]">
          Task<br></br> Completed
        </span>
        <span className="text-[#9ACC67] text-xl font-bold">{userId?.role === "owner" ? completedTasks : taskDetails.filter((task) => task.task_status === "Completed").length}</span>
      </div>

      <div className="flex flex-col justify-evenly rounded-[14px] bg-white items-center w-2/6">
        <span className=" text-sm text-[12px] font-[600] text-[#000000]">
          Task <br></br>Overdue
        </span>
        <span className="text-[#EE5A5A] text-xl font-bold">{userId?.role === "owner" ? overdueTasks : adminOverdueTasks}</span>
      </div>
    </div>
  );
}
