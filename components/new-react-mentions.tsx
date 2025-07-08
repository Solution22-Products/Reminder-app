import { Mention, MentionsInput } from "react-mentions";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { CircleCheckBig, CircleX, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useGlobalContext } from "@/context/store";
import { hash } from "crypto";
import { Input } from "./ui/input";

type TeamSpaceInfo = {
  teamId: string;
  spaceId: string | null;
};

interface MemberData {
  id: number;
  display: string;
}

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
  // memberId?: string;
  // memberTeamsAndSpaces?: any[];
  spaces: any[];
  teams: any[];
  members: any[];
  selectedUserId: string | null;
  selectedMember: any;
  kanbanView?: boolean;
  setIsDialogOpen: any;
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
  // memberId,
  // memberTeamsAndSpaces,
  spaces,
  teams,
  members,
  selectedUserId,
  selectedMember,
  kanbanView,
  setIsDialogOpen,
}: MentionData) => {
  const { userId, fetchAllTasks, setNotificationTrigger, notificationTrigger } =
    useGlobalContext();
  const [inputValue, setInputValue] = useState("");
  const [memberInputValue, setMemberInputValue] = useState("");
  const [mentionLevel, setMentionLevel] = useState<number>(1);
  const [spaceData, setSpaceData] = useState<MemberData[]>([]);
  const [teamData, setTeamData] = useState<MemberData[]>([]);
  const [selectedMentionSpaceId, setSelectedMentionSpaceId] = useState<
    string | null
  >(null);

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
    return date.toLocaleDateString("en-US", options).replace(",", "");
  };

  const getUniqueItems = (array: any[], key: string) => {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[key];
      if (!seen.has(value)) {
        seen.add(value);
        return true;
      }
      return false;
    });
  };

  const filterTeamAndSpace = () => {
    const selectedMember = members?.find(
      (member) => member.id === selectedUserId
    );
    if (!selectedMember) return;

    const matchedTeams = teams.filter((team) =>
      team?.members?.some((member: any) => member.id === selectedMember.id)
    );

    const uniqueSpaces = getUniqueItems(
      matchedTeams
        .map((team) => spaces.find((space) => space.id === team.space_id))
        .filter(Boolean),
      "id"
    );

    const transformedSpaces = uniqueSpaces.map((space) => ({
      id: space.id,
      display: space.space_name,
    }));

    setSpaceData(transformedSpaces);
  };

  const filterTeamsForSpace = (spaceId: string) => {
    const selectedMemberId = selectedUserId;

    const filteredTeams = teams.filter(
      (team) =>
        team.space_id === spaceId &&
        team?.members?.some((member: any) => member.id === selectedMemberId)
    );

    const uniqueTeams = getUniqueItems(filteredTeams, "id");

    const transformedTeams = uniqueTeams.map((team) => ({
      id: team.id,
      display: team.team_name,
    }));

    setTeamData(transformedTeams);
  };

  useEffect(() => {
    filterTeamAndSpace();
    setMentionLevel(1);
    setSelectedMentionSpaceId(null);
    setTeamData([]);
  }, [selectedUserId]);

  const handleChangeMember = (event: { target: { value: string } }) => {
    setMemberInputValue(event.target.value);
    if (event.target.value === "") {
      setMentionLevel(1);
    }
  };

  const handleMentionAdd = (id: any, display: string) => {
    if (mentionLevel === 1) {
      setSelectedMentionSpaceId(id);
      filterTeamsForSpace(id);
    }
    setMentionLevel((prev) => prev + 1);
  };

  const handleChange = (event: { target: { value: string } }) => {
    if (!selectedTeam?.members || selectedTeam.members.length === 0) {
      toast({
        title: "No Members",
        description:
          "No members are there in the team. You can't create a task.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    setInputValue(event.target.value);
  };

  // Format data for mentions
  const mentionData = selectedTeam?.members?.map((member) => ({
    id: member.id,
    display: member.entity_name,
  }));

  const handleCreateMemberTask = async () => {
    // 1. Extract mentions like @[pugazh]
    const mentions = memberInputValue.match(/@\[[^\]]+\]/g) || [];
    const formattedMentions = mentions.map(
      (m: string) => `@${m.replace(/[@\[\]]/g, "")}`
    );

    // 2. Extract full #hashtag + date/time (until next @ or ^ or end)
    const hashPattern = /#\w+(?:[^\^@]*)/g;
    const hashRaw =
      memberInputValue.match(hashPattern)?.map((s) => s.trim()) || [];
    const hashContent = hashRaw[0]?.replace(/^#/, "").trim() || "";

    // 3. Extract ^ tags
    const caretMatch = memberInputValue.match(/\^\w+/);
    const priority = caretMatch?.[0].replace("^", "") || "";

    // 4. Plain content without @, #, ^
    const plainText = memberInputValue
      .replace(/@\[[^\]]*\]|\([^\)]*\)/g, "")
      .replace(hashPattern, "")
      .replace(/\^\w+/g, "")
      .trim();

    const hashDate = new Date(hashContent);

    const mentionIds = Array.from(
      memberInputValue.matchAll(/\(([^)]+)\)/g),
      (match) => match[1]
    );

    // console.log("Extracted IDs:", mentionIds[0], mentionIds[1]);

    // console.log(memberInputValue);
    // console.log("Mentions:", formattedMentions);
    // console.log("Hash Content (string):", hashContent);
    // console.log("Priority (string):", priority);
    // console.log("Plain Content:", plainText);

    if (!memberInputValue) {
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
    if (isNaN(hashDate.getTime())) {
      toast({
        title: "Error",
        description: "Invalid date or time format",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const entityName = `${selectedMember?.entity_name}`;

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
            mentions: [`@${entityName}`],
            time: formatDate(new Date()),
            team_id: mentionIds[1],
            space_id: mentionIds[0],
            due_date: hashDate,
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
        const memberTaskMail = async (to: any, name: any, created_by: any) => {
          const response = await fetch("/api/memberTask-create-mail", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to,
              name,
              created_by,
              link: "http://localhost:3000/admin-view",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to send email");
          }
        };

        memberTaskMail(
          selectedMember.email,
          selectedMember.username,
          userId?.username
        );
        toast({
          title: "Success",
          description: "Task created successfully.",
          variant: "default",
          duration: 3000,
        });
        setMemberInputValue("");
        setNotificationTrigger(!notificationTrigger);
        setIsDialogOpen(false);
      } catch (err) {
        console.error("Error creating task:", err);
      }
    }
  };

  const handleCreateTask = async () => {
  const mentions = inputValue.match(/@\[[^\]]+\]/g) || [];
  const formattedMentions = mentions.map((m: string) => `@${m.replace(/[@\[\]]/g, "")}`);

  const hashPattern = /#\w+(?:[^\^@]*)/g;
  const hashRaw = inputValue.match(hashPattern)?.map((s) => s.trim()) || [];
  const hashContent = hashRaw[0]?.replace(/^#/, "").trim() || "";
  const caretMatch = inputValue.match(/\^\w+/);
  const priority = caretMatch?.[0].replace("^", "") || "";

  const plainText = inputValue
    .replace(/@\[[^\]]*\]|\([^\)]*\)/g, "")
    .replace(hashPattern, "")
    .replace(/\^\w+/g, "")
    .trim();

  const hashDate = new Date(hashContent);

  const regex = /\(([a-f0-9\-]{36})\)/gi;
  const ids: string[] = [];
  let match;
  while ((match = regex.exec(inputValue)) !== null) {
    ids.push(match[1]);
  }

  const selectedMembers = ids
    .map((id) => members.find((member) => member.id === id))
    .filter(Boolean);

  const mentionedMembersEmail = selectedMembers.map((m) => m.email);
  const mentionedMembersName = selectedMembers.map((m) => m.username);

  console.log(mentionedMembersEmail);
  console.log(mentionedMembersName);

  // if (!inputValue || !hashContent || !priority || formattedMentions.length === 0 || plainText === "") {
  //   toast({
  //     title: "Error",
  //     description: "Please enter valid task content.",
  //     variant: "destructive",
  //     duration: 3000,
  //   });
  //   return;
  // }

  // if (isNaN(hashDate.getTime())) {
  //   toast({
  //     title: "Error",
  //     description: "Invalid date or time format",
  //     variant: "destructive",
  //     duration: 3000,
  //   });
  //   return;
  // }



  // try {
  //   const { data: taskData, error: taskError } = await supabase.from("tasks").insert({
  //     task_content: plainText,
  //     mentions: formattedMentions,
  //     time: formatDate(new Date()),
  //     team_id: selectedTeamId,
  //     space_id: selectedSpaceId,
  //     due_date: hashDate,
  //     priority: priority,
  //     task_created: true,
  //     task_status: "todo",
  //     is_deleted: false,
  //     notify_read: false,
  //     undo_delete: true,
  //     created_by: userId?.username,
  //   });

  //   if (taskError) throw taskError;

  //   // fetchAllTasks();
  //   setInputValue("");
  //   setNotificationTrigger(!notificationTrigger);
  //   setIsDialogOpen(false);
  //   toast({
  //     title: "Success",
  //     description: "Task created and emails sent.",
  //     variant: "default",
  //     duration: 3000,
  //   });

  //   // Send email to each mentioned member individually
  //   const sendTaskEmail = async (to: string, name: string) => {
  //     const response = await fetch("/api/taskCreate-mail", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         to,
  //         name,
  //         created_by: userId?.username,
  //         link: "http://localhost:3000/admin-view",
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Failed to send email to ${to}`);
  //     }
  //   };

  //   for (let i = 0; i < mentionedMembersEmail.length; i++) {
  //     await sendTaskEmail(mentionedMembersEmail[i], mentionedMembersName[i]);
  //   }
  // } catch (err) {
  //   console.error("Error creating task:", err);
  // }
};

  const handleUpdateTask = async () => {
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

    const hashDateTaskUpdate = new Date(hashContent);

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

    // Check if the date is valid
    if (isNaN(hashDateTaskUpdate.getTime())) {
      toast({
        title: "Error",
        description: "Invalid date or time format",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    // Final Output
    // console.log("Mentions:", combinedMentions); // ['@pugazh', ...]
    // console.log("Hash Content (string):", hashContent); // 'april 25, 2025, 10:30 PM'
    // console.log("Priority (string):", priority); // 'high'
    // console.log("Plain Content:", plainText.replace(/@\w+/g, "").trim());

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          task_content: plainText.replace(/@\w+/g, "").trim(),
          mentions: combinedMentions,
          due_date: hashDateTaskUpdate,
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

  const handleUpdateMemberTask = async () => {
    const taskContent = memberInputValue.replace(/@\w+/g, "").trim();

    const hashPattern = /#\w+(?:[^\^@]*)/g;
    const hashRaw =
      memberInputValue.match(hashPattern)?.map((s) => s.trim()) || [];
    const hashContent = hashRaw[0]?.replace(/^#/, "").trim() || "";

    const caretMatch = memberInputValue.match(/\^\w+/);
    const priority = caretMatch?.[0].replace("^", "") || "";

    const plainText = memberInputValue
      .replace(/@\[[^\]]*\]|\([^\)]*\)/g, "")
      .replace(hashPattern, "")
      .replace(/\^\w+/g, "")
      .trim();

    const hashDateTaskUpdate = new Date(hashContent);

    // console.log(hashDateTaskUpdate);
    // console.log(priority);
    // console.log(plainText);
    // console.log(taskContent);
    // console.log(currentTask.id);

    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          task_content: plainText,
          due_date: hashDateTaskUpdate,
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
      setMemberInputValue("");
      setIsEditTask(false);
    } catch (err) {
      console.error("Error updating task:", err);
    }
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
      const dateStr = currentTask.due_date
        ? `#${
            new Date(currentTask.due_date).toDateString().slice(4, 15) +
            " " +
            new Date(currentTask.due_date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          }`
        : "";

      setInputValue(
        `${mentionStr} ${currentTask.task_content} ${dateStr} ${priorityStr}`.trim()
      );
      setMemberInputValue(
        `${currentTask.task_content} ${dateStr} ${priorityStr}`.trim()
      );
    }
  }, [isEditTask, currentTask]);

  useEffect(() => {
    const subscription = supabase
      .channel("tasks-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          console.log("Task created!", payload);
          fetchAllTasks(); // Refresh task list

          // Show browser notification
          if ("Notification" in window) {
            Notification.requestPermission().then((result) => {
              if (result === "granted") {
                new Notification("New Task Created", {
                  body: "A new task has been added successfully.",
                });
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <div
        className={`${classname} flex items-center justify-between gap-3 ${
          !editTask ? "px-3" : "px-0"
        } py-3 border-black text-center
        ${!editTask ? "bg-white" : "bg-transparent"}`}
      >
        {selectedUserId && isEditTask ? (
          <Input
            type="text"
            value={memberInputValue}
            onChange={handleChangeMember}
            placeholder="@space @team content #date,time ^priority"
            className={` border p-2 rounded-md ${classname} ${
              !editTask ? "w-[86%]" : "w-full focus:outline-none"
            }
            ${!editTask ? "bg-white" : "bg-transparent"}`}
          />
        ) : selectedUserId ? (
          <MentionsInput
            value={memberInputValue}
            onChange={handleChangeMember}
            placeholder="@space @team content #date,time ^priority"
            className={`mentions-input border p-2 rounded-md ${classname} ${
              !editTask ? "w-[86%]" : "w-full focus:outline-none"
            }`}
          >
            <Mention
              trigger="@"
              // data={mentionData}
              data={
                mentionLevel === 1
                  ? spaceData
                  : mentionLevel === 2
                  ? teamData
                  : []
              }
              displayTransform={(id, display) => `@${display} `}
              onAdd={handleMentionAdd}
              appendSpaceOnAdd
            />
          </MentionsInput>
        ) : (
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
        )}
        {!editTask && (
          <Button
            className="mt-0 h-10 bg-[#1A56DB] hover:bg-[#1A56DB]"
            onClick={selectedUserId ? handleCreateMemberTask : handleCreateTask}
          >
            Create Task <Send size={16} className="text-white" />
          </Button>
        )}
      </div>

      {isEditTask && (
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditTask(false);
              setInputValue("");
              setMemberInputValue("");
            }}
          >
            {kanbanView ? (
              <CircleX size={22} className="text-zinc-950" />
            ) : (
              "Cancel"
            )}
          </Button>
          <Button
            className="mt-0 bg-[#1A56DB] hover:bg-[#1A56DB]"
            onClick={selectedUserId ? handleUpdateMemberTask : handleUpdateTask}
          >
            {kanbanView ? (
              <CircleCheckBig size={22} className="text-white" />
            ) : (
              "Update"
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default NewReactMentions;
