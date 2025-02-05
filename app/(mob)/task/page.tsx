"use client";
import {
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Drawer,
} from "@/components/ui/drawer";
import Image from "next/image";
import { useEffect, useState } from "react";
import { RiArrowDropDownLine, RiBarChartHorizontalLine } from "react-icons/ri";
import profile from "@/public/images/img-placeholder.svg";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useGlobalContext } from "@/context/store";
import { Check } from "lucide-react";
import { Command, CommandList } from "@/components/ui/command";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { OverdueListSkeleton } from "@/app/(web)/components/skeleton-ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format,subDays,addDays } from "date-fns";
import { Calendar, Calendar as CustomCalendar } from "@/components/ui/calendar";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { FaEllipsisH } from "react-icons/fa";
// import { NewTask } from "@/components/newTask";
import smile from "@/public/images/smile-img.png";
import { useSwipeable } from "react-swipeable";
import { Trash2, CheckCircle, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import Footer from "../footer/page";

const UsertaskStatusOptions = [
  {
    value: "todo",
    label: "todo",
  },
  {
    value: "In progress",
    label: "In progress",
  },
  {
    value: "feedback",
    label: "feedback",
  },
];

const adminTaskStatusOptions = [
  {
    value: "todo",
    label: "todo",
  },
  {
    value: "In progress",
    label: "In progress",
  },
  {
    value: "feedback",
    label: "feedback",
  },
  {
    value: "Completed",
    label: "Completed",
  },
];

const Task = () => {
  const { userId } = useGlobalContext();
  const router = useRouter();

  const [isSpaceDrawerOpen, setIsSpaceDrawerOpen] = useState(false);
  const [allSpace, setAllSpace] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [userSpace, setUserSpace] = useState<any[]>([]);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<any>({});
  const [isTeamDrawerOpen, setIsTeamDrawerOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>({});
  const [taskLoading, setTaskLoading] = useState(true);
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<string | null>(
    null
  );
  const [swipedTaskId, setSwipedTaskId] = useState<number | null>(null);
  const [searchTasks, setSearchTasks] = useState("");
  const [filteredTasksBySearch, setFilteredTasksBySearch] = useState<any[]>([]);
  const [taskLoadingSearch, setTaskLoadingSearch] = useState(false);
  const [filterDate, setFilterDate] = useState<Date | null>(new Date());
  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };

    return date.toLocaleDateString("en-GB", options); // 'en-GB' gives the format "23 Aug 2024"
  };

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
    };
    fetchData();
    setTaskLoading(false);
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
      const matchedSpaceIds = new Set(
        matchedTeams.map((team) => team.space_id)
      );

      const matchedSpaces = allSpace.filter((space) =>
        matchedSpaceIds.has(space.id)
      );
      setUserSpace(matchedSpaces);
      setTaskLoading(false);
    }
  }, [allSpace, allTeams, allTasks, userId]);

  useEffect(() => {
    if (userSpace.length > 0) {
      setSelectedSpace(userSpace[0]);
    }
  }, [userSpace]);

  useEffect(() => {
    console.log(allTeams);
    var filteredTeams = null;

    if (userId?.role == "owner") {
      filteredTeams = allTeams.filter(
        (team: any) => team.space_id === selectedSpace?.id
      );

      console.log("Filtered Teams:", filteredTeams);
    } else {
      filteredTeams = allTeams.filter(
        (team) =>
          selectedSpace?.id === team.space_id &&
          team.members.some(
            (member: any) =>
              member?.name === userId?.username ||
              member?.entity_name === userId?.entity_name
          )
      );
    }
    setUserTeams(filteredTeams);
    setSelectedTeam(filteredTeams[0]);
  }, [selectedSpace]);

  // useEffect(() => {
  //   console.log("Selected Team:", selectedTeam);

  //   var filteredTasks = null;
  //   if (userId?.role == "owner") {
  //     filteredTasks = allTasks.filter(
  //       (task: any) => task.team_id === selectedTeam?.id
  //     );

  //     setUserTasks(filteredTasks);
  //   } else {
  //     filteredTasks = allTasks.filter(
  //       (task: any) =>
  //         selectedTeam?.id === task.team_id &&
  //         task.mentions.some(
  //           (mention: string) =>
  //             mention === "@everyone" || mention === `@${userId?.entity_name}`
  //         )
  //     );
  //     setUserTasks(filteredTasks);
  //   }
  //   setTaskLoading(false);
  //   console.log("Filtered Tasks:", filteredTasks);
  // }, [selectedTeam, allTasks]);
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
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong. Please try again.",
        duration: 3000,
      });
    }
  };
  // Filter tasks based on selectedTaskStatus
  const filteredTasks = selectedTaskStatus
    ? userTasks.filter((task) => task.task_status === selectedTaskStatus)
    : userTasks; // Show all if no filter is selected

  // const handlers = useSwipeable({
  //   onSwipedLeft: () => setSwipedTaskId(taskId),
  //   onSwipedRight: () => setSwipedTaskId(null),
  //   preventScrollOnSwipe: true,
  //   trackMouse: true,
  // });

  const handleDeleteTask = async (taskId: string) => {
    console.log("task deleted");
    const { data, error } = await supabase
      .from("tasks")
      .update({ is_deleted: true })
      .eq("id", taskId);
  };
  const handleCompleteTask = (taskId: string) => {};
  const handleSearchByTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTasks(value);

    if (!value.trim()) {
      // If input is empty, don't show tasks
      setFilteredTasksBySearch([]);
      return;
    }

    // Filter tasks based on role
    const filtered = allTasks.filter((task: any) => {
      const isTeamMatch = selectedTeam?.id === task.team_id;
      const hasMentionMatch = task.mentions.some((mention: string) =>
        mention.toLowerCase().includes(value)
      );

      if (userId?.role === "owner") {
        return isTeamMatch && hasMentionMatch; // Owner: all tasks in the team with matching mentions
      } else {
        const isUserMentioned = task.mentions.includes(
          `@${userId?.entity_name}`
        );
        return isTeamMatch && isUserMentioned && hasMentionMatch; // User: Only their own tasks
      }
    });

    setFilteredTasksBySearch(filtered);
  };
  // Function to move date backward
