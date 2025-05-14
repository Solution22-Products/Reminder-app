import { Mention, MentionsInput } from "react-mentions";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useGlobalContext } from "@/context/store";

interface MentionData {
  selectedTeam: {
    members: {
      id: string;
      entity_name: string;
    }[];
  };
  selectedSpaceId: string | null;
  selectedTeamId: string | null;
  editTask: boolean;
  isEditTask: any;
  setIsEditTask: any;
  currentTask?: any;
  classname?: string;
}

const NewReactMentions = ({
  selectedTeam,
  selectedSpaceId,
  selectedTeamId,
  editTask,
  isEditTask,
  setIsEditTask,
  currentTask,
  classname,
}: MentionData) => {
  const { userId, fetchAllTasks } = useGlobalContext();
  const [inputValue, setInputValue] = useState("");

  const formatDate = (date: Date): string => {
  // Validate if the date is valid
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date"; // Fallback value instead of throwing an error
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  // 'en-US' gives format like "Aug 23, 2024"
  return date.toLocaleDateString("en-US", options);
};

  const handleChange = (event: { target: { value: string } }) => {
    setInputValue(event.target.value);
    console.log("Current Input:", event.target.value);
  };

  // Format data for mentions
  const mentionData = selectedTeam?.members.map((member) => ({
    id: member.id,
    display: member.entity_name,
  }));

  const handleCreateTask = async () => {
    // 1. Extract mentions like @[pugazh]
    const mentions = inputValue.match(/@\[[^\]]+\]/g) || [];
    const formattedMentions = mentions.map(
      (m: string) => `@${m.replace(/[@\[\]]/g, "")}`
    );

    // 2. Extract full #hashtag + date/time (until next @ or ^ or end)
    const hashPattern = /#\w+(?:[^\^@]*)/g;
    const hashRaw = inputValue.match(hashPattern)?.map((s) => s.trim()) || [];
    const hashContent = hashRaw[0]?.replace(/^#/, "").trim() || "";

    // 3. Extract ^ tags
    const caretMatch = inputValue.match(/\^\w+/);
    const priority = caretMatch?.[0].replace("^", "") || "";

    // 4. Plain content without @, #, ^
    const plainText = inputValue
      .replace(/@\[[^\]]*\]|\([^\)]*\)/g, "")
      .replace(hashPattern, "")
      .replace(/\^\w+/g, "")
      .trim();

    if (!inputValue) {
      toast({
        title: "Error",
        description: "Please enter the task content.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!hashContent || !priority || !formattedMentions) {
      toast({
        title: "Error",
        description: "Please enter valid task content.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Final Output
    console.log("Mentions:", formattedMentions); // ['@pugazh']
    console.log("Hash Content (string):", hashContent); // 'april 25, 2025, 10:30 PM'
    console.log("Priority (string):", priority); // 'high'
    console.log("Plain Content:", plainText);

    if (formattedMentions.length === 0 || plainText === "") {
      toast({
        title: "Error",
        description: "Please enter a valid task content.",
        variant: "destructive",
        duration: 3000,
      });
      console.log("Please enter a valid task content.");
      return;
    } else {
      try {
        const { data: taskData, error: taskError } = await supabase
          .from("tasks")
          .insert({
            task_content: plainText,
            mentions: formattedMentions,
            time: formatDate(new Date()),
            team_id: selectedTeamId,
            space_id: selectedSpaceId,
            due_date: hashContent,
            priority: priority,
            task_created: true,
            task_status: "todo",
            is_deleted: false,
            notify_read: false,
            undo_delete: true,
            created_by: userId?.username,
          });

        if (taskError) throw taskError;
        fetchAllTasks();
        toast({
          title: "Success",
          description: "Task created successfully.",
          variant: "default",
          duration: 3000,
        });
        setInputValue("");
      } catch (err) {
        console.error("Error creating task:", err);
      }
    }
  };

  const handleUpdateTask = async () => {
    console.log("Updating task...");
    console.log(inputValue);

    // 1. Extract new mentions like @[pugazh]
    const newMentions = inputValue.match(/@\[[^\]]+\]/g) || [];
    const formattedNewMentions = newMentions.map(
      (m: string) => `@${m.replace(/[@\[\]]/g, "")}`
    );

    // If editing and currentTask exists, merge with existing mentions
    let combinedMentions: string[] = [];
    if (isEditTask && currentTask?.mentions) {
      const existingMentions = currentTask.mentions.map((m: string) =>
        m.startsWith("@") ? m : `@${m}`
      );
      combinedMentions = Array.from(
        new Set([...existingMentions, ...formattedNewMentions])
      );
    } else {
      combinedMentions = formattedNewMentions;
    }

    // 2. Extract full #hashtag + date/time (until next @ or ^ or end)
    const hashPattern = /#\w+(?:[^\^@]*)/g;
    const hashRaw = inputValue.match(hashPattern)?.map((s) => s.trim()) || [];
    const hashContent = hashRaw[0]?.replace(/^#/, "").trim() || "";

    // 3. Extract ^ tags
    const caretMatch = inputValue.match(/\^\w+/);
    const priority = caretMatch?.[0].replace("^", "") || "";

    // 4. Plain content without @, #, ^
    const plainText = inputValue
      .replace(/@\[[^\]]*\]|\([^\)]*\)/g, "")
      .replace(hashPattern, "")
      .replace(/\^\w+/g, "")
      .trim();

    if (!inputValue) {
      toast({
        title: "Error",
        description: "Please enter the task content.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!hashContent || !priority || combinedMentions.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid task content.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Final Output
    console.log("Mentions:", combinedMentions); // ['@pugazh', ...]
    console.log("Hash Content (string):", hashContent); // 'april 25, 2025, 10:30 PM'
    console.log("Priority (string):", priority); // 'high'
    console.log("Plain Content:", plainText.replace(/@\w+/g, "").trim());

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          task_content: plainText.replace(/@\w+/g, "").trim(),
          mentions: combinedMentions,
          due_date: hashContent,
          priority,
        })
        .eq("id", currentTask.id);

      if (error) throw error;

      fetchAllTasks();
      toast({
        title: "Success",
        description: "Task updated successfully.",
        variant: "default",
        duration: 3000,
      });
      setInputValue("");
      setIsEditTask(false);
    } catch (err) {
      console.error("Error updating task:", err);
    }

    // Proceed with save or update logic using: combinedMentions, hashContent, priority, plainText
  };

  useEffect(() => {
    if (isEditTask && currentTask) {
      const mentionStr =
        currentTask.mentions
          ?.map((mention: string) => `@${mention.replace(/^@/, "")}`)
          .join(" ") || "";
      const priorityStr = currentTask.priority
        ? `^${currentTask.priority}`
        : "";
      const dateStr = currentTask.due_date ? `#${currentTask.due_date}` : "";

      setInputValue(
        `${mentionStr} ${currentTask.task_content} ${dateStr} ${priorityStr}`.trim()
      );
    }
  }, [isEditTask, currentTask]);

  // useEffect(() => {
  //   const subscription = supabase
  //     .channel("tasks-updates")
  //     .on(
  //       "postgres_changes",
  //       { event: "UPDATE", schema: "public", table: "tasks" },
  //       (payload) => {
  //         console.log("Task updated!", payload);
  //         fetchAllTasks(); // Function to refresh the task list in state
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []);

  return (
    <>
      <div
        className={`flex items-center justify-between ${
          !editTask ? "px-3" : "px-0"
        } py-3 border-black text-center h-[68px]
        ${!editTask ? "bg-white" : "bg-transparent"}`}
      >
        <MentionsInput
          value={inputValue}
          onChange={handleChange}
          placeholder="@member content #date,time ^priority"
          className={`mentions-input border p-2 rounded-md ${classname} ${
            !editTask ? "w-[86%]" : "w-full focus:outline-none"
          }`}
        >
          <Mention
            trigger="@"
            data={mentionData}
            displayTransform={(id, display) => `@${display} `}
            className=""
          />
        </MentionsInput>
        {!editTask && (
          <Button
            className="mt-0 h-10 bg-[#1A56DB] hover:bg-[#1A56DB]"
            onClick={handleCreateTask}
          >
            Create Task <Send size={16} className="text-white" />
          </Button>
        )}
      </div>
      {isEditTask && (
        <div className="flex justify-end items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditTask(false)}>
            Cancel
          </Button>
          <Button
            className="mt-0 bg-[#1A56DB] hover:bg-[#1A56DB]"
            onClick={handleUpdateTask}
          >
            Update
          </Button>
        </div>
      )}
    </>
  );
};

export default NewReactMentions;
