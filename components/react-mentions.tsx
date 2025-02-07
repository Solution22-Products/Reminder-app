"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import { MentionsInput, Mention } from "react-mentions";
import { useGlobalContext } from "@/context/store";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import addicon from "@/public/images/Frame.png";

interface MentionData {
  id: number;
  display: string;
}

interface ReactProps {
  setTaskTrigger : any;
  setNotifyMobTrigger: any
}

const ReactMentions : React.FC<ReactProps> = ({ setTaskTrigger, setNotifyMobTrigger }) => {
  const { userId } = useGlobalContext();
  const [spaces, setSpaces] = useState<MentionData[]>([]);
  const [teams, setTeams] = useState<MentionData[]>([]);
  const [employees, setEmployees] = useState<MentionData[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [mentionedItems, setMentionedItems] = useState<
    { id: number; name: string }[]
  >([]);
  const [taskLoading, setTaskLoading] = useState(true);
  const [mentionLevel, setMentionLevel] = useState<number>(1);
  const [adminOverdueTasks, setAdminOverdueTasks] = useState<any[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  const [memberData, setMemberData] = useState<string[]>([]);
  const [date, setDate] = React.useState<Date>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string>("todo");

  const [allSpace, setAllSpace] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [userSpace, setUserSpace] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: spaces } = await supabase
        .from("spaces")
        .select("*")
        .eq("is_deleted", false);
      const { data: teams } = await supabase
        .from("teams")
        .select("*")
        .eq("is_deleted", false);
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_deleted", false);

      if (spaces) setAllSpace(spaces);
      if (teams) setAllTeams(teams);
      if (tasks) setAllTasks(tasks);

      setAdminOverdueTasks(spaces as any);
      console.log(spaces, " spaces");
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userId?.role === "owner") {
      setUserSpace([...allSpace]);
    } else {
      const matchedTeams = allTeams.filter((team) =>
        team.members.some(
          (member: any) =>
            member.entity_name === (userId?.entity_name)
        )
      );
      console.log(matchedTeams, " matchedTeams");
      const matchedSpaceIds = new Set(
        matchedTeams.map((team) => team.space_id)
      );

      const matchedSpaces = allSpace.filter((space) =>
        matchedSpaceIds.has(space.id)
      );
      setUserSpace(matchedSpaces);
      console.log(matchedSpaces, " matchedSpaces");
    }
  }, [allSpace, allTeams, userId]);

  const fetchTaskData = async () => {
    try {
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_deleted", false);

      if (taskError) throw taskError;

      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("is_deleted", false);

      if (teamError) throw teamError;

      const { data: spaceData, error: spaceError } = await supabase
        .from("spaces")
        .select("*")
        .eq("is_deleted", false);

      if (spaceError) throw spaceError;

      // setAdminOverdueTasks(spaceData);
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

      // const overdue = filteredTasks.filter((task) =>
      //   new Date(task.due_date).getTime()
      // );
      const adminOverdue = taskData.map((task) => {
        const team = teamData.find((team) => team.id === task.team_id);
        const space = spaceData.find((space) => space.id === task.space_id);
        return team && space
          ? {
              ...task,
              team_name: team.team_name,
              space_name: space.space_name,
            }
          : null;
      });

      // setOverdueTasks(filteredTasks);
      // setAdminOverdueTasks(adminOverdue);
      setTaskLoading(false);

      const getUniqueItems = <T, K extends keyof T>(array: T[], key: K) => {
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

      const sourceData =
        userId?.role === "owner" ? adminOverdueTasks : filteredTasks;

      setSpaces(
        getUniqueItems(
          sourceData.map((space) =>
            userId?.role === "User"
              ? { id: space.space_id, display: space.space_name }
              : { id: space.id, display: space.space_name }
          ),
          "display"
        )
      );

      setTeams(
        getUniqueItems(
          sourceData.map((team) =>
            userId?.role === "User"
              ? { id: team.team_id, display: team.team_name }
              : { id: team.id, display: team.team_name }
          ),
          "display"
        )
      );
    } catch (err) {
      console.error("Error fetching task data:", err);
      setTaskLoading(false);
    }
  };

  const extractMentions = (value: string) => {
    const mentionRegex = /@\[(.*?)\]\((\d+)\)/g;
    const matches = Array.from(value.matchAll(mentionRegex)).map((match) => ({
      name: match[1],
      id: parseInt(match[2], 10),
    }));
    setMentionedItems(matches);
  };

  const fetchTeamsAndTasks = async (teamId?: string) => {
    try {
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("space_id", teamId)
        .eq("is_deleted", false);

      if (teamError) throw teamError;
      {
        userId?.role === "owner" &&
          setTeams(
            teamData.map((team) => ({ id: team.id, display: team.team_name }))
          );
        // console.log(
        //   teamData.map((team) => ({ id: team.id, display: team.team_name }))
        // );
      }

      const { data: teamMember, error: teamMemberError } = await supabase
        .from("teams")
        .select("members")
        .eq("id", ids[1])
        .eq("is_deleted", false);

      if (teamMemberError) throw teamMemberError;

      // Ensure data exists and map correctly
      if (teamMember && teamMember.length > 0) {
        const members = teamMember.flatMap((team) => team.members);

        setMemberData(members);
        setEmployees(
          members.map((member) => ({ id: member.id, display: member.name }))
        );
        console.log(
          members.map((member) => ({ id: member.id, name: member.name }))
        );
      } else {
        console.log("No members found.");
      }

      console.log(ids[1]);
    } catch (err) {
      console.error("Error fetching task data:", err);
      setTaskLoading(false);
    }
  };

  const handleChange = (event: { target: { value: string } }) => {
    setInputValue(event.target.value);
    extractMentions(event.target.value);
    console.log(event.target.value);

    // Extract all IDs from mentions
    const mentionIds = Array.from(
      event.target.value.matchAll(/\(([^)]+)\)/g),
      (match) => match[1]
    );

    setIds(mentionIds);

    // Fetch data for all extracted IDs
    mentionIds.forEach((id) => fetchTeamsAndTasks(id));

    if (event.target.value === "") {
      setMentionedItems([]);
      setMentionLevel(1);
    }
  };

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

    return date.toLocaleDateString("en-GB", options); // 'en-GB' gives the format "23 Aug 2024"
  };

  const handleCreateTask = async () => {
    const names = Array.from(
      inputValue.matchAll(/@\[(.*?)\]/g),
      (match) => match[1]
    );
    const ids = Array.from(
      inputValue.matchAll(/\((.*?)\)/g),
      (match) => match[1]
    );
    const plainText = inputValue.replace(/@\[[^\]]*\]|\([^\)]*\)/g, "").trim();

    if (names.length === 0 || ids.length === 0 || plainText === "") {
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
            mentions: names.slice(2).map((name) => "@" + name),
            time: formatDate(new Date()),
            team_id: ids[1],
            space_id: ids[0],
            due_date: formatDate((date as Date) || new Date()),
            task_created: true,
            task_status: taskStatus,
            is_deleted: false,
            notify_read: false,
            created_by: userId?.username,
          });

        if (taskError) throw taskError;

        toast({
          title: "Success",
          description: "Task created successfully.",
          variant: "default",
          duration: 3000,
        });
        setTaskTrigger(true);
        setDrawerOpen(false);
        setNotifyMobTrigger(true);
        setInputValue("");
      } catch (err) {
        console.error("Error creating task:", err);
      }
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, [userId]);

  return (
    <div className="container mx-auto p-4">
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger className="w-full bg-[#1A56DB] flex items-center justify-center text-white py-2 rounded-lg">
          <Image
            src={addicon}
            alt="Add Icon"
            width={20}
            height={20}
            className="mr-2 text-bgwhite "
          />
          <p className="text-bgwhite font-geist text-[16px] font-semibold">
            {" "}
            New Task
          </p>
        </DrawerTrigger>
        <DrawerContent className="pb-10">
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle>New Task</DrawerTitle>
            <Select
              defaultValue="todo"
              onValueChange={(value) => {
                setTaskStatus(value);
              }}
            >
              <SelectTrigger className="w-[164px] pt-2 pr-[10px] text-[#9B9B9B] text-center border-[#E2E2E2] bg-[#E2E2E2] rounded-[30px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="text-[#9B9B9B]">
                {/* <SelectGroup> */}
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="In progress">In Progress</SelectItem>
                <SelectItem value="Internal feedback">
                  Internal feedback
                </SelectItem>
                {/* </SelectGroup> */}
              </SelectContent>
            </Select>
          </DrawerHeader>
          <div className="px-4 border-black rounded-[10px] text-center">
            <MentionsInput
              value={inputValue}
              onChange={handleChange}
              placeholder="Type @ to mention spaces, teams, or employees"
              className="mentions-input border p-2 rounded-md w-full"
            >
              <Mention
                trigger="@"
                data={
                  mentionLevel === 1
                    ? spaces
                    : mentionLevel === 2
                    ? teams
                    : mentionLevel >= 3
                    ? employees
                    : []
                }
                displayTransform={(id, display) => `@${display} `}
                onAdd={() => setMentionLevel((prev) => prev + 1)}
                className="p-5"
              />
            </MentionsInput>

            <div className="w-full flex items-center gap-3 mt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-1/2 justify-center text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? (
                      format(date, "PPP")
                    ) : (
                      <span>{format(new Date(), "PPP")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date || new Date()}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                className="bg-[#1A56DB] text-white hover:bg-[#1A56DB] font-medium text-sm text-center shadow-none w-1/2 rounded-[10px]"
                onClick={handleCreateTask}
              >
                Create
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default ReactMentions;
