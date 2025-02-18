"use client";
import { supabase } from "@/utils/supabase/supabaseClient";
import {
  EllipsisVertical,
  Trash2,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpaceTeam from "./teams";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import WebNavbar from "./navbar";
import { HiMiniDocumentPlus } from "react-icons/hi2";
import { useGlobalContext } from "@/context/store";
import DefaultSkeleton from "./skeleton-ui";

interface Tab {
  id: number;
  space_name: string;
  email: string;
  username: string;
  designation: string;
  role: string;
  department: string;
  profile_image: string;
}

interface loggedUserDataProps {
  loggedUserData: any;
}

interface Team {
  id: number;
  team_name: string;
  tasks: { id: number; inputValue: string }[];
  members: any[];
}

// const notify = (message: string, success: boolean) =>
//   toast[success ? "success" : "error"](message, {
//     style: {
//       borderRadius: "10px",
//       background: "#fff",
//       color: "#000",
//     },
//     position: "top-right",
//     duration: 3000,
//   });

const SpaceBar: React.FC<loggedUserDataProps> = ({ loggedUserData }) => {
  const { userId } = useGlobalContext();
  const route = useRouter();
  const [teams,setTeams] = useState<Team[]>([]);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [userTab, setUserTab] = useState<Tab[]>([]);
  const [userActiveTab, setUserActiveTab] = useState<number | null>(null);
  const [userTabActive, setUserTabActive] = useState(true);
  const [emailInput, setEmailInput] = useState<string>("");
  const [matchingUsers, setMatchingUsers] = useState<Tab[]>([]);
  const [noUserFound, setNoUserFound] = useState<boolean>(false);
  const [addedMembers, setAddedMembers] = useState<Tab[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [teamName, setTeamName] = useState<string>("");
  const [memberAddDialogOpen, setMemberAddDialogOpen] = useState(false);
  const [teamNameError, setTeamNameError] = useState(false);
  const [teamMemberError, setTeamMemberError] = useState(false);
  const [spaceId, setSpaceId] = useState<number | null>(null);
  const [teamData, setTeamData] = useState(() => ({}));
  const [updatedSpaceName, setUpdatedSpaceName] = useState<string>("");
  const [spaceEditDialogOpen, setSpaceEditDialogOpen] = useState(false);
  const [spaceDetails, setSpaceDetails] = useState<any[]>([]);
  const [spaceName, setSpaceName] = useState<string>("");
  const [deletedSpace, setDeletedSpace] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string >("");
  const [teamFilterValue, setTeamFilterValue] = useState<string | null>("");
  const [taskStatusFilterValue, setTaskStatusFilterValue] = useState<
    string | null
  >("");
  const [dateFilterValue, setDateFilterValue] = useState<string | null>("");
  // const [filterFn, setFilterFn] = useState(() => {});
  const [allTasks, setAllTasks] = useState<any>([]);
  const [FilterTeams, setFilterTeams] = useState<Team[]>([]);
  const [loggedSpaceId, setLoggedSpaceId] = useState<any[]>([]);
  const [spaceLength, setSpaceLength] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [activeTabName, setActiveTabName] = useState();
  const [activeTabNameUser, setActiveTabNameUser] = useState('');

  const {setSelectedActiveTab} = useGlobalContext();
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [adminSpaceLength, setAdminSpaceLength] = useState<number>(0);
  const [notificationTrigger, setNotificationTrigger] = useState(false);
  const [newTabTeamTrigger, setNewTabTeamTrigger] = useState(false);
  const [allSpace, setAllSpace] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchSpaces();
  }, []);

  // const handleOpenChange = (open: boolean) => {
  //   setSpaceEditDialogOpen({ status: open, id: tab.id });
  // };

  const updateSpaceTab = async (id: any) => {
    try {
      const { error } = await supabase
        .from("spaces")
        .update({ space_name: updatedSpaceName || spaceName })
        .eq("id", id);

      if (error) {
        console.error("Error updating space:", error);
        return;
      }

      const { error: taskError } = await supabase
        .from("tasks")
        .update({ is_deleted: true })
        .in(
          "team_id",
          deletedSpace.map((member: any) => member.id)
        );

      if (taskError) {
        console.error("Error deleting tabs:", taskError);
        return;
      }

      const { error: spaceError } = await supabase
        .from("teams")
        .update({ is_deleted: true })
        .in(
          "id",
          deletedSpace.map((member: any) => member.id)
        );

      if (spaceError) {
        console.error("Error deleting tabs:", spaceError);
        return;
      }
      toast({
        title: "Space updated successfully",
        description: "Space has been updated successfully",
      });
      fetchSpaces();
      fetchTeamData();
      setSpaceEditDialogOpen(false);
      const newTabs = tabs.filter((tab) => tab.id !== id);
      const newTabs1 = userTab.filter((tab) => tab.id !== id);
      setTabs(newTabs);
      setUserTab(newTabs1);
      console.log(newTabs1,"new Tabs ");
      if (newTabs.length > 0 || newTabs1.length > 0) {
        setActiveTab(newTabs[0].id);
        setUserActiveTab(newTabs1[0].id);
         // Set first tab as active if any left
         fetchTeams();
      } else {
        setActiveTab(null);
        setUserActiveTab(null);
      }

      // Optional: Refresh spaces list if needed
    } catch (error) {
      console.error("Error updating space:", error);
    }
  };

  const deleteTeam = async (user: any, index: number) => {
    setSpaceDetails((prevMembers) => {
      // Find the team to delete based on user id and index
      const deletedTeam = prevMembers.find(
        (member: any, i: number) => member.id === user.id && i === index
      );
      if (deletedTeam) {
        console.log("Deleted Team:", deletedTeam);
        setDeletedSpace((prevMembers) => [...prevMembers, deletedTeam]);
      }

      return prevMembers.filter(
        (member: any, i: number) => !(member.id === user.id && i === index)
      );
    });
  };

  // Fetch spaces from database
  const fetchSpaces = async () => {
    const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("is_deleted", false)
      // .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching spaces:", error);
      return;
    }

    if (data) {
      setTabs(data);
      setUserTab(data);
      if (data.length > 0) {
        setAdminSpaceLength(data.length)
        setActiveTab(data[0].id); // Set the first tab as active initially
        setUserActiveTab(data[0].id);
        setActiveTabName(data[0].space_name);
        setSelectedActiveTab(data[0].id);
        fetchTeams();
        fetchTeamData();
      }
    }
  };

  // Handle clicking a tab
  const handleTabClick = async (id: number) => {
    console.log("Tab ID clicked:", id);
    const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("id", id)
      // .eq("is_deleted", false)
      .single();

    if (error) {
      console.error("Error fetching space:", error);
      return;
    }

    if (data) {
      setSpaceId(data.id);
      setSpaceName(data.space_name);
      const { data: spaceId, error: spaceError } = await supabase
        .from("teams")
        .select("*")
        .eq("is_deleted", false)
        .eq("space_id", data.id);

      if (spaceError) {
        console.error("Error fetching space:", spaceError);
        return;
      }

      if (spaceId) {
        setSpaceDetails(spaceId);
      }
    }
    setUserTabActive(false);
    setActiveTab(id);
    setUserActiveTab(id);
    fetchTeams(); // Fetch teams for the selected space
    setActiveTabName(data?.space_name);
    setActiveTabNameUser(data?.space_name);
    setSelectedActiveTab(id)
    // fetchTeams(); 
    // fetchTeamData()
  };

  // Add a new tab in database and UI
  const addNewTab = async () => {
    try {
        // Insert a new space and retrieve the data
        const { data, error } = await supabase
            .from("spaces")
            .insert({ space_name: "New Space", is_deleted: false })
            .select();

        // Handle errors from the insertion
        if (error) {
            console.error("Error adding new space:", error);
            return;
        }

        // Proceed if data is successfully returned
        if (data && data[0]) {
            const newTab = data[0];

            // Update tabs and set the last added tab as the active tab
            setTabs((prevTabs) => {
                const updatedTabs = [...prevTabs, newTab];
                setActiveTab(newTab.id); // Activate the newly added tab
                setSelectedActiveTab(newTab.id)
                console.log(newTab.id, " newTab.id");
                return updatedTabs;
            });

            // Update user tabs and set the last added user tab as active
            setUserTab((prevUserTabs) => {
                const updatedUserTabs = [...prevUserTabs, newTab];
                setUserActiveTab(newTab.id); // Activate the newly added user tab
                setSelectedActiveTab(newTab.id)
                console.log(newTab.id, " user newTab.id");
                return updatedUserTabs;
            });
            handleTabClick(newTab.id);

            const { data: spaceId, error: spaceError } = await supabase
                .from("teams")
                .select("*")
                .eq("is_deleted", false)
                .eq("space_id", newTab.id);

            if (spaceError) {
                console.error("Error fetching space:", spaceError);
                return;
            }

            if (spaceId) {
                // setSpaceDetails(spaceId);
                console.log(spaceId, " spaceId");
            }
        }
    } catch (err) {
        console.error("Unexpected error while adding a new tab:", err);
    }
};

