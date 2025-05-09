"use client"

import { getLoggedInUserData } from "@/app/(signin-setup)/sign-in/action"
import { supabase } from "@/utils/supabase/supabaseClient"
import type React from "react"
import { createContext, useContext, useState, useEffect, type Dispatch, type SetStateAction } from "react"

interface UserData {
  id: string
  username: string
  email: string
  role: string
  mobile: string
  password: string
  profile_image: string
  entity_name: string
  access: { space: boolean; team: boolean; task: boolean; all: boolean }
}

interface Task {
  id: string
  task_content: string
  space_id: string | null
  team_id: string | null
  mentions: string | null
  time: string
  due_date?: string
  is_deleted: boolean
  entity_name?: string
  task_status?: string
  [key: string]: any // For any additional properties
}

interface ContextProps {
  userId: UserData | null
  setUserId: Dispatch<SetStateAction<UserData | null>>
  selectedActiveTab: string | number | null
  setSelectedActiveTab: Dispatch<SetStateAction<string | number | null>>
  allTasks: Task[]
  filteredTasks: Task[]
  setAllTasks: Dispatch<SetStateAction<Task[]>>
  fetchAllTasks: () => Promise<void>
  searchTasks: (searchTerm: string, spaceId?: string | null, teamId?: string | null) => void
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
  resetSearch: () => void
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
})

export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<UserData | null>(null)
  const [selectedActiveTab, setSelectedActiveTab] = useState<number | string | null>(null)
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null)
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null)

  const fetchAllTasks = async () => {
    try {
      const { data, error } = await supabase.from("tasks").select("*").eq("is_deleted", false)

      if (error) {
        console.error("Error fetching tasks:", error)
        return
      }

      setAllTasks(data || [])

      // Apply initial filtering based on current space and team
      filterTasksBySpaceAndTeam(data || [], currentSpaceId, currentTeamId, "")
    } catch (error) {
      console.error("Unexpected error fetching tasks:", error)
    }
  }

  // Helper function to filter tasks by space and team
  const filterTasksBySpaceAndTeam = (tasks: Task[], spaceId: string | null, teamId: string | null, term: string) => {
    // First filter by space and team if they are selected
    let filtered = tasks

    if (spaceId && teamId) {
      filtered = tasks.filter((task) => task.space_id === spaceId && task.team_id === teamId)
    } else if (spaceId) {
      filtered = tasks.filter((task) => task.space_id === spaceId)
    } else if (teamId) {
      filtered = tasks.filter((task) => task.team_id === teamId)
    }

    // Then apply search term if it exists
    if (term && term.trim() !== "") {
      const lowerTerm = term.toLowerCase()

      filtered = filtered.filter((task) => {
        const contentMatch = task.task_content?.toLowerCase().includes(lowerTerm)
        const entityMatch = task.entity_name?.toLowerCase().includes(lowerTerm)
        const createdDateMatch = task.time?.toLowerCase().includes(lowerTerm)
        const dueDateMatch = task.due_date?.toLowerCase().includes(lowerTerm)
        const statusMatch = task.task_status?.toLowerCase().includes(lowerTerm)

        return contentMatch || entityMatch || createdDateMatch || dueDateMatch || statusMatch
      })
    }

    setFilteredTasks(filtered)
  }

  const searchTasks = (
    term: string,
    spaceId: string | null = currentSpaceId,
    teamId: string | null = currentTeamId,
  ) => {
    setSearchTerm(term)
    setCurrentSpaceId(spaceId)
    setCurrentTeamId(teamId)

    filterTasksBySpaceAndTeam(allTasks, spaceId, teamId, term)
  }

  const resetSearch = () => {
    setSearchTerm("")
    filterTasksBySpaceAndTeam(allTasks, currentSpaceId, currentTeamId, "")
  }

  useEffect(() => {
    fetchAllTasks()
  }, [])

  // Re-filter tasks when space or team changes
  useEffect(() => {
    if (allTasks.length > 0) {
      filterTasksBySpaceAndTeam(allTasks, currentSpaceId, currentTeamId, searchTerm)
    }
  }, [currentSpaceId, currentTeamId])

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await getLoggedInUserData()

        if (!user?.id) {
          console.log("No logged-in user found")
          return
        }

        const { data, error } = await supabase.from("users").select("*").eq("userId", user?.id).single()

        if (error) {
          console.error("Error fetching user data from store:", error)
          return
        }

        setUserId(data)
      } catch (error) {
        console.error("Unexpected error fetching user:", error)
      }
    }

    getUser()
  }, [])

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
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContext = () => useContext(GlobalContext)