const handlePrevDate = () => {
  setFilterDate((prevDate) => {
    const newDate = prevDate ? subDays(prevDate, 1) : new Date();
    setHasUserSelectedDate(true); // User interaction
    return newDate;
  });
};

// Function to move date forward
const handleNextDate = () => {
  setFilterDate((prevDate) => {
    const newDate = prevDate ? addDays(prevDate, 1) : new Date();
    setHasUserSelectedDate(true); // User interaction
    return newDate;
  });
};
useEffect(() => {
  console.log("Selected Team:", selectedTeam);
  console.log("Selected Date:", filterDate);
  console.log("Has user selected a date?", hasUserSelectedDate);

  if (!selectedTeam || !filterDate || !hasUserSelectedDate) {
    setUserTasks([]); // Reset tasks if no team selected or user hasn't selected a date
    return;
  }

  const formattedDate = format(filterDate, "yyyy-MM-dd"); // Format selected date

  let filteredTasks = null;

  if (userId?.role === "owner") {
    // Owners see all tasks from the selected team for the selected created date
    filteredTasks = allTasks.filter(
      (task: any) =>
        task.team_id === selectedTeam.id &&
        format(new Date(task.created_date), "yyyy-MM-dd") === formattedDate
    );
  } else {
    // Regular users see tasks assigned to them or "@everyone" for the selected created date
    filteredTasks = allTasks.filter(
      (task: any) =>
        task.team_id === selectedTeam.id &&
        format(new Date(task.created_date), "yyyy-MM-dd") === formattedDate &&
        task.mentions.some(
          (mention: string) =>
            mention === "@everyone" || mention === `@${userId?.entity_name}`
        )
    );
  }

  setUserTasks(filteredTasks);
  setTaskLoading(false);
  console.log("Filtered Tasks:", filteredTasks);
}, [selectedTeam, allTasks, filterDate, hasUserSelectedDate]); // Runs when team, tasks, or date changes

  return (
    <>
    <div className="flex flex-col bg-navbg px-[18px] space-y-[18px] pb-8">
      <header className="flex justify-between items-center bg-navbg pt-[18px]">
        <Drawer open={isSpaceDrawerOpen} onOpenChange={setIsSpaceDrawerOpen}>
          <DrawerTrigger onClick={() => setIsSpaceDrawerOpen(true)}>
            <div className="flex w-10 h-10 justify-center items-center rounded-[10px] border border-zinc-300 bg-bgwhite">
              <RiBarChartHorizontalLine className="text-black h-6 w-6" />
            </div>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader className="text-left">
                <DrawerTitle>Spaces</DrawerTitle>
              </DrawerHeader>
              <div className="pb-7">
                <ul>
                  {userSpace.map((space: any, index: number) => (
                    <li
                      key={index}
                      role="button"
                      tabIndex={0}
                      className={`flex items-center justify-between text-black py-2 px-4 border-b border-[#D4D4D8] ${
                        selectedSpace === space.space_name ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        setSelectedSpace(space);
                        setIsSpaceDrawerOpen(false);
                      }}
                    >
                      <span>{space.space_name}</span>
                      {selectedSpace?.space_name === space.space_name && (
                        <Check className="text-black" size={18} />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
        <div className="w-[180px] h-6 text-center">
          <h2 className="text-lg font-bold font-gesit text-blackish text-center">
            {selectedSpace.space_name}
          </h2>
        </div>
        <Image
          src={userId?.profile_image || profile}
          alt="Profile"
          className="rounded-full"
          width={40}
          height={40}
        />
      </header>

      <div className="flex justify-between">
        <Drawer open={isTeamDrawerOpen} onOpenChange={setIsTeamDrawerOpen}>
          <DrawerTrigger>
            <div className="bg-white py-3 rounded-xl border h-[40px] w-full border-gray-300 px-[18px] flex items-center">
              <p>{selectedTeam?.team_name}</p>
              <RiArrowDropDownLine className="w-[18px] h-[18px] text-black ml-auto" />
            </div>
          </DrawerTrigger>
          <DrawerContent className="h-[70%]">
            <DrawerTitle className="pt-[18px] px-5">Teams</DrawerTitle>
            <Command>
              <CommandList>
                <ul className="mt-4 space-y-3 py-5 px-5 pt-3">
                  {userTeams.map((team: any, index: number) => (
                    <li
                      key={index}
                      role="button"
                      tabIndex={0}
                      className={`flex items-center justify-between text-black py-2 px-4 border-b border-[#D4D4D8] ${
                        selectedTeam === team.team_name ? "bg-gray-100" : ""
                      }`}
                      onClick={() => {
                        setSelectedTeam(team);
                        setIsTeamDrawerOpen(false);
                      }}
                    >
                      <span>{team.team_name}</span>
                      {selectedTeam?.team_name === team.team_name && (
                        <Check className="text-black" size={18} />
                      )}
                    </li>
                  ))}
                </ul>
              </CommandList>
            </Command>
          </DrawerContent>
        </Drawer>
        <div className="flex gap-2">
          <div className="w-10 h-10">
            <Sheet>
              <SheetTrigger>
                <FiSearch className="absolute mt-3 ml-[12px] text-zinc-500" />
                <input
                  type="text"
                  className="w-10 h-10 justify-center items-center gap-[6px] rounded-lg border border-zinc-300 bg-white"
                />
              </SheetTrigger>
              <SheetContent className="w-full bg-mobbg p-4">
                {/* Search Input */}
                <div className="relative w-[90%]">
                  <FiSearch className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Search ..."
                    value={searchTasks}
                    onChange={handleSearchByTasks}
                    className="rounded-[10px] bg-white h-10 pl-10 w-full border-[#D4D4D8]"
                  />
                  <X
                    size={14}
                    className="absolute right-3 top-3 cursor-pointer w-4 h-5 text-zinc-500"
                    onClick={() => setSearchTasks("")}
                  />
                </div>

                {/* Filtered Tasks List */}
                <div className="mt-4">
                  {taskLoadingSearch ? (
                    <OverdueListSkeleton />
                  ) : filteredTasksBySearch.length === 0 ? (
                    <div className="w-full h-full flex justify-center items-center">
                      <p className="text-[#A6A6A7] text-lg font-medium">
                        No Task Found
                      </p>
                    </div>
                  ) : (
                    filteredTasksBySearch.map((task: any, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-white border border-zinc-300 rounded-lg mb-2"
                      >
                        <div className="w-full">
                          <div className="flex justify-between items-center">
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
                            {new Date(task.due_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
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
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Drawer
            open={isFilterDrawerOpen}
            onOpenChange={setIsFilterDrawerOpen}
          >
            <DrawerTrigger onClick={() => setIsFilterDrawerOpen(true)}>
              <div className="flex w-10 h-10  p-[8px_12px] justify-center items-center gap-[6px] rounded-lg border border-zinc-300 bg-white">
                <FaEllipsisH className="h-4 w-6" />
              </div>
            </DrawerTrigger>
            <DrawerContent className="h-[70%]">
              <DrawerTitle className="pt-[18px] px-5">Filter</DrawerTitle>
              <Command>
                <CommandList>
                  <p> {userId?.role}</p>
                  <ul className="mt-4 space-y-5 px-5 pt-3">
                    {userId?.role === "owner"
                      ? adminTaskStatusOptions.map((status) => (
                          <li
                            key={status.value}
                            onClick={() => {
                              setSelectedTaskStatus(status.value);
                              setIsFilterDrawerOpen(false); // Close the drawer on selection
                            }}
                            className={`flex items-center border-b-[1px] border-zinc-300 cursor-pointer ${
                              selectedTaskStatus === status.value
                                ? "text-zinc-950 font-semibold"
                                : "text-blackish"
                            }`}
                          >
                            {status.label}
                          </li>
                        ))
                      : UsertaskStatusOptions.filter(
                          (status) => status.value !== "Completed"
                        ).map((status) => (
                          <li
                            key={status.value}
                            onClick={() => {
                              setSelectedTaskStatus(status.value);
                              setIsFilterDrawerOpen(false); // Close the drawer on selection
                            }}
                            className={`flex items-center border-b-[1px] border-zinc-300 cursor-pointer ${
                              selectedTaskStatus === status.value
                                ? "text-zinc-950 font-semibold"
                                : "text-blackish"
                            }`}
                          >
                            {status.label}
                          </li>
                        ))}
                  </ul>
                </CommandList>
              </Command>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {/* Title */}
        <h4 className="font-semibold font-geist text-[18px] text-black  w-full">
          All Task
        </h4>

        {/* Controls Section */}
        <div className="flex space-x-2">
          {/* Left Arrow Button */}
          <button className="flex w-10 h-10 justify-center items-center rounded-[10px] border border-zinc-300 bg-white" onClick={handlePrevDate}>
            <FiChevronLeft className="w-6 h-6" />
          </button>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex w-[110px] h-10 px-4 font-geist justify-center items-center rounded-[10px] border border-zinc-300 bg-white text-[#09090B]">
            
              {filterDate ? format(filterDate, "dd MMM yy") : "Select Date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" 
               selected={filterDate || undefined}
               onSelect={(date) => {
                 if (date) setFilterDate(date);
                 setHasUserSelectedDate(true); // Mark user selection
               }}
              initialFocus />
            </PopoverContent>
          </Popover>

          {/* Right Arrow Button */}
          <button className="flex w-10 h-10 justify-center items-center rounded-[10px] border border-zinc-300 bg-white" onClick={handleNextDate}>
            <FiChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="w-full h-[calc(100vh-170px)] overflow-y-scroll playlist-scroll">
        {taskLoading ? (
          <OverdueListSkeleton />
        ) : filteredTasks.length == 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-[#A6A6A7] text-lg font-medium">No Task Found</p>
          </div>
        ) : (
          filteredTasks.map((task: any, index: number) => (
            <div key={index} 
            // {...handlers} 
            className="relative">
              <div
                onClick={() => setOpenTaskId(task.id)}
                className={`p-3 w-full bg-white border border-[#E1E1E1] mb-3 rounded-[10px] cursor-pointer transition-transform duration-300 ${
                  swipedTaskId === task.id ? "-translate-x-20" : "translate-x-0"
                }`}
              >
                <div className="w-full">
                  <div className="flex justify-between items-center">
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
                {/* Swipe Actions - Only visible when swiped */}
                {swipedTaskId === task.id && (
                  <div className="absolute right-0 top-0 h-full flex gap-2">
                    {userId?.role === "owner" && (
                      <button
                        className="bg-red-500 text-white p-2 rounded-l-lg flex items-center justify-center w-12"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    {userId?.role === "owner" &&
                      task.task_status !== "Completed" && (
                        <button
                          className="bg-green-500 text-white p-2 rounded-r-lg flex items-center justify-center w-12"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          <CheckCircle size={20} />
                        </button>
                      )}
                  </div>
                )}
              </div>

              {openTaskId === task.id && (
                <Drawer
                  open={openTaskId === null ? false : true}
                  onOpenChange={() => setOpenTaskId(null)}
                >
                  <DrawerContent className="px-4">
                    <DrawerHeader className="flex justify-between items-center px-0">
                      <DrawerTitle>Edit Task</DrawerTitle>
                      {userId?.role === "User" &&
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
                                : task.task_status === "In progress"
                                ? "text-[#EEA15A] bg-[#F8F0DA]"
                                : task.task_status === "feedback"
                                ? "text-[#142D57] bg-[#DEE9FC]"
                                : "text-[#3FAD51] bg-[#E5F8DA]"
                            }`}
                          >
                            <SelectValue placeholder="status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="In progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            {userId?.role === "owner" && (
                              <SelectItem value="Completed">
                                Completed
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </DrawerHeader>
                    <div className="p-4 border border-[#CECECE] rounded-[10px]">
                      <p>
                        <span className="text-[#BA6A6A]">
                          @{selectedSpace?.space_name}
                        </span>{" "}
                        <span className="text-[#5898C6]">
                          @{selectedTeam?.team_name}
                        </span>{" "}
                        <span className="text-[#518A37]">{task.mentions}</span>{" "}
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
          ))
        )}
        <div className="flex justify-center items-center py-5 font-geist gap-1">
          <Image
            src={smile}
            alt="smile-img"
            width={300}
            height={300}
            className="w-[42px] h-[42px] grayscale"
          />
          <p className="text-[#A7A7AB] text-[12px]">
            That's all for today !!!!
          </p>
        </div>
      </div>
      {/* <div className="fixed top-[300px ] z-50">
        <NewTask/>
        </div> */}
    </div>
    <Footer notifyMobTrigger={''}/>
    </>
    // </div>
  );
};

export default Task;
