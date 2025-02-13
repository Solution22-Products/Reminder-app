"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Ellipsis, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WebMentionInput from "./webMentions";
import { Carousel1, CarouselContent1, CarouselItem1 } from "./webCarousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "react-datepicker/dist/react-datepicker.css";
import TaskDateUpdater from "./dueDate";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { supabase } from "@/utils/supabase/supabaseClient";
import { Toaster } from "@/components/ui/toaster";

interface SearchBarProps {
  spaceId: number;
  teamData: any;
  setTeamData: any;
  loggedUserData: any;
  searchValue: string;
  setSearchValue: any;
  teamFilterValue: string | null;
  setTeamFilterValue: any;
  taskStatusFilterValue: string | null;
  setTaskStatusFilterValue: any;
  dateFilterValue: string | null;
  setDateFilterValue: any;
  allTasks: any;
  filterTeams: any;
  setFilterTeams: any;
  filterFetchTeams: any;
  filterFetchTasks: any;
  notificationTrigger: any;
  setNotificationTrigger: any;
  newTabTeamTrigger: any;
}

interface Team {
  id: number;
  team_name: string;
  tasks: { id: number; inputValue: string }[];
  members: any[];
}

interface Tab {
  id: number;
  space_name: string;
  email: string;
  username: string;
  designation: string;
  role: string;
  department: string;
  task_created: number;
}

