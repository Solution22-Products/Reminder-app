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

type User = {
  id: number;
  name: string;
};

type PopupProps = {
  data: User[];
  position: { top: number; left: number };
  onSelect: (user: User) => void;
};

const Popup: React.FC<PopupProps> = ({ data, position, onSelect }) => (
  <div
    style={{
      top: position.top,
      left: position.left,
    }}
  >
    {data.map((user) => (
      <div key={user.id} onClick={() => onSelect(user)}>
        {user.name}
      </div>
    ))}
  </div>
);

const fetchEmployeeList = async () => {
  try {
    const response = await axios.get(
      "https://portal.solution22.com.au/api/employees",
      {
        headers: {
          Authorization: `Bearer Ng4J6u194xccX9kbZxrBOEpZHWjQI5g5Ao7LccMf`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching employee list:", error);
    return null;
  }
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

  useEffect(() => {
    const getEmployees = async () => {
      const data = await fetchEmployeeList();
      if (data) {
        setEmployees(data);
      }
    };

    getEmployees();
  }, []);

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
  let PopupList: User[] = [];

  const Space: User[] = [
    { id: 1, name: "Big7Solution" },
    { id: 2, name: "Solution22" },
    { id: 3, name: "Graphity" },
  ];

  const Team: User[] = [
    { id: 1, name: "DevelopmentTeam" },
    { id: 2, name: "DesignTeam" },
    { id: 3, name: "MangementTeam" },
  ];

  const Employee: User[] = [
    { id: 1, name: "Dhanasekar" },
    { id: 2, name: "Prashanth" },
    { id: 3, name: "Pugal" },
  ];

  useEffect(() => {
    const styledInput = styledInputRef.current;
    if (!styledInput) return;

    const handleInput = () => {
      let text = styledInput.innerText || "";
      const atCount = (text.match(/@/g) || []).length;

      if (atCount === 1) {
        PopupList = Space;
      } else if (atCount === 2) {
        PopupList = Team;
      } else if (atCount === 3) {
        PopupList = Employee;
      }
      const atIndex = text.lastIndexOf("@");
      if (atIndex !== -1) {
        const substring = text.substring(atIndex + 1);
        const matches = PopupList.filter((user) =>
          user.name.toLowerCase().startsWith(substring.toLowerCase())
        );

        console.log("Suggested matches:", matches);
        if (matches.length > 0) {
          setSuggestedUsers(matches);
          const range = window.getSelection()?.getRangeAt(0);
          if (range) {
            const rect = range.getBoundingClientRect();
            setPopupPosition({
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX,
            });
            setPopupVisible(true);
          }
        } else {
          setPopupVisible(false);
        }
      } else {
        setPopupVisible(false);
      }

      text = text.replace(/(@\w+)/g, "<span>$1</span>");
      styledInput.innerHTML = text;

      document.querySelectorAll("#styledInput span").forEach((span, index) => {
        if (index === 0) {
          (span as HTMLElement).style.color = "#df478e";
        } else if (index === 1) {
          (span as HTMLElement).style.color = "#8692ee";
        } else if (index === 2) {
          (span as HTMLElement).style.color = "#62e78a";
        }
      });

      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(styledInput);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    };

    styledInput.addEventListener("input", handleInput);
    return () => styledInput.removeEventListener("input", handleInput);
  }, [PopupList]);

  const handleUserSelect = (user: User) => {
    const styledInput = styledInputRef.current;
    if (styledInput) {
      let text = styledInput.innerText || "";
      const atIndex = text.lastIndexOf("@");
      const newText = text.substring(0, atIndex) + `@${user.name}`;
      styledInput.innerText = newText;
      styledInput.dispatchEvent(new Event("input"));
      setPopupVisible(false);
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
    <div className="">
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
            <MentionInput
              text={text}
              setText={setText}
              setTaskErrorMessage={setTaskErrorMessage}
            />
            <p className="text-red-500 text-left my-1 text-sm">
              {taskErrorMessage && "Please fill the message with mentions"}
            </p>
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
                    {/* <CalendarIcon /> */}
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
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
}
