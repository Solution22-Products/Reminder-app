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
  selectedTeam: any;
  selectedSpace: any;
  inputValue : any;
  setInputValue : any
}

const AddTaskMentions: React.FC<ReactProps> = ({
  selectedTeam,
  selectedSpace,
  inputValue,
  setInputValue
}) => {
  const { userId } = useGlobalContext();
  const [employees, setEmployees] = useState<MentionData[]>([]);
  
  // const [mentionedItems, setMentionedItems] = useState<
  //   { id: number; name: string }[]
  // >([]);
  const [memberData, setMemberData] = useState<string[]>([]);
  const [date, setDate] = React.useState<Date>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string>("todo");

  const fetchTeamsAndTasks = async () => {
    try {
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("members")
        .eq("id", selectedTeam?.id)
        .eq("is_deleted", false);

      if (teamData && teamData.length > 0) {
        const members = teamData.flatMap((team) => team.members);

        setMemberData(members);
        setEmployees(
          members.map((member) => ({ id: member.id, display: member.name }))
        );
      }
    } catch (err) {
      console.error("Error fetching task data:", err);
    }
  };

  const handleChange = (event: { target: { value: string } }) => {
    setInputValue(event.target.value);
    // extractMentions(event.target.value);
    console.log(event.target.value);
    fetchTeamsAndTasks();

    // if (event.target.value === "") {
    //   setMentionedItems([]);
    // }
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
    const mentions = inputValue.match(/@\[([^\]]+)\]/g) || [];
    const formattedMentions = mentions.map(
      (m : string) => `@${m.replace(/[@\[\]]/g, "")}`
    );

    const plainText = inputValue.replace(/@\[[^\]]*\]|\([^\)]*\)/g, "").trim();

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
            team_id: selectedTeam?.id,
            space_id: selectedSpace?.id,
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
        setDrawerOpen(false);
        setInputValue("");
      } catch (err) {
        console.error("Error creating task:", err);
      }
    }
  };

  useEffect(() => {
    // fetchTaskData();
  }, [userId, selectedTeam, selectedSpace, inputValue]);

  return (
    <div className="container mx-auto p-4">
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerTrigger className="w-full bg-[#1A56DB] flex items-center justify-center text-white py-2 rounded-lg">
          <Image
            src={addicon}
            alt="Add Icon"
            width={20}
            height={20}
            className="mr-2 text-bgwhite"
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
              placeholder="Type @ to mention employees"
              className="mentions-input border p-2 rounded-md w-full"
            >
              <Mention
                trigger="@"
                data={employees}
                displayTransform={(id, display) => `@${display} `}
                className=""
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

export default AddTaskMentions;
