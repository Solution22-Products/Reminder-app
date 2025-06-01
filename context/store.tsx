"use client";

import { getLoggedInUserData } from "@/app/(signin-setup)/sign-in/action";
import { supabase } from "@/utils/supabase/supabaseClient";
import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import { boolean } from "zod";

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
  mobile: string;
  password: string;
  profile_image: string;
  entity_name: string;
  access: { space: boolean; team: boolean; task: boolean; all: boolean };
}

interface Task {
  id: string;
  task_content: string;
  space_id: string | null;
  team_id: string | null;
  mentions: string | null;
  time: string;
  due_date?: string;
  is_deleted: boolean;
  entity_name?: string;
  task_status?: string;
  priority?: string;
  [key: string]: any; // For any additional properties
}

interface FilterOptions {
  status: string[];
  priority: string[];
  dueDate: string | null;
  showOverdueOnly: boolean;
}

interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

interface ContextProps {
  userId: UserData | null;
  setUserId: Dispatch<SetStateAction<UserData | null>>;
  selectedActiveTab: string | number | null;
  setSelectedActiveTab: Dispatch<SetStateAction<string | number | null>>;
  allTasks: Task[];
  filteredTasks: Task[];
  setAllTasks: Dispatch<SetStateAction<Task[]>>;
  fetchAllTasks: () => Promise<void>;
  searchTasks: (
    searchTerm: string,
    spaceId?: string | null,
    teamId?: string | null
  ) => void;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  resetSearch: () => void;
  filterOptions: FilterOptions;
  setFilterOptions: Dispatch<SetStateAction<FilterOptions>>;
  applyFilters: () => void;
  clearAllFilters: () => void;
  sortOption: SortOption;
  setSortOption: Dispatch<SetStateAction<SortOption>>;
  setKanbanTasks: Dispatch<SetStateAction<boolean>>;
  notificationTrigger: boolean;
  setNotificationTrigger: Dispatch<SetStateAction<boolean>>;
}

