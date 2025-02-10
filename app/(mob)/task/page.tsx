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
import { Check, LogOut } from "lucide-react";
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
import { format, subDays, addDays } from "date-fns";
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
import { Mention, MentionsInput } from "react-mentions";
import ReactMentions from "@/components/react-mentions";
import { logout } from "@/app/(signin-setup)/logout/action";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Footer from "../footer/page";
import "@/app/(mob)/task/style.css";
import { ToastAction } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";

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
    value: "Internal feedback",
    label: "Internal feedback",
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
    value: "Internal feedback",
    label: "Internal feedback",
  },
  {
    value: "Completed",
    label: "Completed",
  },
];

interface MentionData {
  id: number;
  display: string;
}

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
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false); // Controls calendar visibility
  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [profileLoader, setProfileLoader] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [swipedTasks, setSwipedTasks] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [editTaskInputValue, setEditTaskInputValue] = useState("");
  const [spaces, setSpaces] = useState<MentionData[]>([]);
  const [memberData, setMemberData] = useState<string[]>([]);
  const [employees, setEmployees] = useState<MentionData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: spaces }, { data: teams }, { data: tasks }] =
          await Promise.all([
            supabase.from("spaces").select("*").eq("is_deleted", false),
            supabase.from("teams").select("*").eq("is_deleted", false),
            supabase.from("tasks").select("*").eq("is_deleted", false),
          ]);

        if (spaces) setAllSpace(spaces);
        if (teams) setAllTeams(teams);
        if (tasks) setAllTasks(tasks);

        if (!userId) return;

        const matchedTeams =
          teams?.filter((team) =>
            team.members.some(
              (member: any) => member.entity_name === userId.entity_name
            )
          ) || [];

        const matchedSpaceIds = new Set(
          matchedTeams.map((team) => team.space_id)
        );
        const matchedSpaces =
          spaces?.filter((space) => matchedSpaceIds.has(space.id)) || [];
        setUserSpace(matchedSpaces);

        const getUniqueItems = (array: any, key: any) => {
          const seen = new Set();
          return array.filter((item: any) => {
            const value = item[key];
            if (!seen.has(value)) {
              seen.add(value);
              return true;
            }
            return false;
          });
        };

        const sourceData = userId.role === "owner" ? spaces : matchedSpaces;
        if (sourceData) {
          setSpaces(
            getUniqueItems(
              sourceData.map((space) => ({
                id: space.id,
                display: space.space_name,
              })),
              "display"
            )
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    if (userId?.role === "owner") {
      setUserSpace([...allSpace]);
    } else {
      const matchedTeams = allTeams.filter((team) =>
        team.members.some(
          (member: any) => member.entity_name === userId?.entity_name
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

  const today = new Date();
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };

    return date.toLocaleDateString("en-GB", options); // 'en-GB' gives the format "23 Aug 2024"
  };

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

  useEffect(() => {
    fetchData();
    setTaskLoading(false);
  }, []);

  useEffect(() => {
    if (userId?.role === "owner") {
      setUserSpace([...allSpace]);
    } else {
      const matchedTeams = allTeams.filter((team) =>
        team.members.some(
          (member: any) => member.entity_name === userId?.entity_name
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
        const updatedFields: {
          due_date?: string;
          task_status?: string;
          task_content?: string;
          mentions?: string[];
        } = {};
  
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
  
        if (editTaskInputValue) {
          let mentions: string[] = [];
  
          // Extract @mentions
          const mentionPattern = /@\w+(?:_\w+)*\b/g;
          const extractedMentions =
            editTaskInputValue.match(mentionPattern) || [];
          mentions.push(...extractedMentions);
  
          // Extract mentions from brackets
          const bracketPattern = /\[\s*([^\]]+)\s*\]\(\s*([^)]+)\s*\)/g;
          let match: RegExpExecArray | null;
          while ((match = bracketPattern.exec(editTaskInputValue)) !== null) {
            mentions.push(`@${match[1]}`);
          }
  
          // Remove duplicate mentions
          mentions = Array.from(new Set(mentions));
  
          let plainText = editTaskInputValue
            .replace(/@\w+(?:_\w+)*\b/g, "") // Remove @mentions
            .replace(/\[\s*([^\]]+)\s*\]\(\s*([^)]+)\s*\)/g, "") // Remove bracket mentions
            .replace(/@/g, "") // Remove any remaining '@'
            .trim();
  
          updatedFields.task_content = plainText;
          updatedFields.mentions = mentions;
          console.log("inside new content");
        } else {
          updatedFields.task_content = currentTask.task_content;
          updatedFields.mentions = currentTask.mentions;
          console.log("inside old content");
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
        fetchData();
  
        toast({
          title: "Success",
          description: "Task updated successfully.",
          variant: "default",
          duration: 3000,
        });
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
  const filteredTasks = userTasks.filter((task) =>
    selectedTaskStatus ? task.task_status === selectedTaskStatus : true
  );
  const handleSwipe = (taskId: number, direction: "left" | "right") => {
    setSwipedTasks((prev) => ({
      ...prev,
      [taskId]: direction === "left", // Swiped left means action buttons appear
    }));
  };

  const handleDeleteTask = async (taskId: string, teamId: string) => {
  const handleDeleteTask = async (taskId: string, teamId: string) => {
    setSwipedTasks((prev) => ({ ...prev, [taskId]: false })); // Close swipe
    console.log("task deleted", taskId, teamId);
    console.log("task deleted", taskId, teamId);
    const { data, error } = await supabase
      .from("tasks")
      .update({ is_deleted: true })
      .eq("team_id", teamId)
      .eq("id", taskId);
    if (error) throw error;
    const fetchData = async () => {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_deleted", false);

      if (tasks) setAllTasks(tasks);
    };
    fetchData();
    toast({
      title: "Deleted Successfully!",
      description: "Task deleted successfully!",
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => handleTaskUndo(teamId, taskId)}
        >
          Undo
        </ToastAction>
      ),
    });
    if (error) throw error;
    const fetchData = async () => {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_deleted", false);

      if (tasks) setAllTasks(tasks);
    };
    fetchData();
    toast({
      title: "Deleted Successfully!",
      description: "Task deleted successfully!",
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => handleTaskUndo(teamId, taskId)}
        >
          Undo
        </ToastAction>
      ),
    });
  };
  const handleTaskUndo = async (teamId: string, taskId: string) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ is_deleted: false })
        .eq("team_id", teamId)
        .eq("id", taskId);

      if (error) throw error;
      const fetchData = async () => {
        const { data: tasks } = await supabase
          .from("tasks")
          .select("*")
          .eq("is_deleted", false);


        if (tasks) setAllTasks(tasks);
      };

      // fetchTasks(); // Refresh the tasks list
      fetchData();

      fetchData();

      toast({
        title: "Undo Successful",
        description: "The task has been restored.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error undoing delete:", error);
      toast({
        title: "Error",
        description: "Failed to restore the task. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  const handleCompleteTask = async (id: number) => {
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
      const updatedFields: { task_status?: string } = {};

        updatedFields.task_status = "Completed";

      // Update the task
      const { error } = await supabase
        .from("tasks")
        .update(updatedFields)
        .eq("id", id);

      if (error) throw new Error("Failed to update the task");

      // Refresh task data and reset state

      setOpenTaskId(null);
      setDate(undefined);
      setTaskStatus("");
      fetchData();

      toast({
        title: "Task Updated",
        description: "The task has been updated successfully.",
        duration: 3000,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Something went wrong. Please try again.",
        duration: 3000,
      });
    }
    setSwipedTasks((prev) => ({ ...prev, [id]: false })); // Close swipe
  };
  const handleSearchByTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTasks(value);

    if (!value.trim()) {
      // If input is empty, don't show tasks
      setFilteredTasksBySearch([]);
      return;
    }

    // Filter tasks based on role
    const filtered = userTasks.filter((task: any) => {
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
  // useEffect(() => {
  //   setFilteredTasksBySearch(filtered)
  // }, [allTasks, selectedTeam, selectedTaskStatus, userId, filterDate])
  // Function to move date backward
  useEffect(() => {
    if (!selectedTeam || !hasUserSelectedDate || !filterDate) return;

    setTaskLoading(true);
    const selectedDate = format(filterDate, "yyyy-MM-dd");
    let filteredTasks = [];

    if (userId?.role === "owner") {
      filteredTasks = allTasks.filter(
        (task) =>
          task.team_id === selectedTeam.id &&
          format(new Date(task.time), "yyyy-MM-dd") === selectedDate
      );
    } else {
      filteredTasks = allTasks.filter(
        (task) =>
          task.team_id === selectedTeam.id &&
          format(new Date(task.time), "yyyy-MM-dd") === selectedDate &&
          task.mentions.some(
            (mention: any) =>
              mention === "@everyone" || mention === `@${userId?.entity_name}`
          )
      );
    }

    setUserTasks(filteredTasks);
    setTaskLoading(false);
  }, [filterDate, hasUserSelectedDate]); // Only fetch tasks on date change

  // Fetch tasks immediately when team changes
  useEffect(() => {
    if (!selectedTeam) return;

    setTaskLoading(true);
    let filteredTasks = [];

    if (userId?.role === "owner") {
      filteredTasks = allTasks.filter(
        (task) => task.team_id === selectedTeam.id
      );
    } else {
      filteredTasks = allTasks.filter(
        (task) =>
          task.team_id === selectedTeam.id &&
          task.mentions.some(
            (mention: any) =>
              mention === "@everyone" || mention === `@${userId?.entity_name}`
          )
      );
    }

    setUserTasks(filteredTasks);
    setTaskLoading(false);
  }, [selectedTeam]); // Fetch only on team change

  // Reset date to today but do not fetch tasks when space/team changes
  useEffect(() => {
    setFilterDate(today);
    setHasUserSelectedDate(false);
  }, [selectedTeam, selectedSpace]);

  // Date selection functions
  const handlePrevDate = () => {
    setFilterDate((prev) => subDays(prev || today, 1));
    setHasUserSelectedDate(true);
  };

  const handleNextDate = () => {
    setFilterDate((prev) => addDays(prev || today, 1));
    setHasUserSelectedDate(true);
  };
  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingOut(true); // Show loader when logging out
    await logout();
    setIsLoggingOut(false); // Hide loader after logout completes
  };

  useEffect(() => {
    const redirectToTask = () => {
      router.push("/task");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
      // setLoading(false);
      return;
    } else {
      router.push("/dashboard");
      // setLoading(false);
    }
  }, [router]);

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
          members.map((member) => ({
            id: member.id,
            display: member.entity_name,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching task data:", err);
    }
  };

  const handleChange = (event: { target: { value: string } }) => {
    const newValue = event.target.value;
    setEditTaskInputValue(newValue);
    console.log(newValue);

    fetchTeamsAndTasks();
  };

  return (
    <>
      <div className="flex flex-col bg-navbg px-[18px] h-[463px] space-y-[18px] ">
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
                          selectedSpace === space.space_name
                            ? "bg-gray-100"
                            : ""
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
            {selectedSpace ? (
              <h2 className="text-lg font-bold font-gesit text-blackish text-center">
                {selectedSpace.space_name}
              </h2>
            ) : (
              <Skeleton className=" bg-gray-300 w-full h-full" />
            )}
          </div>
          <Select open={selectOpen} onOpenChange={setSelectOpen}>
            <SelectTrigger className="w-auto h-[44px] border-none focus-visible:border-none focus-visible:outline-none text-sm font-bold shadow-none pl-2 justify-start gap-1">
              <Image
                src={userId?.profile_image || profile}
                alt="Profile"
                className="rounded-full"
                width={40}
                height={40}
              />
            </SelectTrigger>
            <SelectContent className="w-[150px] py-3">
              {/* <div className="py-3 my-3 text-gray-700 border-t border-b border-gray-200 px-3 cursor-pointer"> */}
              <p
                onClick={() => {
                  setProfileLoader(true);
                  setTimeout(() => {
                    router.push("/profile");
                    setProfileLoader(false);
                  }, 1000);
                }}
                className={`text-sm pb-3 mb-3 pl-3.5 border-b border-gray-300 font-medium cursor-pointer`}
              >
                {profileLoader ? (
                  <svg
                    className="animate-spin h-5 w-5 m-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#1A56DB"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-100"
                      fill="#1A56DB"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Your Profile"
                )}
              </p>
              {/* </div> */}
              <form onSubmit={handleLogout} className="flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        typeof="submit"
                        className="rounded bg-button_orange text-white cursor-pointer hover:bg-button_orange relative"
                        style={isLoggingOut ? { pointerEvents: "none" } : {}}
                      >
                        {isLoggingOut ? (
                          <div className="ml-20 flex items-center justify-center text-center">
                            <svg
                              className="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="#1A56DB"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="#1A56DB"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </div>
                        ) : (
                          <p className="text-sm text-[#F05252] px-3 flex items-center gap-2 cursor-pointer">
                            <LogOut size={20} />
                            Sign Out
                          </p>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </form>
            </SelectContent>
          </Select>
        </header>

        <div className="flex justify-between">
          <Drawer open={isTeamDrawerOpen} onOpenChange={setIsTeamDrawerOpen}>
            <DrawerTrigger>
              <div className="bg-white py-3 rounded-xl border h-[40px] w-full border-gray-300 px-[18px] flex items-center">
                <p>{selectedTeam?.team_name || "Select a Team"}</p>
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
                <SheetContent className="w-full bg-mobbg p-4  flex flex-col">
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
                      onClick={() => {
                        setSearchTasks("");
                        setFilteredTasksBySearch([]);
                      }}
                    />
                  </div>

                  {/* Filtered Tasks List */}
                  <div className="mt-4 w-full flex-1 h-[60vh] overflow-y-auto playlist-scroll">
                    {taskLoading ? (
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
                          key={task.id}
                          className="relative"
                          {...(userId?.role === "owner" && {
                            onTouchStart: (e) => {
                              const startX = e.touches[0].clientX;
                              const handleTouchMove = (
                                moveEvent: TouchEvent
                              ) => {
                                const endX = moveEvent.touches[0].clientX;
                                if (startX - endX > 50) {
                                  handleSwipe(task.id, "left"); // Swipe left
                                  document.removeEventListener(
                                    "touchmove",
                                    handleTouchMove
                                  );
                                } else if (endX - startX > 50) {
                                  handleSwipe(task.id, "right"); // Swipe right
                                  document.removeEventListener(
                                    "touchmove",
                                    handleTouchMove
                                  );
                                }
                              };
                              document.addEventListener(
                                "touchmove",
                                handleTouchMove
                              );
                            },
                          })}
                        >
                          {/* Task Card */}
                          <div
                            onClick={() => setOpenTaskId(task.id)}
                            className={`p-3 w-full bg-white border border-[#E1E1E1] mb-3 rounded-[10px] cursor-pointer transition-transform duration-300 ${
                              swipedTasks[task.id]
                                ? "-translate-x-32"
                                : "translate-x-0"
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
                                    : task.task_status === "Internal feedback"
                                    ? "text-[#142D57] bg-[#DEE9FC]"
                                    : "text-[#3FAD51] bg-[#E5F8DA]"
                                }`}
                              >
                                {task.task_status}
                              </span>
                            </div>
                          </div>

                          {/* Swipe Actions (Only visible when swiped & owner) */}
                          {userId?.role === "owner" && swipedTasks[task.id] && (
                            <div
                              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center space-x-2 
                          {/* Swipe Actions (Only visible when swiped & owner) */}
                          {userId?.role === "owner" && swipedTasks[task.id] && (
                            <div
                              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center space-x-2 
            z-50 transition-all duration-300"
                            >
                              <button
                                className="bg-green-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center cursor-pointer"
                                onClick={() => handleCompleteTask(task.id)}
                              >
                                <Check className="w-6 h-6" />
                              </button>
                            >
                              <button
                                className="bg-green-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center cursor-pointer"
                                onClick={() => handleCompleteTask(task.id)}
                              >
                                <Check className="w-6 h-6" />
                              </button>

                              <button
                                className="bg-red-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center"
                                onClick={() =>
                                  handleDeleteTask(task.id, task.team_id)
                                }
                              >
                                <Trash2 className="w-6 h-6" />
                              </button>
                            </div>
                          )}
                              <button
                                className="bg-red-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center"
                                onClick={() =>
                                  handleDeleteTask(task.id, task.team_id)
                                }
                              >
                                <Trash2 className="w-6 h-6" />
                              </button>
                            </div>
                          )}

                          {/* Task Drawer (Edit Task) */}
                          {openTaskId === task.id && (
                            <Drawer
                              open={openTaskId !== null}
                              onOpenChange={() => setOpenTaskId(null)}
                            >
                              <DrawerContent className="px-4">
                                <DrawerHeader className="flex justify-between items-center px-0">
                                  <DrawerTitle>Edit Task</DrawerTitle>
                                  <Select
                                    defaultValue={task.task_status}
                                    onValueChange={(value) =>
                                      setTaskStatus(value)
                                    }
                                  >
                                    <SelectTrigger
                                      className={`w-[120px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none ${
                                        task.task_status === "todo"
                                          ? "text-reddish bg-[#F8DADA]"
                                          : task.task_status === "In progress"
                                          ? "text-[#EEA15A] bg-[#F8F0DA]"
                                          : "text-[#142D57] bg-[#DEE9FC]"
                                      }`}
                                    >
                                      <SelectValue placeholder="status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="todo">
                                        To Do
                                      </SelectItem>
                                      <SelectItem value="In progress">
                                        In Progress
                                      </SelectItem>
                                      <SelectItem value="Internal feedback">
                                        Internal feedback
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </DrawerHeader>

                                {/* Task Details */}
                                <div className="p-4 border border-[#CECECE] rounded-[10px]">
                                  <p>
                                    <span className="text-[#BA6A6A]">
                                      @{selectedSpace?.space_name}
                                    </span>{" "}
                                    <span className="text-[#5898C6]">
                                      @{selectedTeam?.team_name}
                                    </span>{" "}
                                    <span className="text-[#518A37]">
                                      {task.mentions}
                                    </span>{" "}
                                    {task.task_content}
                                  </p>
                                </div>
                                {/* Task Details */}
                                <div className="p-4 border border-[#CECECE] rounded-[10px]">
                                  <p>
                                    <span className="text-[#BA6A6A]">
                                      @{selectedSpace?.space_name}
                                    </span>{" "}
                                    <span className="text-[#5898C6]">
                                      @{selectedTeam?.team_name}
                                    </span>{" "}
                                    <span className="text-[#518A37]">
                                      {task.mentions}
                                    </span>{" "}
                                    {task.task_content}
                                  </p>
                                </div>

                                {/* Task Actions */}
                                <div className="w-full flex items-center gap-3 mt-5 mb-8">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={"outline"}
                                        className="w-1/2 justify-center text-left font-normal"
                                      >
                                        {date ? (
                                          format(date, "PPP")
                                        ) : (
                                          <span>{task.due_date}</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-auto p-0"
                                      align="start"
                                    >
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
                                    onClick={() =>
                                      handleUpdateTask(task.id)
                                    }
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
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <Drawer
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
            >
              <DrawerTrigger onClick={() => setIsFilterDrawerOpen(true)}>
                <div className="flex w-10 h-10 p-2 justify-center items-center rounded-lg border border-zinc-300 bg-white">
                  <FaEllipsisH className="h-4 w-6" />
                </div>
              </DrawerTrigger>
              <DrawerContent className="h-[70%]">
                <DrawerTitle className="pt-[18px] px-5">Filter</DrawerTitle>
                <Command>
                  <CommandList>
                    {/* <p> {userId?.role}</p> */}
                    <ul className="mt-4 space-y-5 px-5 pt-3">
                      {userId?.role === "owner"
                        ? adminTaskStatusOptions.map((status) => (
                            <li
                              key={status.value}
                              tabIndex={0}
                              role="button"
                              onClick={() => {
                                setSelectedTaskStatus(status.value);
                                setIsFilterDrawerOpen(false); // Close drawer on selection
                              }}
                              className={`flex items-center justify-between border-b border-zinc-300 pb-2 cursor-pointer ${
                                selectedTaskStatus === status.value
                                  ? "text-zinc-950 font-semibold"
                                  : "text-blackish"
                              }`}
                            >
                              <span>{status.label}</span>
                              {selectedTaskStatus === status.value && (
                                <Check className="h-4 w-4 text-zinc-950" />
                              )}
                            </li>
                          ))
                        : UsertaskStatusOptions.filter(
                            (status) => status.value !== "Completed"
                          ).map((status) => (
                            <li
                              key={status.value}
                              tabIndex={0}
                              role="button"
                              onClick={() => {
                                setSelectedTaskStatus(status.value);
                                setIsFilterDrawerOpen(false); // Close drawer on selection
                              }}
                              className={`flex items-center justify-between border-b border-zinc-300 pb-2 cursor-pointer ${
                                selectedTaskStatus === status.value
                                  ? "text-zinc-950 font-semibold"
                                  : "text-blackish"
                              }`}
                            >
                              <span>{status.label}</span>
                              {selectedTaskStatus === status.value && (
                                <Check className="h-4 w-4 text-zinc-950" />
                              )}
                            </li>
                          ))}
                    </ul>
                  </div>
                </div>
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
            <button
              className="flex w-10 h-10 justify-center items-center rounded-[10px] border border-zinc-300 bg-white"
              onClick={handlePrevDate}
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>

            {/* Date Picker */}
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex w-[110px] h-10 px-4 font-geist justify-center items-center rounded-[10px] border border-zinc-300 bg-white text-[#09090B]"
                  onClick={() => setPopoverOpen(true)}
                >
                <button
                  className="flex w-[110px] h-10 px-4 font-geist justify-center items-center rounded-[10px] border border-zinc-300 bg-white text-[#09090B]"
                  onClick={() => setPopoverOpen(true)}
                >
                  {filterDate
                    ? format(filterDate, "dd MMM yy")
                    : format(new Date(), "dd MMM yy")}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filterDate ?? new Date()}
                  onSelect={(date) => {
                    setFilterDate(date || today);
                    setHasUserSelectedDate(true);
                    setPopoverOpen(false); // Close calendar
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Right Arrow Button */}
            <button
              className="flex w-10 h-10 justify-center items-center rounded-[10px] border border-zinc-300 bg-white"
              onClick={handleNextDate}
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="w-full overflow-y-scroll playlist-scroll relative">
          {taskLoading ? (
            <OverdueListSkeleton />
          ) : filteredTasks.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center">
              <p className="text-[#A6A6A7] text-lg font-medium">
                No Task Found
              </p>
            </div>
          ) : (
            filteredTasks.map((task: any, index: number) => (
              <div
                key={task.id}
                className="relative"
                {...(userId?.role === "owner" && {
                  onTouchStart: (e) => {
                    const startX = e.touches[0].clientX;
                    const handleTouchMove = (moveEvent: TouchEvent) => {
                      const endX = moveEvent.touches[0].clientX;
                      if (startX - endX > 50) {
                        handleSwipe(task.id, "left"); // Swipe left
                        document.removeEventListener(
                          "touchmove",
                          handleTouchMove
                        );
                      } else if (endX - startX > 50) {
                        handleSwipe(task.id, "right"); // Swipe right
                        document.removeEventListener(
                          "touchmove",
                          handleTouchMove
                        );
                      }
                    };
                    document.addEventListener("touchmove", handleTouchMove);
                  },
                })}
              >
                {/* Task Card */}
                <div
                  onClick={() => {
                    setOpenTaskId(task.id);
                    setEditTaskInputValue(
                      task.mentions
                        .map((mention: string) => `${mention}`)
                        .join(" ") +
                        " " +
                        task.task_content
                    );
                  }}
                  className={`p-3 w-full bg-white border border-[#E1E1E1] mb-3 rounded-[10px] cursor-pointer transition-transform duration-300 ${
                    swipedTasks[task.id] ? "-translate-x-32" : "translate-x-0"
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
                          : task.task_status === "Internal feedback"
                          ? "text-[#142D57] bg-[#DEE9FC]"
                          : "text-[#3FAD51] bg-[#E5F8DA]"
                      }`}
                    >
                      {task.task_status}
                    </span>
                  </div>
                </div>

                {/* Swipe Actions (Only visible when swiped & owner) */}
                {userId?.role === "owner" && swipedTasks[task.id] && (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center space-x-2 
            z-50 transition-all duration-300"
                  >
                    <button
                      className="bg-green-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center cursor-pointer"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      <Check className="w-6 h-6" />
                    </button>

                    <button
                      className="bg-red-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center"
                      onClick={() => handleDeleteTask(task.id, task.team_id)}
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                )}

                {/* Task Drawer (Edit Task) */}
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
                              className={`w-[130px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none ${
                                task.task_status === "todo"
                                  ? "text-reddish bg-[#F8DADA]"
                                  : task.task_status === "In progress"
                                  ? "text-[#EEA15A] bg-[#F8F0DA]"
                                  : task.task_status ===
                                    "Internal feedback"
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
                              <SelectItem value="Internal feedback">
                                 Internal feedback
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </DrawerHeader>
                      <div className=" border-black rounded-[10px] text-center">
                        <MentionsInput
                          value={editTaskInputValue}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          placeholder="Type @ to mention spaces, teams, or employees"
                          className="mentions-input border p-2 rounded-md w-full"
                        >
                          <Mention
                            trigger="@"
                            data={employees}
                            displayTransform={(id, display) => `@${display} `}
                            className=""
                          />
                        </MentionsInput>

                        <div className="w-full flex items-center gap-3 my-4">
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
                                  <span>{task.due_date}</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                            onClick={() => handleUpdateTask(task.id)}
                          >
                            Update
                          </Button>
                        </div>
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
      </div>
      <Footer
      //  notifyMobTrigger = {notifyMobTrigger} setNotifyMobTrigger = {setNotifyMobTrigger} test = {''} setTest={''}
      />
      //  notifyMobTrigger = {notifyMobTrigger} setNotifyMobTrigger = {setNotifyMobTrigger} test = {''} setTest={''}
      />
    </>
  );
};

export default Task;