const fetchTeamsForTab = async (tabId : number) => {
  console.log(tabId, " tabId");
  try {
      const { data, error } = await supabase
          .from("teams")
          .select("*") // Fetch all columns
          .eq("is_deleted", false)
          .eq("space_id", tabId)
          .single(); // Filter by space_id matching the tabId

      if (error) {
          console.error("Error fetching teams for tab:", error);
          return;
      }

      // Handle case where no rows are returned
      if (!data || data.length === 0) {
        setSpaceName(data.space_name);
          console.log(`No teams found for tab with ID: ${tabId}`);
          // setTeams([]); // Clear teams if no data
          fetchTeams();
          return;
      }

      // Update the state with fetched teams
      console.log(`Teams for tab ${tabId}:`, data); // Debugging
      // setTeams(data); // Update state with the fetched data
  } catch (err) {
      console.error("Unexpected error while fetching teams:", err);
  }
};



  // Delete a tab from database and UI
  const deleteTab = async (id: number) => {
    const backupData: {
      tasks: any[];
      teams: any[];
      space: any;
    } = { tasks: [], teams: [], space: null };

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false)
      .eq("space_id", id);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      return;
    }
    backupData.tasks = tasks || [];

    // Fetch teams
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("*")
      .eq("is_deleted", false)
      .eq("space_id", id);

    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
      return;
    }
    backupData.teams = teams || [];

    // Fetch space
    const { data: space, error: spaceError } = await supabase
      .from("spaces")
      .select("*")
      .eq("id", id)
      .single();

    if (spaceError) {
      console.error("Error fetching space:", spaceError);
      return;
    }
    backupData.space = space;

    // Mark tasks as deleted
    const { error: tasksDeleteError } = await supabase
      .from("tasks")
      .update({ is_deleted: true })
      .eq("space_id", id);

    if (tasksDeleteError) {
      console.error("Error deleting tasks:", tasksDeleteError);
      return;
    }

    // Mark teams as deleted
    const { error: teamsDeleteError } = await supabase
      .from("teams")
      .update({ is_deleted: true })
      .eq("space_id", id);

    if (teamsDeleteError) {
      console.error("Error deleting teams:", teamsDeleteError);
      return;
    }

    // Mark space as deleted
    const { error: spaceDeleteError } = await supabase
      .from("spaces")
      .update({ is_deleted: true })
      .eq("id", id);

    if (spaceDeleteError) {
      console.error("Error deleting space:", spaceDeleteError);
      return;
    }

    // Update UI
    fetchSpaces();
    fetchTeamData();
    fetchTeams();

    const newTabs = tabs.filter((tab) => tab.id !== id);
    const newTabs1 = userTab.filter((tab) => tab.id !== id);
    setTabs(newTabs);
    setUserTab(newTabs1);
    if (newTabs.length > 0 || newTabs1.length > 0) {
      setActiveTab(newTabs[0].id);
      setUserActiveTab(newTabs1[0].id);// Set first tab as active if any left
      //  fetchSpaces();
      //  fetchTeams();
      //  fetchTeamData();
        
    } else {
      setActiveTab(null);
      setUserActiveTab(null);
    }

    toast({
      title: "Deleted Successfully!",
      description: "Space deleted successfully!",
      action: (
        <ToastAction
          altText="Undo"
          onClick={async () => {
            await handleSpaceUndo(backupData);
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  // Undo functionality
  const handleSpaceUndo = async (backupData: {
    tasks: any[];
    teams: any[];
    space: any;
  }) => {
    // Restore tasks
    if (backupData.tasks.length > 0) {
      const { error: tasksRestoreError } = await supabase
        .from("tasks")
        .update({ is_deleted: false })
        .in(
          "id",
          backupData.tasks.map((task) => task.id)
        );

      if (tasksRestoreError) {
        console.error("Error restoring tasks:", tasksRestoreError);
        return;
      }
    }

    // Restore teams
    if (backupData.teams.length > 0) {
      const { error: teamsRestoreError } = await supabase
        .from("teams")
        .update({ is_deleted: false })
        .in(
          "id",
          backupData.teams.map((team) => team.id)
        );

      if (teamsRestoreError) {
        console.error("Error restoring teams:", teamsRestoreError);
        return;
      }
    }

    // Restore space
    if (backupData.space) {
      const { error: spaceRestoreError } = await supabase
        .from("spaces")
        .update({ is_deleted: false })
        .eq("id", backupData.space.id);

      if (spaceRestoreError) {
        console.error("Error restoring space:", spaceRestoreError);
        return;
      }
    }

    // Refresh UI
    fetchSpaces();
    fetchTeamData();
    route.refresh();
    const newTabs = tabs.filter((tab) => tab.id !== backupData.space.id);
    const newTabs1 = userTab.filter((tab) => tab.id !== backupData.space.id);
    setTabs(newTabs);
    setUserTab(newTabs1);
    if (newTabs.length > 0 || newTabs1.length > 0) {
      setActiveTab(newTabs[0].id); // Set first tab as active if any left
      setUserActiveTab(newTabs1[0].id); // Set first tab as active if any left
    } else {
      setActiveTab(null);
      setUserActiveTab(null);
    }
    toast({
      title: "Undo Successful!",
      description: "Space, tasks, and teams have been restored.",
    });
  };

  const getUserData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue= e.target.value;
    setEmailInput(inputValue);

    try {
      // Fetch all users from the database
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      // Filter users whose email includes the input value
      const matchingUsers =
      data?.filter((user) => user.role === "User" && user.email.includes(emailInput)) || [];

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

  const handleUserSelect = (user: Tab) => {
    setTeamMemberError(false);

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
    console.log("User added:", user);
    setEmailInput("");
    setHighlightedIndex(-1);
  };

  const removeMember = (user: Tab, index: number) => {
    setAddedMembers((prevMembers) =>
      prevMembers.filter(
        (member: any, i: number) => !(member.id === user.id && i === index)
      )
    );
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
      setTeamMemberError(false);
      // Select highlighted user on Enter
      handleUserSelect(matchingUsers[highlightedIndex]);
    }
  };

  const defaultSpaceData = async () => {
    if (!activeTab) return;
    if (!userActiveTab) return;
    const tabSpace= userActiveTab || activeTab
    const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("id", tabSpace)
      .single();
     

    if (error) {
      console.error("Error fetching spaces:", error);
      return;
    }

    if (data) {
      setSpaceId(data.id); 
    }
    // setUserTabActive(false);
    // setActiveTab(tabSpace);
    // setUserActiveTab(tabSpace);
    // fetchTeams(); // Fetch teams for the selected space
    // setActiveTabName("");
    // setActiveTabNameUser(data?.space_name);
    // setSelectedActiveTab(tabSpace)
  };

  const fetchTeamData = async () => {
    if (!spaceId) return;
    const { error } = await supabase
      .from("teams")
      .select("*")
      .eq("is_deleted", false)
      .eq("space_id", spaceId);

    if (error) {
      console.log(error);
      return;
    }
  };

  const handleSaveMembers = async () => {
    if (teamName === "") {
      setTeamNameError(true);
      return;
    } else if (addedMembers.length === 0) {
      setTeamMemberError(true);
      return;
    } else {
      // Fetch selected user details based on `id`
      const { data: fetchedMembers, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .in(
          "id",
          addedMembers.map((member) => member.id)
        );

      if (fetchError) {
        console.error("Error fetching members:", fetchError);
        return;
      }

      // Check if there are any members already in the team
      const { data: existingTeam, error: checkError } = await supabase
        .from("teams")
        .select("*")
        .eq("team_name", teamName);

      if (checkError) {
        console.error("Error checking existing team:", checkError);
        return;
      }

      if (existingTeam && existingTeam.length > 0) {
        console.log("Team already exists with these members:", existingTeam);
        toast({
          title: "Team already exists with these members",
          description: "Please choose a different team name.",
        });
        return;
      }

      try {
        // Insert selected user details as array of objects into the `teams` table
        const { error: insertError } = await supabase
          .from("teams")
          .insert({
            team_name: teamName,
            members: fetchedMembers.map((member) => ({
              id: member.id,
              name: member.username, // Assuming `name` is a field in your `users` table
              role: member.role,
              department: member.department,
              designation: member.designation,
              email: member.email, // Assuming `email` is a field in your `users` table
              entity_name: member.entity_name,
              profile_image: member.profile_image,
            })),
            space_id: activeTab,
            is_deleted: false,
          });

        if (insertError) {
          console.error("Error saving members:", insertError);
          return;
        }

        setTeamName("");
        setAddedMembers([]);
        setTeamNameError(false);
        setTeamMemberError(false);
        setMemberAddDialogOpen(false);
        fetchTeamData();
        filterFetchTeams();
        // notify("Members saved successfully", true);
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }
  };

  const handleClose = () => {
    setMemberAddDialogOpen(false);
    setTeamName("");
    setAddedMembers([]);
    setTeamNameError(false);
    setTeamMemberError(false);
  };

  const fetchTeams = async () => {
    const {data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("is_deleted", false)
      .eq("space_id", spaceId);

    if (error) {
      console.log(error,"error fetch");
      return;
    }
    if(data)
    {
      const teamData = data.map((team) => ({
        ...team,
        tasks: [], // Initialize each team with an empty tasks array
      }));
    }
   
  };

  const newFetchTeam = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("is_deleted", false);

    if (error) {
      console.log(error);
      return;
    }
    

    return data;
  };

  const newFetchSpace = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("is_deleted", false);

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }
    setLoading(false);
    return data;
  };

  const filterFetchTeams = async () => {
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
        setFilterTeams(teamData as Team[]);
      }
    };

  // const fetchTasks = async () => {
  //   const { data: tasksData, error: tasksError } = await supabase
  //     .from("tasks")
  //     .select("*")
  //     .eq("is_deleted", false)
  //     .order("created_at", { ascending: true });

  //   if (tasksError) {
  //     console.error("Error fetching tasks:", tasksError);
  //     return;
  //   }

  //   if (tasksData) {
  //     const includesTrueTasks = tasksData.filter((task) =>
  //       task?.mentions?.includes(`@${loggedUserData?.entity_name}`)
  //     );

  //     const { data: spaceData, error: spaceError } = await supabase
  //       .from("spaces")
  //       .select("*")
  //       .eq("is_deleted", false)
  //       .in(
  //         "id",
  //         includesTrueTasks.map((task) => task.space_id)
  //       );

  //     if (spaceError) {
  //       console.error("Error fetching spaces:", spaceError);
  //       return;
  //     }

  //     const allSpaces = await newFetchSpace();
  //     const teamsData = await newFetchTeam();

  //     if (allSpaces && teamsData) {
  //       // Extract space IDs from the teamsData
  //       const includedSpaces = teamsData.map((team) => team.space_id);

  //       // Filter spaces that are not included in the teams table
  //       const notIncludedSpaces = allSpaces.filter(
  //         (space) => !includedSpaces.includes(space.id)
  //       );

  //       if (spaceData) {
  //         // Combine spaceData with spaces not included in teams
  //         const combinedData = [
  //           ...spaceData,
  //           ...notIncludedSpaces.filter(
  //             (space) => !spaceData.some((s) => s.id === space.id)
  //           ),
  //         ];

  //         // if (combinedData.length > 0) {
  //         //   setActiveTab(combinedData[0].id); // Set the first tab as active initially
  //         // }

  //         // Store all combined space IDs
  //         setLoggedSpaceId(combinedData.map((space) => space.id));
  //         setSpaceLength(combinedData.length);
  //       }
  //     }

  //     setAllTasks(tasksData);
  //   }
  // };

  const fetchTasks = async () => {
    try {
      const [{ data: spaces }, { data: teams }, { data: tasks }] =
        await Promise.all([
          supabase.from("spaces").select("*").eq("is_deleted", false),
          supabase.from("teams").select("*").eq("is_deleted", false),
          supabase.from("tasks").select("*").eq("is_deleted", false).order("created_at", { ascending: true }),
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
      // setUserSpace(matchedSpaces);

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

          const allSpaces = await newFetchSpace();
          const teamsData = await newFetchTeam();

          if (allSpaces && teamsData) {
            // Extract space IDs from the teamsData
            const includedSpaces = teamsData.map((team) => team.space_id);

            // Filter spaces that are not included in the teams table
            const notIncludedSpaces = allSpaces.filter(
              (space) => !includedSpaces.includes(space.id)
            );
          
          if(matchedSpaces){
            const combinedData = [
              ...matchedSpaces,
              ...notIncludedSpaces.filter(
                (space : any) => !matchedSpaces.some((s) => s.id === space.id)
              ),
            ];
            setLoggedSpaceId(combinedData.map((space : any) => space.id));
            setSpaceLength(combinedData.length);
          }
        }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFilterTasksAndTeams = async () => {
    try {
      // If no filters are selected, fetch all teams and tasks
      if (!teamFilterValue && !taskStatusFilterValue && !dateFilterValue) {
        await filterFetchTeams();
        await fetchTasks();
        toast({
          title: "Select a filter",
          description: "Please select at least one filter option to get meaningful results.",
          duration: 3000,
        });
        return;
      }
  
      let filteredTeams = [];
      let filteredTasks = [];
  
      // Filter teams based on teamFilterValue
      if (teamFilterValue) {
        filteredTeams = FilterTeams.filter(team =>
          team.team_name?.toLowerCase().includes(teamFilterValue.toLowerCase())
        );
      } else {
        filteredTeams = FilterTeams; // No filter, include all teams
      }
  
      // Filter tasks based on the selected filters
      filteredTasks = allTasks.filter((task : any) => {
        const matchesTeam = teamFilterValue
          ? FilterTeams.some(
              team =>
                team.id === task.team_id &&
                team.team_name?.toLowerCase().includes(teamFilterValue.toLowerCase())
            )
          : true; // Include if no team filter applied
  
        const matchesStatus = taskStatusFilterValue
          ? task.task_status?.toLowerCase().includes(taskStatusFilterValue.toLowerCase())
          : true; // Include if no status filter applied
  
        const matchesDate = dateFilterValue
          ? task.due_date?.includes(dateFilterValue)
          : true; // Include if no date filter applied

          const isNotDeleted = task.is_deleted === false;
  
        // Task matches if all selected filters match
        return matchesTeam && matchesStatus && matchesDate && isNotDeleted;
      });
  
      // Map filtered tasks to their corresponding teams
      const tasksWithTeams = filteredTasks.map((task : any) => {
        const team = FilterTeams.find(team => team.id === task.team_id);
        return {
          ...task,
          teamName: team?.team_name || "No team found", // Include team name or fallback
        };
      });
  
      // Show toast messages based on results
      if (tasksWithTeams.length === 0) {
        toast({
          title: "No tasks found",
          description: "No tasks matched the selected filter criteria.",
          duration: 3000,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Tasks filtered",
          description: `${tasksWithTeams.length} task(s) found with matching criteria.`,
          duration: 3000,
        });
      }
  
      if (filteredTeams.length === 0) {
        toast({
          title: "No teams found",
          description: "No teams matched the selected filter criteria.",
          duration: 3000,
          variant: "destructive",
        });
      }
  
      // Update the UI with filtered data
      setFilterTeams(filteredTeams);
      setAllTasks(tasksWithTeams); // Update tasks with their corresponding teams
      setFilterDialogOpen(false);
    } catch (error) {
      console.error("Error filtering tasks and teams:", error);
      toast({
        title: "Error",
        description: "An error occurred while filtering tasks and teams.",
        duration: 3000,
      });
    }
  };
  

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [highlightedIndex, matchingUsers]);

  useEffect(() => {
    defaultSpaceData();
    setTeamData(fetchTeamData());
    fetchTeams();
    
    if (loggedUserData) {
      fetchTasks();
      filterFetchTeams();
    }
  }, [activeTab, userActiveTab, loggedUserData]);
  
  // Memoize filteredTabs to avoid unnecessary re-renders
  const filteredTabs = useMemo(() => userTab.filter((tab) => loggedSpaceId.includes(tab.id)), [userTab, loggedSpaceId]);
  
  // Set the first tab as active after filtering
  useEffect(() => {
    if (filteredTabs.length > 0 && userTabActive) {
      fetchTeams();
      setUserActiveTab(filteredTabs[0].id);
      setActiveTabNameUser(filteredTabs[0].space_name);
    }
  }, [filteredTabs, userTabActive]);

  return (
    <>
      <WebNavbar
        loggedUserData={loggedUserData as any}
        navbarItems={true}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        // teamFilterValue={teamFilterValue as string}
        setTeamFilterValue={setTeamFilterValue as any}
        // taskStatusFilterValue={taskStatusFilterValue as string}
        setTaskStatusFilterValue={setTaskStatusFilterValue as any}
        setDateFilterValue={setDateFilterValue as any}
        filterFn={() => handleFilterTasksAndTeams()}
        // spaceId={spaceId}
        // teamData={teamData}
        filterDialogOpen={filterDialogOpen}
        setFilterDialogOpen={setFilterDialogOpen}
        teamResetFn = {() => {filterFetchTeams(); fetchTasks();}}
        notificationTrigger={notificationTrigger}
        setNotificationTrigger={setNotificationTrigger}
        allTasks = {allTasks}
      />
      <div className="hidden">
        <span>{spaceEditDialogOpen}</span>
        <span>{allTasks.length}</span>
        <span>{loading}</span>
        <span>{loading}</span>
      </div>
      <div className="px-3 flex justify-start items-center gap-3 h-[calc(100vh-70px)]">
        <div className="flex flex-col justify-between items-center text-center bg-white px-3 border-none rounded-[12px] overflow-x-auto w-[190px] max-w-[200px] h-full pt-3 pb-3 playlist-scroll">
              <div className="text-sm text-gray-400 flex flex-col gap-2.5 w-full">
          {(loggedUserData?.role === "owner" ||
              (loggedUserData?.role === "User" &&
                ((loggedUserData?.access?.space !== true &&
                  loggedUserData?.access?.all === true) ||
                  loggedUserData?.access?.space === true))) && (
                    <div className="pt-0 sticky top-0 z-50 bg-white">
              <button
                onClick={addNewTab}
                className=" rounded-lg border border-gray-300 px-2 py-0.5 flex items-center gap-2 h-10 min-w-fit text-gray-800 justify-center w-full"
                // style={{ width: "max-content" }}
              >
                <HiMiniDocumentPlus className="w-5 h-5" />
                Add Space
              </button>
              </div>
            )}
            {loggedUserData?.role === "owner"
              ? 
              // {
                tabs.length > 0 ? (
                  tabs.map((tab) => (
                    <div
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`space_input max-w-44 min-w-fit relative flex items-center gap-2 rounded-[10px] border pl-3 py-1 pr-8 cursor-pointer h-10 ${
                        activeTab === tab.id
                          ? "bg-[#1A56DB] text-white border-none"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <span>{tab.space_name.length > 12 ? `${tab.space_name.slice(0, 12)}...` : tab.space_name}</span>
  
                      {(loggedUserData?.role === "owner" ||
                        (loggedUserData?.role === "User" &&
                          ((loggedUserData?.access?.space !== true &&
                            loggedUserData?.access?.all === true) ||
                            loggedUserData?.access?.space === true))) && (
                        <Sheet
                        // open={spaceEditDialogOpen}
                        // onOpenChange={setSpaceEditDialogOpen}
                        >
                          <SheetTrigger asChild>
                            <EllipsisVertical
                              className={`absolute right-2 focus:outline-none space_delete_button ${
                                activeTab === tab.id
                                  ? "text-white border-none"
                                  : "bg-white border-gray-300 text-gray-400"
                              }`}
                              size={16}
                            />
                          </SheetTrigger>
                          <SheetContent
                            className="pt-2.5 p-3 font-inter flex flex-col justify-between"
                            style={{ maxWidth: "415px" }}
                          >
                            <div>
                              <SheetHeader>
                                <SheetTitle className="text-gray-500 uppercase text-base">
                                  space setting
                                </SheetTitle>
                              </SheetHeader>
                              <div className="mt-3">
                                <Label
                                  htmlFor="name"
                                  className="text-sm text-gray-900"
                                >
                                  Space Name
                                </Label>
                                <Input
                                  id="name"
                                  defaultValue={tab.space_name}
                                  className="w-full mt-1"
                                  onChange={(e) =>
                                    setUpdatedSpaceName(e.target.value)
                                  }
                                  autoFocus
                                />
                              </div>
                              <div className="pt-2">
                                <Label
                                  htmlFor="name"
                                  className="text-sm text-gray-900"
                                >
                                  Teams
                                </Label>
                                <div className="border border-gray-300 mt-1 rounded p-3 min-h-40 h-[67vh] max-h-[70vh] overflow-auto playlist-scroll">
                                  {spaceDetails.length > 0 ? (
                                    spaceDetails.map(
                                      (team: any, index: number) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between mb-2"
                                        >
                                          <p className="text-gray-900 font-inter text-sm">
                                            {team.team_name.length > 16
                                              ? team.team_name.slice(0, 16) +
                                                "..."
                                              : team.team_name}
                                          </p>
                                          <div className="flex">
                                            {team.members.length > 0 ? (
                                              <>
                                                {team.members
                                                  .slice(0, 6)
                                                  .map(
                                                    (
                                                      member: any,
                                                      index: number
                                                    ) => (
                                                      <Image
                                                        key={index}
                                                        src={member.profile_image}
                                                        alt={member.name}
                                                        width={30}
                                                        height={30}
                                                        className={`w-[32px] h-[32px] rounded-full ${
                                                          team.members.length ===
                                                          1
                                                            ? "mr-2.5"
                                                            : team.members
                                                                .length > 0
                                                            ? "-mr-2.5"
                                                            : ""
                                                        } border-2 border-white`}
                                                      />
                                                    )
                                                  )}
                                                {team.members.length > 6 && (
                                                  <div className="bg-gray-900 text-white rounded-full w-[32px] h-[32px] flex items-center justify-center text-xs border-2 border-white">
                                                    +{team.members.length - 6}
                                                  </div>
                                                )}
                                              </>
                                            ) : (
                                              <p className="text-gray-900 font-inter text-sm">
                                                No Members Found
                                              </p>
                                            )}
                                          </div>
  
                                          <Trash2
                                            size={16}
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              deleteTeam(team, index);
                                            }}
                                          />
                                        </div>
                                      )
                                    )
                                  ) : (
                                    <p className="text-gray-500 text-base font-inter">
                                      No Team Found
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
  
                            <SheetFooter className="">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-1/3 border border-red-500 text-red-500 text-sm hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTab(tab.id);
                                  setAdminSpaceLength(adminSpaceLength - 1);
                                }}
                              >
                                Delete Space
                              </Button>
                              <SheetClose asChild>
                                <Button
                                  type="submit"
                                  variant="outline"
                                  className="w-1/3 text-sm"
                                >
                                  Cancel
                                </Button>
                              </SheetClose>
                              <Button
                                type="submit"
                                className="bg-primaryColor-700 text-white hover:bg-primaryColor-700 text-sm w-1/3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateSpaceTab(tab.id);
                                }}
                              >
                                Update
                              </Button>
                            </SheetFooter>
                          </SheetContent>
                        </Sheet>
                      )}
                    </div>
                  ))
                ) : (
                  // <DefaultSkeleton />
                  null
                )
              // }
              
              :
                // Filter and map tabs based on loggedSpaceId
                filteredTabs.length > 0 ? (
                  filteredTabs
                  .map((tab) => (
                    <div
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`space_input max-w-44 min-w-fit relative flex items-center gap-2 rounded-[8px] border pl-3 py-1 pr-8 cursor-pointer h-10 ${
                        userActiveTab === tab.id
                          ? "bg-[#1A56DB] text-white border-none"
                          : "bg-white border-gray-300" 
                      }`}
                    >
                      <span>{tab.space_name.length > 12 ? `${tab.space_name.slice(0, 12)}...` : tab.space_name}</span>

                      {(loggedUserData?.role === "owner" ||
                        (loggedUserData?.role === "User" &&
                          ((loggedUserData?.access?.space !== true &&
                            loggedUserData?.access?.all === true) ||
                            loggedUserData?.access?.space === true))) && (
                        <Sheet>
                          <SheetTrigger asChild>
                            <EllipsisVertical
                              className={`absolute right-2 focus:outline-none space_delete_button ${
                                userActiveTab === tab.id
                                  ? "text-white border-none"
                                  : "bg-white border-gray-300 text-gray-400"
                              }`}
                              size={16}
                            />
                          </SheetTrigger>
                          <SheetContent
                            className="pt-2.5 p-3 font-inter flex flex-col justify-between"
                            style={{ maxWidth: "415px" }}
                          >
                            <div>
                              <SheetHeader>
                                <SheetTitle className="text-gray-500 uppercase text-base">
                                  Space Settings
                                </SheetTitle>
                              </SheetHeader>
                              <div className="mt-3">
                                <Label
                                  htmlFor="name"
                                  className="text-sm text-gray-900"
                                >
                                  Space Name
                                </Label>
                                <Input
                                  id="name"
                                  defaultValue={tab.space_name}
                                  className="w-full mt-1"
                                  onChange={(e) =>
                                    setUpdatedSpaceName(e.target.value)
                                  }
                                  autoFocus
                                />
                              </div>
                              <div className="pt-2">
                                <Label
                                  htmlFor="name"
                                  className="text-sm text-gray-900"
                                >
                                  Teams
                                </Label>
                                <div className="border border-gray-300 mt-1 rounded p-3 min-h-40 h-[67vh] max-h-[70vh] overflow-auto playlist-scroll">
                                  {spaceDetails.length > 0 ? (
                                    spaceDetails.map((team, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between mb-2"
                                      >
                                        <p className="text-gray-900 font-inter text-sm">
                                          {team.team_name.length > 16
                                            ? team.team_name.slice(0, 16) +
                                              "..."
                                            : team.team_name}
                                        </p>
                                        <div className="flex">
                                          {team.members.length > 0 ? (
                                            <>
                                              {team.members
                                                .slice(0, 6)
                                                .map(
                                                  (
                                                    member: any,
                                                    index: number
                                                  ) => (
                                                    <Image
                                                      key={index}
                                                      src={member.profile_image}
                                                      alt={member.name}
                                                      width={30}
                                                      height={30}
                                                      className={`w-[32px] h-[32px] rounded-full ${
                                                        team.members.length ===
                                                        1
                                                          ? "mr-2.5"
                                                          : team.members
                                                              .length > 0
                                                          ? "-mr-2.5"
                                                          : ""
                                                      } border-2 border-white`}
                                                    />
                                                  )
                                                )}
                                              {team.members.length > 6 && (
                                                <div className="bg-gray-900 text-white rounded-full w-[32px] h-[32px] flex items-center justify-center text-xs border-2 border-white">
                                                  +{team.members.length - 6}
                                                </div>
                                              )}
                                            </>
                                          ) : (
                                            <p className="text-gray-900 font-inter text-sm">
                                              No Members Found
                                            </p>
                                          )}
                                        </div>
                                        <Trash2
                                          size={16}
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTeam(team, index);
                                          }}
                                        />
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-base font-inter">
                                      No Team Found
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <SheetFooter>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-1/3 border border-red-500 text-red-500 text-sm hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTab(tab.id);
                                }}
                              >
                                Delete Space
                              </Button>
                              <SheetClose asChild>
                                <Button
                                  type="submit"
                                  variant="outline"
                                  className="w-1/3 text-sm"
                                >
                                  Cancel
                                </Button>
                              </SheetClose>
                              <Button
                                type="submit"
                                className="bg-primaryColor-700 text-white hover:bg-primaryColor-700 text-sm w-1/3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateSpaceTab(tab.id);
                                }}
                              >
                                Update
                              </Button>
                            </SheetFooter>
                          </SheetContent>
                        </Sheet>
                      )}
                    </div>
                  ))
                ) : (
                  // <DefaultSkeleton />
                  null
                )
                }
          </div>
        </div>
        <div className="w-[calc(100%-190px)] flex flex-col gap-3 h-[calc(100vh-70px)]">
          <div className="w-full h-[60px] flex justify-between items-center bg-white rounded-[10px] p-4">
            {
              loggedUserData?.role === "owner" ? (
                <p className="text-xl font-semibold font-inter">{activeTabName || spaceName}</p>
              ) : (
                  <p className="text-xl font-semibold font-inter">{activeTabNameUser || spaceName}</p>
              )
            }
            
          {(
            (loggedUserData?.role === "owner" && (adminSpaceLength > 0 || adminSpaceLength === 1)) ||
            (loggedUserData?.role === "User" &&
              ((loggedUserData?.access?.team !== true &&
                loggedUserData?.access?.all === true) ||
                loggedUserData?.access?.team === true) && (spaceLength > 0 || spaceLength === 1))
              ) && (
            <div className="flex gap-2 text-sm text-gray-400">
              <Sheet
                open={memberAddDialogOpen}
                onOpenChange={setMemberAddDialogOpen}
              >
                <SheetTrigger asChild>
                  <button
                    className="rounded-[10px] border border-gray-400 text-gray-800 px-2 py-0.5 flex items-center justify-center gap-2 h-10"
                  >
                    <HiMiniDocumentPlus className="w-5 h-5" />
                    Add Team
                  </button>
                </SheetTrigger>
                <SheetContent
                  className="min-h-screen overflow-y-scroll"
                  style={{ maxWidth: "500px" }}
                >
                  <SheetHeader>
                    <SheetTitle className="text-base">TEAM SETTING</SheetTitle>
                  </SheetHeader>
                  <div className="py-2">
                    <label
                      htmlFor="name"
                      className="text-sm text-[#111928] font-medium"
                    >
                      Team Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Team Name"
                      className="text-gray-500 mt-1.5 py-3 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
                      onChange={(e: any) => {
                        setTeamName(e.target.value);
                        setTeamNameError(false);
                      }}
                    />
                    {teamNameError && (
                      <p className="text-red-500 text-sm mt-1">
                        Please fill the field
                      </p>
                    )}
                    <div className="mt-8 relative">
                      {matchingUsers.length > 0 &&
                        emailInput.length > 0 &&
                        !noUserFound && (
                          <div className="absolute bottom-[-28px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
                            {matchingUsers.length > 0 && (
                              <ul>
                                {matchingUsers.map((user, index) => (
                                  <li
                                    key={user.id}
                                    className={`p-2 cursor-pointer ${
                                      index === highlightedIndex
                                        ? "bg-gray-200"
                                        : "hover:bg-gray-100"
                                    }`}
                                    onClick={() => {handleUserSelect(user)}}
                                    onMouseEnter={() =>
                                      setHighlightedIndex(index)
                                    }
                                  >
                                    {user.email}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      {noUserFound && (
                        <div className="absolute bottom-[-28px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
                          <ul>
                            <li className="p-2 cursor-pointer hover:bg-gray-100">
                              No User Found
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="members"
                        className="text-sm text-[#111928] font-medium"
                      >
                        Members
                      </label>
                      <Input
                        id="members"
                        autoComplete="off"
                        placeholder="Add email"
                        className="text-gray-500 mt-1.5 h-12 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
                        onChange={getUserData}
                        value={emailInput}
                        
                      />

                      {/* <Button className="absolute right-[30px] bottom-[38px] rounded-[10px] border border-zinc-300 bg-primaryColor-700 text-white text-xs font-medium hover:bg-primaryColor-700">
                    <Plus size={16} />
                    Add
                  </Button> */}
                    </div>
                    {teamMemberError && (
                      <p className="text-red-500 text-sm mt-1">
                        Please fill the field
                      </p>
                    )}
                    {addedMembers.length > 0 && (
                      <div className="mt-2 p-2 flex flex-wrap items-center gap-2 w-full border border-gray-300 rounded-md">
                        {addedMembers.map((member, index) => (
                          <div
                            key={member.id}
                            className="flex justify-between items-center gap-2 py-1 px-2 w-full text-sm text-gray-500"
                          >
                            <div className="flex items-center gap-1">
                              <Image
                                src={member.profile_image}
                                alt="user image"
                                width={36}
                                height={36}
                                className="w-[32px] h-[32px] rounded-full"
                              />
                              <span>{member.username}</span>
                            </div>
                            <span
                              className={`${
                                member.role === "superadmin"
                                  ? "text-[#0E9F6E]"
                                  : "text-gray-500"
                              }`}
                            >
                              {member.designation?.length > 25
                                ? `${member.designation?.slice(0, 26)}...`
                                : member.designation}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMember(member, index);
                              }}
                              className="focus:outline-none space_delete_button text-gray-400"
                            >
                              <Trash2 className="text-black" size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <SheetFooter className="mt-5">
                    <Button
                      type="submit"
                      variant={"outline"}
                      className="w-1/2 border border-gray-200 text-gray-800 font-medium"
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="w-1/2 bg-primaryColor-700 hover:bg-blue-600 text-white"
                      onClick={handleSaveMembers}
                    >
                      Save
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          )}
          </div>
        <SpaceTeam
          spaceId={spaceId as number}
          teamData={teamData}
          setTeamData={fetchTeamData}
          loggedUserData={loggedUserData as any}
          searchValue={searchValue as string}
          setSearchValue={setSearchValue as any}
          teamFilterValue={teamFilterValue as string}
          setTeamFilterValue={setTeamFilterValue as any}
          taskStatusFilterValue={taskStatusFilterValue as string}
          setTaskStatusFilterValue={setTaskStatusFilterValue as any}
          dateFilterValue={dateFilterValue as string}
          setDateFilterValue={setDateFilterValue as any}
          allTasks={allTasks as any}
          filterTeams = {FilterTeams as any}
          setFilterTeams = {setFilterTeams as any}
          setAllTasks={setAllTasks as any}
          filterFetchTeams={filterFetchTeams as any}
          filterFetchTasks={fetchTasks as any}
          notificationTrigger={notificationTrigger}
          setNotificationTrigger={setNotificationTrigger}
          newTabTeamTrigger={newTabTeamTrigger}
        />
        </div>
      </div>
    </>
  );
};

export default SpaceBar;
