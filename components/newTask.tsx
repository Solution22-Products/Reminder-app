"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import addicon from "@/public/images/Frame.png";
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
import { Button } from "./ui/button";
import axios from "axios";
import MentionInput from "./mentionInput";
import { supabase } from "@/utils/supabase/supabaseClient";
import TaskDateUpdater from "@/app/(web)/components/dueDate";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import ReactMentions from "./react-mentions";

type User = {
  id: number;
  name: string;
};

type PopupProps = {
  data: User[];
  position: { top: number; left: number };
  onSelect: (user: User) => void;
};


export function NewTask() {
  const styledInputRef = useRef<HTMLDivElement>(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [taskError, setTaskError] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [text, setText] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<string>("In Progress");
  const [taskErrorMessage, setTaskErrorMessage] = useState(false);
  const [date, setDate] = React.useState<Date>();

  const Popup: React.FC<PopupProps> = ({ data, position, onSelect }) => {
    return (
      <div className="popup" style={{ top: position.top, left: position.left }}>
        {data.map((user) => (
          <div key={user.id} onClick={() => onSelect(user)}>
            {user.name}
          </div>
        ))}
      </div>
    );
  };


  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };

    return date.toLocaleDateString("en-GB", options); // 'en-GB' gives the format "23 Aug 2024"
  };

  const handleCreateTask = async () => {
    const mentions = text.match(/@\w+/g) || []; // Find all mentions
    const content = text.replace(/@\w+/g, "").trim();

    console.log(formatDate(date || new Date()), "date");

    // Check if both content and mentions are non-empty
    if (content.length > 0 && mentions.length > 0) {
      setTaskErrorMessage(false);
      console.log(mentions + " " + content, "text");

      const { data, error } = await supabase.from("tasks").insert({
        task_content: content,
        mentions: mentions,
        time: date,
        status: taskStatus,
      });

      if (error) throw error;

      console.log(data, " added task");

      const styledInput = styledInputRef.current;
      if (!styledInput?.innerText.trim()) {
        setTaskError(true);
        return;
      }

      console.log("Task:", styledInput.innerText);
      styledInput.innerText = ""; // Clear the content
      setText(""); // Clear the text state
    } else {
      setTaskErrorMessage(true);
      console.log("Please enter both content and mentions.");
    }
  };

  return (
    <div className="px-[18px]">
      <Drawer>
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
            <ReactMentions />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