const GlobalContext = createContext<ContextProps>({
  userId: null,
  setUserId: () => null,
  selectedActiveTab: null,
  setSelectedActiveTab: () => null,
  allTasks: [],
  filteredTasks: [],
  setAllTasks: () => null,
  fetchAllTasks: () => Promise.resolve(),
  searchTasks: () => null,
  searchTerm: "",
  setSearchTerm: () => null,
  resetSearch: () => null,
  filterOptions: {
    status: [],
    priority: [],
    dueDate: null,
    showOverdueOnly: false,
  },
  setFilterOptions: () => null,
  applyFilters: () => null,
  clearAllFilters: () => null,
  sortOption: { field: "time", direction: "desc" },
  setSortOption: () => null,
  setKanbanTasks: (boolean) => null,
  notificationTrigger: false,
  setNotificationTrigger: () => null,
});

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<UserData | null>(null);
  const [selectedActiveTab, setSelectedActiveTab] = useState<
    number | string | null
  >(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: [],
    priority: [],
    dueDate: null,
    showOverdueOnly: false,
  });
  const [sortOption, setSortOption] = useState<SortOption>({
    field: "time",
    direction: "desc",
  });
  const [kanbanTasks, setKanbanTasks] = useState<boolean>(true);
  const [notificationTrigger, setNotificationTrigger] = useState(false);

  const fetchAllTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("is_deleted", false);

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      setAllTasks(data || []);

      // Apply initial filtering based on current space and team
      filterAndSortTasks(
        data || [],
        currentSpaceId,
        currentTeamId,
        searchTerm,
        filterOptions,
        sortOption
      );
    } catch (error) {
      console.error("Unexpected error fetching tasks:", error);
    }
  };

  // Helper function to filter tasks by space, team, search term, and filter options
  const filterAndSortTasks = (
    tasks: Task[],
    spaceId: string | null,
    teamId: string | null,
    term: string,
    filters: FilterOptions,
    sort: SortOption
  ) => {
    // First filter by space and team if they are selected
    let filtered = [...tasks]; // Create a copy to avoid mutating the original array
    if (kanbanTasks) {
      if (spaceId && teamId) {
        filtered = filtered.filter(
          (task) => task.space_id === spaceId && task.team_id === teamId
        );
      } else if (spaceId) {
        filtered = filtered.filter((task) => task.space_id === spaceId);
      } else if (teamId) {
        filtered = filtered.filter((task) => task.team_id === teamId);
      }
    }

    // Then apply search term if it exists
    if (term && term.trim() !== "") {
      const lowerTerm = term.toLowerCase();

      filtered = filtered.filter((task) => {
        const contentMatch = task.task_content
          ?.toLowerCase()
          .includes(lowerTerm);
        const entityMatch = task.entity_name?.toLowerCase().includes(lowerTerm);
        const createdDateMatch = task.time?.toLowerCase().includes(lowerTerm);
        const dueDateMatch = task.due_date?.toLowerCase().includes(lowerTerm);
        const statusMatch = task.task_status?.toLowerCase().includes(lowerTerm);

        return (
          contentMatch ||
          entityMatch ||
          createdDateMatch ||
          dueDateMatch ||
          statusMatch
        );
      });
    }

    // Apply status filters
    if (filters.status.length > 0) {
      filtered = filtered.filter((task) =>
        filters.status.includes(task.task_status || "")
      );
    }

    // Apply priority filters
    if (filters.priority.length > 0) {
      filtered = filtered.filter((task) =>
        filters.priority.includes(task.priority || "")
      );
    }

    // Apply due date filter
    if (filters.dueDate) {
      filtered = filtered.filter((task) => {
        const filterDate = new Date(filters.dueDate || "");
        const taskDate = new Date(task.due_date || "");

        // Compare only year, month, and day
        return (
          filterDate.getFullYear() === taskDate.getFullYear() &&
          filterDate.getMonth() === taskDate.getMonth() &&
          filterDate.getDate() === taskDate.getDate()
        );
      });
    }

    // Apply overdue filter
    if (filters.showOverdueOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((task) => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate < today && task.task_status !== "Completed";
      });
    }

    // Apply sorting - FIX: Properly handle date sorting
    filtered.sort((a, b) => {
      if (sort.field === "time") {
        // Convert string dates to Date objects for proper comparison
        const dateA = new Date(a.time || "");
        const dateB = new Date(b.time || "");

        if (sort.direction === "asc") {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      } else {
        // For non-date fields
        const fieldA = a[sort.field] || "";
        const fieldB = b[sort.field] || "";

        if (sort.direction === "asc") {
          return fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
        } else {
          return fieldA > fieldB ? -1 : fieldA < fieldB ? 1 : 0;
        }
      }
    });

    setFilteredTasks(filtered);
  };

  const searchTasks = (
    term: string,
    spaceId: string | null = currentSpaceId,
    teamId: string | null = currentTeamId
  ) => {
    setSearchTerm(term);
    setCurrentSpaceId(spaceId);
    setCurrentTeamId(teamId);

    filterAndSortTasks(
      allTasks,
      spaceId,
      teamId,
      term,
      filterOptions,
      sortOption
    );
  };

  const resetSearch = () => {
    setSearchTerm("");
    filterAndSortTasks(
      allTasks,
      currentSpaceId,
      currentTeamId,
      "",
      filterOptions,
      sortOption
    );
  };

  const applyFilters = () => {
    filterAndSortTasks(
      allTasks,
      currentSpaceId,
      currentTeamId,
      searchTerm,
      filterOptions,
      sortOption
    );
  };

  const clearAllFilters = () => {
    setFilterOptions({
      status: [],
      priority: [],
      dueDate: null,
      showOverdueOnly: false,
    });

    filterAndSortTasks(
      allTasks,
      currentSpaceId,
      currentTeamId,
      searchTerm,
      { status: [], priority: [], dueDate: null, showOverdueOnly: false },
      sortOption
    );
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Re-filter tasks when space or team changes
  useEffect(() => {
    if (allTasks.length > 0) {
      filterAndSortTasks(
        allTasks,
        currentSpaceId,
        currentTeamId,
        searchTerm,
        filterOptions,
        sortOption
      );
    }
  }, [currentSpaceId, currentTeamId, kanbanTasks]);

  // Re-filter when filter options change
  useEffect(() => {
    if (allTasks.length > 0) {
      filterAndSortTasks(
        allTasks,
        currentSpaceId,
        currentTeamId,
        searchTerm,
        filterOptions,
        sortOption
      );
    }
  }, [filterOptions, sortOption, kanbanTasks]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await getLoggedInUserData();

        if (!user?.id) {
          console.log("No logged-in user found");
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("userId", user?.id)
          .single();

        if (error) {
          console.error("Error fetching user data from store:", error);
          return;
        }

        setUserId(data);
      } catch (error) {
        console.error("Unexpected error fetching user:", error);
      }
    };

    getUser();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        userId,
        setUserId,
        selectedActiveTab,
        setSelectedActiveTab,
        allTasks,
        filteredTasks,
        setAllTasks,
        fetchAllTasks,
        searchTasks,
        searchTerm,
        setSearchTerm,
        resetSearch,
        filterOptions,
        setFilterOptions,
        applyFilters,
        clearAllFilters,
        sortOption,
        setSortOption,
        setKanbanTasks,
        notificationTrigger,
        setNotificationTrigger,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
