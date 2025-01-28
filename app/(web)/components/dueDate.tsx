import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { supabase } from "@/utils/supabase/supabaseClient";

interface TaskDateUpdaterProps {
  team: any;
  task: any;
  fetchTasks: () => void;
  taskStatus: boolean;
}

const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  return date.toLocaleDateString("en-GB", options); // e.g., '23 Aug 2024'
};

const TaskDateUpdater: React.FC<TaskDateUpdaterProps> = ({
  team,
  task,
  fetchTasks,
  taskStatus,
}) => {
  const [currentDate, setCurrentDate] = useState<Date | null>(
    task.due_date ? new Date(task.due_date) : null
  );

  useEffect(() => {
    if (task.due_date) {
      setCurrentDate(new Date(task.due_date));
    } else {
      setCurrentDate(new Date()); // Set to today's date if no due date
    }
  }, [task.due_date, task.id]);

  const handleExpireDateChange = async (date: Date | null) => {
    if (!date) return;

    try {
      const formattedDate = formatDate(date); // Format the date as needed
      const { data, error } = await supabase
        .from("tasks")
        .update({ due_date: formattedDate })
        .eq("id", task.id)
        .eq("team_id", team.id);

      if (error) throw error;

      if (data) {
        console.log("Due date updated:", data);
        setCurrentDate(date); // Update the local UI state
        fetchTasks(); // Refresh the tasks in the parent component
      }
    } catch (error: any) {
      console.error("Error updating due date:", error.message);
    }
  };

  const isDueDatePastOrToday = currentDate && currentDate <= new Date();


  return (
    <div className={`task-date-updater relative`}>
      <p
        className={`text-xs font-semibold ${
          isDueDatePastOrToday ? "text-red-500" : "text-teal-500"
        } w-[164px]  ${taskStatus === true ? "pointer-events-none" : "pointer-events-auto"}`}
      >
        <DatePicker
          className={`w-full focus-visible:outline-none border-none text-transparent`}
          closeOnScroll={(e) => e.target === document}
          popperPlacement="right-end" // Automatically adjust position
          selected={currentDate}
          onChange={(date) => {
            if (date) {
              handleExpireDateChange(date);
              setCurrentDate(date);
            }
          }}
        />
        {/* Show the formatted date in the UI */}
        <div className="formatted-date -mt-[15px]">
          {currentDate ? `${formatDate(currentDate)}` : ""}
        </div>
      </p>
    </div>
  );
};

export default TaskDateUpdater;