const SpaceTeam: React.FC<SearchBarProps> = ({
  spaceId,
  teamData,
  setTeamData,
  loggedUserData,
  searchValue,
  allTasks,
  filterTeams,
  setFilterTeams,
  filterFetchTeams,
  filterFetchTasks,
  notificationTrigger,
  setNotificationTrigger,
}) => {
  const styledInputRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState<string>("");
  const [taskErrorMessage, setTaskErrorMessage] = useState({
    status: false,
    errorId: 0,
  });
  const [taskStatus, setTaskStatus] = useState<string>("todo");
  const [teamName, setTeamName] = useState<string>("");
  const [teamNameSheetOpen, setTeamNameSheetOpen] = useState(false);
  const [addedMembers, setAddedMembers] = useState<any[]>([]);
  const [matchingUsers, setMatchingUsers] = useState<Tab[]>([]);
  const [noUserFound, setNoUserFound] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [taskDeleteOpen, setTaskDeleteOpen] = useState(false);
  const [updateTaskId, setUpdateTaskId] = useState({ teamId: 0, taskId: 0 });
  const [teamNameError, setTeamNameError] = useState(false);

  const [mentionTrigger, setMentionTrigger] = useState(false);
  const [loggedTeamId, setLoggedTeamId] = useState<number[]>([]);

  // const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const [openSheets, setOpenSheets] = useState<{ [key: string]: boolean }>({});
  const [openDialogs, setOpenDialogs] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Toggle functions
  const toggleDropdown = (teamId: string, isOpen: boolean) => {
    setOpenDropdowns((prev) => ({ ...prev, [teamId]: isOpen }));
  };

  const toggleSheet = (teamId: string, isOpen: boolean) => {
    setOpenSheets((prev) => ({ ...prev, [teamId]: isOpen }));
  };

  const toggleDialog = (teamId: string, isOpen: boolean) => {
    setOpenDialogs((prev) => ({ ...prev, [teamId]: isOpen }));
  };

  const fetchTeams = async () => {
    if (!spaceId) return;
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("is_deleted", false)
      .eq("space_id", spaceId);

    if (error) {
      console.log(error);
      return;
    }
    if (data) {
      const teamData = data.map((team) => ({
        ...team,
        tasks: [], // Initialize each team with an empty tasks array
      }));
      // setTeams(teamData as Team[]);
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

  const handleDeleteTask = async (teamId: number, taskId: number) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ is_deleted: true })
      .eq("team_id", teamId)
      .eq("id", taskId);

    if (error) throw error;
    filterFetchTasks();
    setTaskDeleteOpen(false);
    setNotificationTrigger((prev: boolean) => !prev);
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

  const handleTaskUndo = async (teamId: number, taskId: number) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ is_deleted: false })
        .eq("team_id", teamId)
        .eq("id", taskId);

      if (error) throw error;

      // fetchTasks(); // Refresh the tasks list
      filterFetchTasks();
      setNotificationTrigger((prev: boolean) => !prev);
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

  const handleUpdateTask = async (teamId: number, taskId: number) => {
    try {
      const mentions = text.match(/@\w+/g) || []; // Extract mentions
      const content = text.replace(/@\w+/g, "").trim(); // Remove mentions and trim content

      // Fetch the current task by ID and Team ID
      const { data: taskData, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .eq("team_id", teamId)
        .single();

      if (fetchError) {
        console.error("Error fetching task:", fetchError);
        throw fetchError;
      }

      if (taskData) {
        // Validate if both content and mentions are empty
        if (!content || mentions.length === 0) {
          setTaskErrorMessage({ status: true, errorId: taskId });
          return;
        }
        // Reset the error message state if validation passes
        setTaskErrorMessage({ status: false, errorId: taskId });

        // Update the task in the database
        const { data: updatedTask, error: updateError } = await supabase
          .from("tasks")
          .update({
            mentions,
            task_content: content,
            task_created: true,
            task_status: "todo",
          })
          .eq("team_id", teamId)
          .eq("id", taskId);

        if (updateError) {
          console.error("Error updating task:", updateError);
          throw updateError;
        }

        resetInputAndFetchUpdates();
        setNotificationTrigger(!notificationTrigger);
      }
    } catch (error) {
      console.error("Error in handleUpdateTask:", error);
    }
  };

  const resetInputAndFetchUpdates = () => {
    setText(""); // Clear the input text
    fetchTasks(); // Refresh task list
    filterFetchTasks();
    // fetchTeams(); // Refresh team data
    filterFetchTeams();
    setMentionTrigger(!mentionTrigger);

    const styledInput = styledInputRef.current;
    if (styledInput) {
      styledInput.innerText = ""; // Clear styled input
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    if (data) {
      const includesTrueTasks = data.filter((task) =>
        task?.mentions?.includes(`@${loggedUserData?.entity_name}`)
      );
      setLoggedTeamId(includesTrueTasks.map((task) => task.team_id));
      // setAllTasks(data);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      // Delete tasks associated with the team first
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ is_deleted: true })
        .eq("team_id", teamId);

      if (taskError) {
        console.error("Error deleting tasks:", taskError);
        return;
      }

      console.log("Tasks deleted successfully.");

      // Now delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .update({ is_deleted: true })
        .eq("id", teamId);

      if (teamError) {
        console.error("Error deleting team:", teamError);
        return;
      }

      console.log("Team deleted successfully.");

      // Additional cleanup actions
      // setTeamNameDialogOpen(false);
      // fetchTeams();
      filterFetchTeams();
      toast({
        title: "Deleted Successfully!",
        description: "Team deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleTeamUndo(teamId)}>
            Undo
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
    }
  };

  const handleTeamUndo = async (teamId: number) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ is_deleted: false })
        .eq("team_id", teamId);

      if (error) {
        console.error("Error undoing delete:", error);
        return;
      }

      // Now delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .update({ is_deleted: false })
        .eq("id", teamId);

      if (teamError) {
        console.error("Error deleting team:", teamError);
        return;
      }

      // Additional cleanup actions
      // setTeamNameDialogOpen(false);
      // fetchTeams();
      filterFetchTeams();
      toast({
        title: "Undo Successful",
        description: "The deleted team has been restored.",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore the deleted team. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleUpdateTeam = async (
    teamId: number,
    spaceId: number,
    defaultTeamName: string
  ) => {
    console.log(teamId, spaceId);
    if (addedMembers.length === 0) {
      setTeamNameError(true);
      return;
    } else if (addedMembers.length > 0) {
      try {
        const { data, error } = await supabase
          .from("teams")
          .update({
            team_name: teamName || defaultTeamName,
            members: addedMembers,
          })
          .eq("id", teamId)
          .eq("space_id", spaceId)
          .single();

        if (error) {
          console.error("Error updating team name:", error);
          return;
        }

        // if (data) {
        console.log("Team name updated successfully:", data);
        // fetchTeams();
        filterFetchTeams();
        setTeamNameSheetOpen(false);
        setTeamNameError(false);
        toast({
          title: "Updated Successfully!",
          description: "Changes updated successfully!",
          duration: 5000,
        });
        // }
      } catch (error) {
        console.error("Error updating team name:", error);
      }
    }
  };

  const getTeamData = async (teamId: number) => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();
      if (error) {
        console.error("Error fetching user data:", error);
        return;
      }

      if (data) {
        console.log("User data:", data);
        setAddedMembers(data.members);
        return data;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const removeMember = (user: any, index: number) => {
    setAddedMembers((prevMembers) =>
      prevMembers.filter(
        (member: any, i: number) => !(member.id === user.id && i === index)
      )
    );
  };

  const handleUserSelect = (user: Tab) => {
    setTeamNameError(false);
    setAddedMembers((prevMembers) => {
      if (prevMembers.some((member) => member.id === user.id)) {
        // Show toast notification if user already exists
        toast({
          title: "Member already exists",
          description: "Member is already added to this team",
        });
        return prevMembers; // Return the existing array unchanged
      }
      // Add the new user if they don't exist
      return [...prevMembers, user];
    });
    console.log("user selected ", user);

    setEmailInput("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (matchingUsers.length === 0) return;

    if (e.key === "ArrowDown") {
      // Move highlight down
      setHighlightedIndex((prevIndex) =>
        prevIndex < matchingUsers.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      // Move highlight up
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : matchingUsers.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      // Select highlighted user on Enter
      handleUserSelect(matchingUsers[highlightedIndex]);
    }
  };

  const getUserData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
    console.log("Input Changed:", setEmailInput);

    try {
      // Fetch all users from the database
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      // Filter users whose email includes the input value
      const matchingUsers =
        data?.filter(
          (user) => user.role === "User" && user.email.includes(emailInput)
        ) || [];

      if (matchingUsers.length > 0 || emailInput === "") {
        setMatchingUsers(matchingUsers);
        setNoUserFound(false);
      } else {
        setNoUserFound(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handleEditTask = async (teamId: number, taskId: number) => {
    const { data: taskData, error: fetchError } = await supabase
      .from("tasks")
      .update({ task_created: false })
      .eq("id", taskId)
      .eq("team_id", teamId)
      .select();
    if (fetchError) {
      console.log(fetchError);
    }
    setUpdateTaskId({ teamId, taskId });
    // fetchTasks();
    filterFetchTasks();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [highlightedIndex, matchingUsers]);

  const recoverTask = async () => {
    if (updateTaskId.taskId === 0) return;
    const { data: taskData, error: fetchError } = await supabase
      .from("tasks")
      .update({ task_created: true })
      .eq("is_deleted", false)
      .eq("id", updateTaskId.taskId)
      .eq("team_id", updateTaskId.teamId)
      .select();
    if (fetchError) {
      console.log(fetchError);
    }
    setUpdateTaskId({ teamId: 0, taskId: 0 });
  };

  // useEffect(() => {
  //   // fetchTeams();
  //   filterFetchTeams();
  //   // fetchTasks();
  //   recoverTask();
  // }, [spaceId, teamData, setTeamData]);

  useEffect(() => {
    filterFetchTeams();
    filterFetchTasks();
  }, []);

  useEffect(() => {
    fetchTeams();
    filterFetchTeams();
  }, [spaceId]);

  const filterBySearchValue = (items: any[], searchValue: string) => {
    // Validate searchValue and convert to lowercase if it's a string
    const lowercasedSearchValue =
      typeof searchValue === "string" ? searchValue.toLowerCase() : "";

    return items.filter((item) => {
      // Extract and validate task_content and mentions
      const taskContent =
        typeof item.task_content === "string"
          ? item.task_content.toLowerCase()
          : "";
      const mentions = Array.isArray(item.mentions)
        ? item.mentions.map((mention: any) =>
            typeof mention === "string" ? mention.toLowerCase() : ""
          )
        : [];

      // Check if searchValue is found in task_content or mentions
      return (
        taskContent.includes(lowercasedSearchValue) ||
        mentions.some((mention: any) => mention.includes(lowercasedSearchValue))
      );
    });
  };

  const filteredTasks = filterBySearchValue(allTasks, searchValue as string);

  const handleAddTask = async (teamId: any, spaceId: number) => {
    try {
      // Insert the new task into the database
      const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };

      const { data: insertedTask, error: insertError } = await supabase
        .from("tasks")
        .insert({
          time: formatDate(new Date()),
          status: taskStatus,
          team_id: teamId,
          space_id: spaceId,
          due_date: formatDate(addDays(new Date(), 1)),
          is_deleted: false,
          notify_read: false,
          created_by: loggedUserData?.username,
        })
        .select()
        .order("created_at", { ascending: true });

      if (insertError) {
        throw insertError;
      }

      if (insertedTask && insertedTask.length > 0) {
        setFilterTeams((prevTeams: any) =>
          prevTeams.map((team: any) =>
            team.id === teamId
              ? {
                  ...team,
                  tasks: [
                    { id: insertedTask[0].id, inputValue: "" }, // Newly created task appears first
                    ...team.tasks,
                  ],
                }
              : team
          )
        );
      }

      filterFetchTasks();
    } catch (error) {
      console.error("Error adding or fetching tasks:", error);
    }
  };

  // Real-time subscription to reflect updates
  useEffect(() => {
    const channel = supabase
      .channel("tasks-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        (payload) => {
          console.log("Task updated!", payload);
          filterFetchTasks(); // Function to refresh the task list in state
          if (payload.new.task_created === true || payload.new.is_deleted === null) {
            if ("Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification("Task created or updated", {
                  body: "Task created or updated successfully!",
                  icon: "/path/to/icon.png", // Optional: Path to a notification icon
                });
              } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then((permission) => {
                  if (permission === "granted") {
                    new Notification("Task created or updated", {
                      body: "Task created or updated successfully!",
                      icon: "/path/to/icon.png", // Optional: Path to a notification icon
                    });
                  }
                });
              }
            }
          }

          // if ("Notification" in window) {
          //   if (Notification.permission === "granted") {
          //     new Notification("Task created or updated", {
          //       body: "Task created or updated successfully!",
          //       icon: "/path/to/icon.png", // Optional: Path to a notification icon
          //     });
          //   } else if (Notification.permission !== "denied") {
          //     Notification.requestPermission().then((permission) => {
          //       if (permission === "granted") {
          //         new Notification("Task created or updated", {
          //           body: "Task created or updated successfully!",
          //           icon: "/path/to/icon.png", // Optional: Path to a notification icon
          //         });
          //       }
          //     });
          //   }
          // }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // useEffect(() => {}, [mentionTrigger, setMentionTrigger]);

  return (
    <div className="w-full h-[calc(100vh-142px)]">
      {filterTeams.length > 0 ? (
        <div className="w-full h-full pb-4 px-0">
          <Carousel1 opts={{ align: "start" }} className="w-full max-w-full">
            {loggedUserData?.role === "owner" ? (
              <CarouselContent1 className="flex space-x-1">
                {filterTeams.map((team: any, index: number) => (
                  <CarouselItem1
                    key={team.id}
                    className="max-w-[370px] h-[calc(100vh-142px)] basis-[32%] overflow-y-auto relative playlist-scroll"
                  >
                    <Card key={index}>
                      <CardContent key={index} className="w-full h-full p-0">
                        <div
                          className={`p-[18px] pb-3 sticky top-0 bg-white z-50 rounded-xl`}
                        >
                          <div className="flex justify-between items-center relative">
                            <p className="text-lg font-semibold text-black font-inter">
                              {team.team_name.length > 20
                                ? team.team_name.slice(0, 20) + "..."
                                : team.team_name}
                            </p>
                            {(loggedUserData?.role === "owner" ||
                              (loggedUserData?.role === "User" &&
                                ((loggedUserData?.access?.team !== true &&
                                  loggedUserData?.access?.all === true) ||
                                  loggedUserData?.access?.team === true))) && (
                              <>
                                {/* Dropdown for Each Team */}
                                <DropdownMenu
                                  open={openDropdowns[team.id] || false}
                                  onOpenChange={(isOpen) =>
                                    toggleDropdown(team.id, isOpen)
                                  }
                                >
                                  <DropdownMenuTrigger>
                                    <Ellipsis
                                      size={18}
                                      className="cursor-pointer"
                                    />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="min-w-6 absolute -top-1 -right-2.5 p-0">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        getTeamData(team.id);
                                        toggleSheet(team.id, true); // Open only the clicked team's Sheet
                                        toggleDropdown(team.id, false); // Close dropdown
                                      }}
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        toggleDialog(team.id, true); // Open delete confirmation for this team
                                        toggleDropdown(team.id, false); // Close dropdown
                                      }}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Sheet for Editing Team */}
                                <Sheet
                                  open={openSheets[team.id] || false}
                                  onOpenChange={(isOpen) =>
                                    toggleSheet(team.id, isOpen)
                                  }
                                >
                                  <SheetContent style={{ maxWidth: "500px" }}>
                                    <SheetHeader>
                                      <SheetTitle>Edit Team</SheetTitle>
                                    </SheetHeader>

                                    {/* Team Name Input */}
                                    <div className="mt-2">
                                      <label
                                        htmlFor="name"
                                        className="text-sm text-[#111928] font-medium"
                                      >
                                        Team Name
                                      </label>
                                      <Input
                                        className="mb-3 mt-1"
                                        type="text"
                                        placeholder="Team Name"
                                        defaultValue={team.team_name}
                                        onChange={(e) =>
                                          setTeamName(e.target.value)
                                        }
                                      />
                                    </div>

                                    {/* Members Input */}
                                    <div>
                                      <label
                                        htmlFor="members"
                                        className="text-sm text-[#111928] font-medium"
                                      >
                                        Members
                                      </label>
                                      <Input
                                        autoComplete="off"
                                        id="members"
                                        placeholder="Add email"
                                        className="text-gray-500 mt-1.5 h-12 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
                                        onChange={getUserData}
                                        value={emailInput}
                                      />
                                    </div>

                                    {/* Matching Users Dropdown */}
                                    {matchingUsers.length > 0 &&
                                      emailInput.length > 0 &&
                                      !noUserFound && (
                                        <div className="absolute top-[121px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
                                          <ul>
                                            {matchingUsers.map(
                                              (user, index) => (
                                                <li
                                                  key={user.id}
                                                  className={`p-2 cursor-pointer ${
                                                    index === highlightedIndex
                                                      ? "bg-gray-200"
                                                      : "hover:bg-gray-100"
                                                  }`}
                                                  onClick={() =>
                                                    handleUserSelect(user)
                                                  }
                                                  onMouseEnter={() =>
                                                    setHighlightedIndex(index)
                                                  }
                                                >
                                                  {user.email}
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                    {noUserFound && (
                                      <div className="absolute top-[121px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
                                        <ul>
                                          <li className="p-2 cursor-pointer hover:bg-gray-100">
                                            No User Found
                                          </li>
                                        </ul>
                                      </div>
                                    )}

                                    {/* Added Members List */}
                                    {addedMembers.length > 0 && (
                                      <div className="mt-2 p-2 flex-wrap items-center gap-2 w-full border border-gray-300 rounded-md min-h-[calc(100vh-290px)] max-h-[calc(100vh-290px)] overflow-y-auto playlist-scroll">
                                        {addedMembers.map((member, index) => (
                                          <div
                                            key={member.id}
                                            className="flex justify-between items-center gap-2 my-2 py-1 px-2 w-full text-sm text-gray-500"
                                          >
                                            <div className="flex items-center gap-1">
                                              <Image
                                                src={member.profile_image}
                                                alt="User Image"
                                                width={36}
                                                height={36}
                                                className="w-[32px] h-[32px] rounded-full"
                                              />
                                              <span>
                                                {member.username || member.name}
                                              </span>
                                            </div>
                                            <span
                                              className={
                                                member.role === "superadmin"
                                                  ? "text-[#0E9F6E]"
                                                  : "text-gray-500"
                                              }
                                            >
                                              {member.designation?.length > 25
                                                ? `${member.designation.slice(
                                                    0,
                                                    26
                                                  )}...`
                                                : member.designation}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeMember(member, index);
                                              }}
                                              className="focus:outline-none space_delete_button text-gray-400"
                                            >
                                              <Trash2
                                                className="text-black"
                                                size={18}
                                              />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Save Changes Button */}
                                    <div className="flex justify-center gap-4 mt-5">
                                      {/* DELETE BUTTON INSIDE SHEET */}
                                      <Button
                                        className="border-none w-1/2 bg-red-600 hover:bg-red-500 hover:text-white text-white"
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteTeam(team.id)
                                        }
                                      >
                                        Delete
                                      </Button>
                                      <Button
                                        className="w-1/2"
                                        onClick={() =>
                                          handleUpdateTeam(
                                            team.id,
                                            spaceId,
                                            team.team_name
                                          )
                                        }
                                      >
                                        Save Changes
                                      </Button>
                                    </div>
                                  </SheetContent>
                                </Sheet>

                                {/* DELETE CONFIRMATION DIALOG */}
                                <Dialog
                                  open={openDialogs[team.id] || false}
                                  onOpenChange={(isOpen) =>
                                    toggleDialog(team.id, isOpen)
                                  }
                                >
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Delete Team</DialogTitle>
                                      <DialogDescription>
                                        Do you want to delete{" "}
                                        <span className="font-bold">
                                          {team.team_name}?
                                        </span>
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-center items-center w-full gap-4">
                                      <Button
                                        variant="outline"
                                        className="w-1/3"
                                        onClick={() =>
                                          toggleDialog(team.id, false)
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        className="bg-red-600 hover:bg-red-500 w-1/3"
                                        onClick={() => {
                                          handleDeleteTeam(team.id);
                                          toggleDialog(team.id, false);
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                          {(loggedUserData?.role === "owner" ||
                            (loggedUserData?.role === "User" &&
                              ((loggedUserData?.access?.task !== true &&
                                loggedUserData?.access?.all === true) ||
                                loggedUserData?.access?.task === true))) &&
                            searchValue == "" && (
                              <Button
                                variant={"outline"}
                                className="mt-3 border-dashed border-gray-500 text-gray-500 text-sm font-medium w-full"
                                onClick={() => {
                                  console.log("Team ID:", team.id);
                                  handleAddTask(team.id, spaceId);
                                }}
                              >
                                <Plus size={18} />
                                Add Task
                              </Button>
                            )}
                        </div>
                        {loggedUserData?.role === "owner" ? (
                          (searchValue === "" ? allTasks : filteredTasks)
                            .length > 0 ? (
                            <div className="w-full px-4 pb-4">
                              {(searchValue === ""
                                ? allTasks
                                : filteredTasks
                              ).map(
                                (task: any) =>
                                  task.team_id === team.id && (
                                    <div
                                      key={task.id}
                                      className="flex flex-col gap-2.5 mt-3"
                                    >
                                      {/* {task.team_id === team.id && ( */}
                                      <div
                                        key={task.id}
                                        className="flex-1 border border-[#ddd] rounded-lg p-3 font-geist hover:border-blue-600 task_box"
                                      >
                                        <div className="flex justify-between items-center">
                                          {/* <p>{task.id}</p> */}
                                          <p className="text-xs font-semibold text-[#A6A6A7]">
                                            {formatDate(new Date())}
                                          </p>
                                          {/* <Trash2
                                      size={18}
                                      className="text-[#EC4949] cursor-pointer"
                                      onClick={() => {
                                        console.log(
                                          "Deleting Task ID:",
                                          task.id,
                                          "for Team ID:",
                                          team.id
                                        );
                                        handleDeleteTask(team.id, task.id);
                                      }}
                                    /> */}
                                          {(loggedUserData?.role === "owner" ||
                                            (loggedUserData?.role === "User" &&
                                              ((loggedUserData?.access?.task !==
                                                true &&
                                                loggedUserData?.access?.all ===
                                                  true) ||
                                                loggedUserData?.access?.task ===
                                                  true))) && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Ellipsis
                                                  size={18}
                                                  className="cursor-pointer"
                                                />
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent className="min-w-6 absolute -top-1 -right-2.5 p-0">
                                                <DropdownMenuItem
                                                  className="px-3 pt-2 pb-0"
                                                  onClick={() => {
                                                    handleEditTask(
                                                      team.id,
                                                      task.id
                                                    );
                                                  }}
                                                >
                                                  Edit
                                                </DropdownMenuItem>
                                                <p>
                                                  <Dialog
                                                    open={taskDeleteOpen}
                                                    onOpenChange={
                                                      setTaskDeleteOpen
                                                    }
                                                  >
                                                    <DialogTrigger
                                                      className="p-0 px-3"
                                                      asChild
                                                    >
                                                      <Button
                                                        className="border-none w-full"
                                                        variant="outline"
                                                      >
                                                        Delete
                                                      </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-[425px]">
                                                      <DialogHeader>
                                                        <DialogTitle>
                                                          Delete Task
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                          Do you want to delete
                                                          this task ?
                                                        </DialogDescription>
                                                      </DialogHeader>

                                                      <div className="flex justify-center items-center w-full gap-4">
                                                        <Button
                                                          variant="outline"
                                                          className="w-1/3"
                                                          type="submit"
                                                          onClick={() =>
                                                            setTaskDeleteOpen(
                                                              false
                                                            )
                                                          }
                                                        >
                                                          Cancel
                                                        </Button>
                                                        <Button
                                                          className="bg-red-600 hover:bg-red-500 w-1/3"
                                                          type="button"
                                                          onClick={() =>
                                                            handleDeleteTask(
                                                              team.id,
                                                              task.id
                                                            )
                                                          }
                                                        >
                                                          Delete
                                                        </Button>
                                                      </div>
                                                    </DialogContent>
                                                  </Dialog>
                                                </p>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                        </div>
                                        <WebMentionInput
                                          text={text}
                                          setText={setText}
                                          taskErrorMessage={taskErrorMessage}
                                          setTaskErrorMessage={
                                            setTaskErrorMessage
                                          }
                                          allTasks={allTasks}
                                          teamId={team.id}
                                          taskId={task.id}
                                          taskStatus={task.task_created}
                                          mentionTrigger={mentionTrigger}
                                          setMentionTrigger={setMentionTrigger}
                                        />
                                        <div
                                          className={`flex justify-between items-center`}
                                        >
                                          {/* {loggedUserData?.role === "owner" && ( */}
                                          <div
                                            className={`task.${task.id} === true cursor-not-allowed`}
                                          >
                                            <TaskDateUpdater
                                              team={team}
                                              task={task}
                                              fetchTasks={fetchTasks}
                                              taskStatus={task.task_created}
                                            />
                                          </div>
                                          {/* )} */}

                                          {task.task_created !== true ? (
                                            <Button
                                              variant={"outline"}
                                              className="bg-primaryColor-700 text-white rounded-full py-2 h-7 px-3 text-sm font-inter font-medium hover:bg-blue-600 hover:text-white"
                                              onClick={() => {
                                                handleUpdateTask(
                                                  team.id,
                                                  task.id
                                                ),
                                                  setText("");
                                              }}
                                            >
                                              Create
                                            </Button>
                                          ) : loggedUserData?.role === "User" &&
                                            task.task_status === "Completed" ? (
                                            <Button className="w-[140px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none text-[#3FAD51] bg-[#E5F8DA] hover:bg-[#E5F8DA] hover:text-[#3FAD51]">
                                              Completed
                                            </Button>
                                          ) : (
                                            <Select
                                              defaultValue={task.task_status}
                                              onValueChange={async (value) => {
                                                const { data, error } =
                                                  await supabase
                                                    .from("tasks")
                                                    .update({
                                                      task_status: value,
                                                    })
                                                    .eq("id", task.id)
                                                    .eq("team_id", team.id)
                                                    .single();
                                                if (error) {
                                                  console.error(
                                                    "Error updating task status:",
                                                    error
                                                  );
                                                }
                                                setTaskStatus(value);
                                                filterFetchTasks();
                                                setNotificationTrigger(
                                                  !notificationTrigger
                                                );
                                              }}
                                            >
                                              <SelectTrigger
                                                className={`w-[140px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none ${
                                                  task.task_status === "todo"
                                                    ? "text-reddish bg-[#F8DADA]"
                                                    : task.task_status ===
                                                      "In progress"
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
                                                <SelectItem value="todo">
                                                  To Do
                                                </SelectItem>
                                                <SelectItem value="In progress">
                                                  In Progress
                                                </SelectItem>
                                                <SelectItem value="Internal feedback">
                                                  Internal feedback
                                                </SelectItem>
                                                {loggedUserData?.role ===
                                                  "owner" && (
                                                  <SelectItem value="Completed">
                                                    Completed
                                                  </SelectItem>
                                                )}
                                              </SelectContent>
                                            </Select>
                                          )}
                                        </div>
                                      </div>
                                      {/* )} */}
                                    </div>
                                  )
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full flex justify-center items-center font-inter font-medium text-md text-[#9A9A9A] pt-3 pb-5">
                              No tasks found
                            </div>
                          )
                        ) : (searchValue === ""
                            ? allTasks
                            : filteredTasks
                          ).filter(
                            (task: any) =>
                              (task.team_id === team.id &&
                                task?.mentions?.includes(
                                  `@${loggedUserData?.entity_name}`
                                )) ||
                              task.mentions === null
                          ).length > 0 ? (
                          <div className="w-full px-4 pb-4">
                            {filteredTasks
                              .filter(
                                (task: any) =>
                                  task.team_id === team.id &&
                                  (task?.mentions?.includes(
                                    `@${loggedUserData?.entity_name}`
                                  ) ||
                                    task?.mentions === null)
                              )
                              .map((task: any) => (
                                <div
                                  key={task.id}
                                  className="flex flex-col gap-2.5 mt-3"
                                >
                                  <div className="flex-1 border border-[#ddd] rounded-lg p-3 font-geist hover:border-blue-600 task_box">
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs font-semibold text-[#A6A6A7]">
                                        {formatDate(new Date())}
                                      </p>
                                      {(loggedUserData?.role === "owner" ||
                                        (loggedUserData?.role === "User" &&
                                          ((loggedUserData?.access?.task !==
                                            true &&
                                            loggedUserData?.access?.all ===
                                              true) ||
                                            loggedUserData?.access?.task ===
                                              true))) && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Ellipsis
                                              size={18}
                                              className="cursor-pointer"
                                            />
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent className="min-w-6 absolute -top-1 -right-2.5 p-0">
                                            <DropdownMenuItem
                                              className="px-3 pt-2 pb-0"
                                              onClick={() =>
                                                handleEditTask(team.id, task.id)
                                              }
                                            >
                                              Edit
                                            </DropdownMenuItem>
                                            <p>
                                              <Dialog
                                                open={taskDeleteOpen}
                                                onOpenChange={setTaskDeleteOpen}
                                              >
                                                <DialogTrigger
                                                  className="p-0 px-3"
                                                  asChild
                                                >
                                                  <Button
                                                    className="border-none w-full"
                                                    variant="outline"
                                                  >
                                                    Delete
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                  <DialogHeader>
                                                    <DialogTitle>
                                                      Delete Task
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                      Do you want to delete this
                                                      task?
                                                    </DialogDescription>
                                                  </DialogHeader>
                                                  <div className="flex justify-center items-center w-full gap-4">
                                                    <Button
                                                      variant="outline"
                                                      className="w-1/3"
                                                      type="submit"
                                                      onClick={() =>
                                                        setTaskDeleteOpen(false)
                                                      }
                                                    >
                                                      Cancel
                                                    </Button>
                                                    <Button
                                                      className="bg-red-600 hover:bg-red-500 w-1/3"
                                                      type="button"
                                                      onClick={() =>
                                                        handleDeleteTask(
                                                          team.id,
                                                          task.id
                                                        )
                                                      }
                                                    >
                                                      Delete
                                                    </Button>
                                                  </div>
                                                </DialogContent>
                                              </Dialog>
                                            </p>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                    <WebMentionInput
                                      text={text}
                                      setText={setText}
                                      taskErrorMessage={taskErrorMessage}
                                      setTaskErrorMessage={setTaskErrorMessage}
                                      allTasks={allTasks}
                                      teamId={team.id}
                                      taskId={task.id}
                                      taskStatus={task.task_created}
                                      mentionTrigger={mentionTrigger}
                                      setMentionTrigger={setMentionTrigger}
                                    />
                                    <div className="flex justify-between items-center">
                                      <div className="task.${task.id} === true cursor-not-allowed">
                                        <TaskDateUpdater
                                          team={team}
                                          task={task}
                                          fetchTasks={fetchTasks}
                                          taskStatus={task.task_created}
                                        />
                                      </div>

                                      {task.task_created !== true ? (
                                        <Button
                                          variant="outline"
                                          className="bg-primaryColor-700 text-white rounded-full py-2 h-7 px-3 text-sm font-inter font-medium hover:bg-blue-600 hover:text-white"
                                          onClick={() => {
                                            handleUpdateTask(team.id, task.id);
                                            setText("");
                                          }}
                                        >
                                          Create
                                        </Button>
                                      ) : loggedUserData?.role === "User" &&
                                        task.task_status === "Completed" ? (
                                        <Button className="w-[140px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none text-[#3FAD51] bg-[#E5F8DA] hover:bg-[#E5F8DA] hover:text-[#3FAD51]">
                                          Completed
                                        </Button>
                                      ) : (
                                        <Select
                                          defaultValue={task.task_status}
                                          onValueChange={async (value) => {
                                            const { data, error } =
                                              await supabase
                                                .from("tasks")
                                                .update({ task_status: value })
                                                .eq("id", task.id)
                                                .eq("team_id", team.id)
                                                .single();
                                            if (error) {
                                              console.error(
                                                "Error updating task status:",
                                                error
                                              );
                                            }
                                            setTaskStatus(value);
                                            // fetchTasks();
                                            filterFetchTasks();
                                            setNotificationTrigger(
                                              !notificationTrigger
                                            );
                                          }}
                                        >
                                          <SelectTrigger
                                            className={`w-[140px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none ${
                                              task.task_status === "todo"
                                                ? "text-reddish bg-[#F8DADA]"
                                                : task.task_status ===
                                                  "In progress"
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
                                            <SelectItem value="todo">
                                              To Do
                                            </SelectItem>
                                            <SelectItem value="In progress">
                                              In Progress
                                            </SelectItem>
                                            <SelectItem value="Internal feedback">
                                              Internal feedback
                                            </SelectItem>
                                            {loggedUserData?.role ===
                                              "owner" && (
                                              <SelectItem value="Completed">
                                                Completed
                                              </SelectItem>
                                            )}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="w-full h-full flex justify-center items-center font-inter font-medium text-md text-[#9A9A9A] pt-3 pb-5">
                            No tasks found
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CarouselItem1>
                ))}
              </CarouselContent1>
            ) : (
              <CarouselContent1 className="flex space-x-1">
                {filterTeams
                  .filter((team: any, index: any) =>
                    team.members.some(
                      (member: any) => member.id === loggedUserData?.id
                    )
                  )
                  .map((team: any, index: any) => (
                    <CarouselItem1
                      key={team.id}
                      className="max-w-[370px] basis-[32%] h-[calc(100vh-142px)] overflow-y-auto relative playlist-scroll"
                    >
                      <Card key={index}>
                        <CardContent key={index} className="w-full h-full p-0">
                          <div
                            className={`p-[18px] pb-3 sticky top-0 bg-white z-50 rounded-xl`}
                          >
                            <div className="flex justify-between items-center relative">
                              <p className="text-lg font-semibold text-black font-geist">
                                {team.team_name.length > 20
                                  ? team.team_name.slice(0, 20) + "..."
                                  : team.team_name}
                              </p>
                              {(loggedUserData?.role === "owner" ||
                                (loggedUserData?.role === "User" &&
                                  ((loggedUserData?.access?.team !== true &&
                                    loggedUserData?.access?.all === true) ||
                                    loggedUserData?.access?.team ===
                                      true))) && (
                                <>
                                  <DropdownMenu
                                    open={openDropdowns[team.id] || false}
                                    onOpenChange={(isOpen) =>
                                      toggleDropdown(team.id, isOpen)
                                    }
                                  >
                                    <DropdownMenuTrigger>
                                      <Ellipsis
                                        size={18}
                                        className="cursor-pointer"
                                      />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="min-w-6 absolute -top-1 -right-2.5 p-0">
                                      {/* EDIT BUTTON */}
                                      <DropdownMenuItem
                                        onClick={() => {
                                          getTeamData(team.id);
                                          toggleSheet(team.id, true); // Open only the clicked team's Sheet
                                          toggleDropdown(team.id, false); // Close dropdown
                                        }}
                                      >
                                        Edit
                                      </DropdownMenuItem>

                                      {/* DELETE BUTTON */}
                                      <DropdownMenuItem
                                        onClick={() => {
                                          toggleDialog(team.id, true); // Open delete confirmation for this team
                                          toggleDropdown(team.id, false); // Close dropdown
                                        }}
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>

                                    {/* SHEET FOR EDIT */}
                                    <Sheet
                                      open={openSheets[team.id] || false}
                                      onOpenChange={(isOpen) =>
                                        toggleSheet(team.id, isOpen)
                                      }
                                    >
                                      <SheetContent
                                        style={{ maxWidth: "500px" }}
                                      >
                                        <SheetHeader>
                                          <SheetTitle>Edit Team</SheetTitle>
                                        </SheetHeader>

                                        {/* Team Name Input */}
                                        <div className="mt-2">
                                          <label
                                            htmlFor="name"
                                            className="text-sm text-[#111928] font-medium"
                                          >
                                            Team Name
                                          </label>
                                          <Input
                                            className="mb-3 mt-1"
                                            type="text"
                                            placeholder="Team Name"
                                            defaultValue={team.team_name}
                                            onChange={(e) =>
                                              setTeamName(e.target.value)
                                            }
                                          />
                                        </div>

                                        {/* Members Input */}
                                        <div>
                                          <label
                                            htmlFor="members"
                                            className="text-sm text-[#111928] font-medium"
                                          >
                                            Members
                                          </label>
                                          <Input
                                            autoComplete="off"
                                            id="members"
                                            placeholder="Add email"
                                            className="text-gray-500 mt-1.5 h-12 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
                                            onChange={getUserData}
                                            value={emailInput}
                                          />
                                        </div>

                                        {/* Matching Users Dropdown */}
                                        {matchingUsers.length > 0 &&
                                          emailInput.length > 0 &&
                                          !noUserFound && (
                                            <div className="absolute top-[121px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
                                              <ul>
                                                {matchingUsers.map(
                                                  (user, index) => (
                                                    <li
                                                      key={user.id}
                                                      className={`p-2 cursor-pointer ${
                                                        index ===
                                                        highlightedIndex
                                                          ? "bg-gray-200"
                                                          : "hover:bg-gray-100"
                                                      }`}
                                                      onClick={() =>
                                                        handleUserSelect(user)
                                                      }
                                                      onMouseEnter={() =>
                                                        setHighlightedIndex(
                                                          index
                                                        )
                                                      }
                                                    >
                                                      {user.email}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            </div>
                                          )}
                                        {noUserFound && (
                                          <div className="absolute top-[121px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
                                            <ul>
                                              <li className="p-2 cursor-pointer hover:bg-gray-100">
                                                No User Found
                                              </li>
                                            </ul>
                                          </div>
                                        )}

                                        {/* Added Members List */}
                                        {addedMembers.length > 0 && (
                                          <div className="mt-2 p-2 flex-wrap items-center gap-2 w-full border border-gray-300 rounded-md min-h-[calc(100vh-290px)] max-h-[calc(100vh-290px)] overflow-y-auto playlist-scroll">
                                            {addedMembers.map(
                                              (member, index) => (
                                                <div
                                                  key={member.id}
                                                  className="flex justify-between items-center gap-2 my-2 py-1 px-2 w-full text-sm text-gray-500"
                                                >
                                                  <div className="flex items-center gap-1">
                                                    <Image
                                                      src={member.profile_image}
                                                      alt="User Image"
                                                      width={36}
                                                      height={36}
                                                      className="w-[32px] h-[32px] rounded-full"
                                                    />
                                                    <span>
                                                      {member.username ||
                                                        member.name}
                                                    </span>
                                                  </div>
                                                  <span
                                                    className={
                                                      member.role ===
                                                      "superadmin"
                                                        ? "text-[#0E9F6E]"
                                                        : "text-gray-500"
                                                    }
                                                  >
                                                    {member.designation
                                                      ?.length > 25
                                                      ? `${member.designation.slice(
                                                          0,
                                                          26
                                                        )}...`
                                                      : member.designation}
                                                  </span>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      removeMember(
                                                        member,
                                                        index
                                                      );
                                                    }}
                                                    className="focus:outline-none space_delete_button text-gray-400"
                                                  >
                                                    <Trash2
                                                      className="text-black"
                                                      size={18}
                                                    />
                                                  </button>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}

                                        {/* Save Changes Button */}
                                        <div className="flex justify-center gap-4 mt-5">
                                          {/* DELETE BUTTON INSIDE SHEET */}
                                          <Button
                                            className="border-none w-1/2 bg-red-600 hover:bg-red-500 hover:text-white text-white"
                                            variant="outline"
                                            onClick={() =>
                                              handleDeleteTeam(team.id)
                                            }
                                          >
                                            Delete
                                          </Button>
                                          <Button
                                            className="w-1/2"
                                            onClick={() =>
                                              handleUpdateTeam(
                                                team.id,
                                                spaceId,
                                                team.team_name
                                              )
                                            }
                                          >
                                            Save Changes
                                          </Button>
                                        </div>
                                      </SheetContent>
                                    </Sheet>

                                    {/* DELETE CONFIRMATION DIALOG */}
                                    <Dialog
                                      open={openDialogs[team.id] || false}
                                      onOpenChange={(isOpen) =>
                                        toggleDialog(team.id, isOpen)
                                      }
                                    >
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Delete Team</DialogTitle>
                                          <DialogDescription>
                                            Do you want to delete{" "}
                                            <span className="font-bold">
                                              {team.team_name}?
                                            </span>
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-center items-center w-full gap-4">
                                          <Button
                                            variant="outline"
                                            className="w-1/3"
                                            onClick={() =>
                                              toggleDialog(team.id, false)
                                            }
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            className="bg-red-600 hover:bg-red-500 w-1/3"
                                            onClick={() => {
                                              handleDeleteTeam(team.id);
                                              toggleDialog(team.id, false);
                                            }}
                                          >
                                            Delete
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </DropdownMenu>
                                </>
                              )}
                            </div>
                            {(loggedUserData?.role === "owner" ||
                              (loggedUserData?.role === "User" &&
                                ((loggedUserData?.access?.task !== true &&
                                  loggedUserData?.access?.all === true) ||
                                  loggedUserData?.access?.task === true))) &&
                              searchValue == "" && (
                                <Button
                                  variant={"outline"}
                                  className="mt-3 border-dashed border-gray-500 text-gray-500 text-sm font-medium w-full"
                                  onClick={() => {
                                    console.log("Team ID:", team.id);
                                    handleAddTask(team.id, spaceId);
                                  }}
                                >
                                  <Plus size={18} />
                                  Add Task
                                </Button>
                              )}
                          </div>
                          {loggedUserData?.role === "owner" ? (
                            (searchValue === "" ? allTasks : filteredTasks)
                              .length > 0 ? (
                              <div className="w-full px-4 pb-4">
                                {(searchValue === ""
                                  ? allTasks
                                  : filteredTasks
                                ).map(
                                  (task: any) =>
                                    task.team_id === team.id && (
                                      <div
                                        key={task.id}
                                        className="flex flex-col gap-2.5 mt-3"
                                      >
                                        {/* {task.team_id === team.id && ( */}
                                        <div
                                          key={task.id}
                                          className="flex-1 border border-[#ddd] rounded-lg p-3 font-geist hover:border-blue-600 task_box"
                                        >
                                          <div className="flex justify-between items-center">
                                            {/* <p>{task.id}</p> */}
                                            <p className="text-xs font-semibold text-[#A6A6A7]">
                                              {formatDate(new Date())}
                                            </p>
                                            {/* <Trash2
                                      size={18}
                                      className="text-[#EC4949] cursor-pointer"
                                      onClick={() => {
                                        console.log(
                                          "Deleting Task ID:",
                                          task.id,
                                          "for Team ID:",
                                          team.id
                                        );
                                        handleDeleteTask(team.id, task.id);
                                      }}
                                    /> */}
                                            {(loggedUserData?.role ===
                                              "owner" ||
                                              (loggedUserData?.role ===
                                                "User" &&
                                                ((loggedUserData?.access
                                                  ?.task !== true &&
                                                  loggedUserData?.access
                                                    ?.all === true) ||
                                                  loggedUserData?.access
                                                    ?.task === true))) && (
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <Ellipsis
                                                    size={18}
                                                    className="cursor-pointer"
                                                  />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="min-w-6 absolute -top-1 -right-2.5 p-0">
                                                  <DropdownMenuItem
                                                    className="px-3 pt-2 pb-0"
                                                    onClick={() => {
                                                      handleEditTask(
                                                        team.id,
                                                        task.id
                                                      );
                                                    }}
                                                  >
                                                    Edit
                                                  </DropdownMenuItem>
                                                  <p>
                                                    <Dialog
                                                      open={taskDeleteOpen}
                                                      onOpenChange={
                                                        setTaskDeleteOpen
                                                      }
                                                    >
                                                      <DialogTrigger
                                                        className="p-0 px-3"
                                                        asChild
                                                      >
                                                        <Button
                                                          className="border-none w-full"
                                                          variant="outline"
                                                        >
                                                          Delete
                                                        </Button>
                                                      </DialogTrigger>
                                                      <DialogContent className="sm:max-w-[425px]">
                                                        <DialogHeader>
                                                          <DialogTitle>
                                                            Delete Task
                                                          </DialogTitle>
                                                          <DialogDescription>
                                                            Do you want to
                                                            delete this task ?
                                                          </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="flex justify-center items-center w-full gap-4">
                                                          <Button
                                                            variant="outline"
                                                            className="w-1/3"
                                                            type="submit"
                                                            onClick={() =>
                                                              setTaskDeleteOpen(
                                                                false
                                                              )
                                                            }
                                                          >
                                                            Cancel
                                                          </Button>
                                                          <Button
                                                            className="bg-red-600 hover:bg-red-500 w-1/3"
                                                            type="button"
                                                            onClick={() =>
                                                              handleDeleteTask(
                                                                team.id,
                                                                task.id
                                                              )
                                                            }
                                                          >
                                                            Delete
                                                          </Button>
                                                        </div>
                                                      </DialogContent>
                                                    </Dialog>
                                                  </p>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            )}
                                          </div>
                                          <WebMentionInput
                                            text={text}
                                            setText={setText}
                                            taskErrorMessage={taskErrorMessage}
                                            setTaskErrorMessage={
                                              setTaskErrorMessage
                                            }
                                            allTasks={allTasks}
                                            teamId={team.id}
                                            taskId={task.id}
                                            taskStatus={task.task_created}
                                            mentionTrigger={mentionTrigger}
                                            setMentionTrigger={
                                              setMentionTrigger
                                            }
                                          />
                                          <div
                                            className={`flex justify-between items-center`}
                                          >
                                            {/* {loggedUserData?.role === "owner" && ( */}
                                            <div
                                              className={`task.${task.id} === true cursor-not-allowed`}
                                            >
                                              <TaskDateUpdater
                                                team={team}
                                                task={task}
                                                fetchTasks={fetchTasks}
                                                taskStatus={task.task_created}
                                              />
                                            </div>
                                            {/* )} */}

                                            {task.task_created !== true ? (
                                              <Button
                                                variant={"outline"}
                                                className="bg-primaryColor-700 text-white rounded-full py-2 h-7 px-3 text-sm font-inter font-medium hover:bg-blue-600 hover:text-white"
                                                onClick={() => {
                                                  handleUpdateTask(
                                                    team.id,
                                                    task.id
                                                  ),
                                                    setText("");
                                                }}
                                              >
                                                Create
                                              </Button>
                                            ) : loggedUserData?.role ===
                                                "User" &&
                                              task.task_status ===
                                                "Completed" ? (
                                              <Button className="w-[140px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none text-[#3FAD51] bg-[#E5F8DA] hover:bg-[#E5F8DA] hover:text-[#3FAD51]">
                                                Completed
                                              </Button>
                                            ) : (
                                              <Select
                                                defaultValue={task.task_status}
                                                onValueChange={async (
                                                  value
                                                ) => {
                                                  const { data, error } =
                                                    await supabase
                                                      .from("tasks")
                                                      .update({
                                                        task_status: value,
                                                      })
                                                      .eq("id", task.id)
                                                      .eq("team_id", team.id)
                                                      .single();
                                                  if (error) {
                                                    console.error(
                                                      "Error updating task status:",
                                                      error
                                                    );
                                                  }
                                                  setTaskStatus(value);

                                                  filterFetchTasks();
                                                  setNotificationTrigger(
                                                    !notificationTrigger
                                                  );
                                                }}
                                              >
                                                <SelectTrigger
                                                  className={`w-[140px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none ${
                                                    task.task_status === "todo"
                                                      ? "text-reddish bg-[#F8DADA]"
                                                      : task.task_status ===
                                                        "In progress"
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
                                                  <SelectItem value="todo">
                                                    To Do
                                                  </SelectItem>
                                                  <SelectItem value="In progress">
                                                    In Progress
                                                  </SelectItem>
                                                  <SelectItem value="Internal feedback">
                                                    Internal feedback
                                                  </SelectItem>
                                                  {loggedUserData?.role ===
                                                    "owner" && (
                                                    <SelectItem value="Completed">
                                                      Completed
                                                    </SelectItem>
                                                  )}
                                                </SelectContent>
                                              </Select>
                                            )}
                                          </div>
                                        </div>
                                        {/* )} */}
                                      </div>
                                    )
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-full flex justify-center items-center font-inter font-medium text-md text-[#9A9A9A] pt-3 pb-5">
                                No tasks found
                              </div>
                            )
                          ) : (searchValue === ""
                              ? allTasks
                              : filteredTasks
                            ).filter(
                              (task: any) =>
                                (task.team_id === team.id &&
                                  task?.mentions?.includes(
                                    `@${loggedUserData?.entity_name}`
                                  )) ||
                                task.mentions === null
                            ).length > 0 ? (
                            <div className="w-full px-4 pb-4">
                              {(searchValue === "" ? allTasks : filteredTasks)
                                .filter(
                                  (task: any) =>
                                    task.team_id === team.id &&
                                    (task?.mentions?.includes(
                                      `@${loggedUserData?.entity_name}`
                                    ) ||
                                      task?.mentions === null)
                                )
                                .map((task: any) => (
                                  <div
                                    key={task.id}
                                    className="flex flex-col gap-2.5 mt-3"
                                  >
                                    <div className="flex-1 border border-[#ddd] rounded-lg p-3 font-geist hover:border-blue-600 task_box">
                                      <div className="flex justify-between items-center">
                                        <p className="text-xs font-semibold text-[#A6A6A7]">
                                          {formatDate(new Date())}
                                        </p>
                                        {(loggedUserData?.role === "owner" ||
                                          (loggedUserData?.role === "User" &&
                                            ((loggedUserData?.access?.task !==
                                              true &&
                                              loggedUserData?.access?.all ===
                                                true) ||
                                              loggedUserData?.access?.task ===
                                                true))) && (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Ellipsis
                                                size={18}
                                                className="cursor-pointer"
                                              />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="min-w-6 absolute -top-1 -right-2.5 p-0">
                                              <DropdownMenuItem
                                                className="px-3 pt-2 pb-0"
                                                onClick={() =>
                                                  handleEditTask(
                                                    team.id,
                                                    task.id
                                                  )
                                                }
                                              >
                                                Edit
                                              </DropdownMenuItem>
                                              <p>
                                                <Dialog
                                                  open={taskDeleteOpen}
                                                  onOpenChange={
                                                    setTaskDeleteOpen
                                                  }
                                                >
                                                  <DialogTrigger
                                                    className="p-0 px-3"
                                                    asChild
                                                  >
                                                    <Button
                                                      className="border-none w-full"
                                                      variant="outline"
                                                    >
                                                      Delete
                                                    </Button>
                                                  </DialogTrigger>
                                                  <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                      <DialogTitle>
                                                        Delete Task
                                                      </DialogTitle>
                                                      <DialogDescription>
                                                        Do you want to delete
                                                        this task?
                                                      </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex justify-center items-center w-full gap-4">
                                                      <Button
                                                        variant="outline"
                                                        className="w-1/3"
                                                        type="submit"
                                                        onClick={() =>
                                                          setTaskDeleteOpen(
                                                            false
                                                          )
                                                        }
                                                      >
                                                        Cancel
                                                      </Button>
                                                      <Button
                                                        className="bg-red-600 hover:bg-red-500 w-1/3"
                                                        type="button"
                                                        onClick={() =>
                                                          handleDeleteTask(
                                                            team.id,
                                                            task.id
                                                          )
                                                        }
                                                      >
                                                        Delete
                                                      </Button>
                                                    </div>
                                                  </DialogContent>
                                                </Dialog>
                                              </p>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        )}
                                      </div>
                                      <WebMentionInput
                                        text={text}
                                        setText={setText}
                                        taskErrorMessage={taskErrorMessage}
                                        setTaskErrorMessage={
                                          setTaskErrorMessage
                                        }
                                        allTasks={allTasks}
                                        teamId={team.id}
                                        taskId={task.id}
                                        taskStatus={task.task_created}
                                        mentionTrigger={mentionTrigger}
                                        setMentionTrigger={setMentionTrigger}
                                      />
                                      <div className="flex justify-between items-center">
                                        <div className="task.${task.id} === true cursor-not-allowed">
                                          <TaskDateUpdater
                                            team={team}
                                            task={task}
                                            fetchTasks={fetchTasks}
                                            taskStatus={task.task_created}
                                          />
                                        </div>

                                        {task.task_created !== true ? (
                                          <Button
                                            variant="outline"
                                            className="bg-primaryColor-700 text-white rounded-full py-2 h-7 px-3 text-sm font-inter font-medium hover:bg-blue-600 hover:text-white"
                                            onClick={() => {
                                              handleUpdateTask(
                                                team.id,
                                                task.id
                                              );
                                              setText("");
                                            }}
                                          >
                                            Create
                                          </Button>
                                        ) : loggedUserData?.role === "User" &&
                                          task.task_status === "Completed" ? (
                                          <Button className="w-[140px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none text-[#3FAD51] bg-[#E5F8DA] hover:bg-[#E5F8DA] hover:text-[#3FAD51]">
                                            Completed
                                          </Button>
                                        ) : (
                                          <Select
                                            defaultValue={task.task_status}
                                            onValueChange={async (value) => {
                                              const { data, error } =
                                                await supabase
                                                  .from("tasks")
                                                  .update({
                                                    task_status: value,
                                                  })
                                                  .eq("id", task.id)
                                                  .eq("team_id", team.id)
                                                  .single();
                                              if (error) {
                                                console.error(
                                                  "Error updating task status:",
                                                  error
                                                );
                                              }
                                              setTaskStatus(value);
                                              // fetchTasks();
                                              filterFetchTasks();
                                              setNotificationTrigger(
                                                !notificationTrigger
                                              );
                                            }}
                                          >
                                            <SelectTrigger
                                              className={`w-[140px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none ${
                                                task.task_status === "todo"
                                                  ? "text-reddish bg-[#F8DADA]"
                                                  : task.task_status ===
                                                    "In progress"
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
                                              <SelectItem value="todo">
                                                To Do
                                              </SelectItem>
                                              <SelectItem value="In progress">
                                                In Progress
                                              </SelectItem>
                                              <SelectItem value="Internal feedback">
                                                Internal feedback
                                              </SelectItem>
                                              {loggedUserData?.role ===
                                                "owner" && (
                                                <SelectItem value="Completed">
                                                  Completed
                                                </SelectItem>
                                              )}
                                            </SelectContent>
                                          </Select>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="w-full h-full flex justify-center items-center font-inter font-medium text-md text-[#9A9A9A] pt-3 pb-5">
                              No tasks found
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </CarouselItem1>
                  ))}
              </CarouselContent1>
            )}
          </Carousel1>
        </div>
      ) : (
        <div className="w-full min-h-[78vh] flex justify-center items-center text-[#9A9A9A]">
          <p className="text-lg font-semibold">No teams found</p>
        </div>
      )}
    </div>
  );
};

export default SpaceTeam;
