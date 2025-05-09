"use client"

import type React from "react"
import { Skeleton } from "./ui/skeleton"
import { useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { SendHorizontal } from "lucide-react"
import { useGlobalContext } from "@/context/store"
import NewNavbar from "./newNavbar"

interface ChatLeftSpaceProps {
  selectedTeamId: string | null
  selectedSpaceId: string | null
  selectedUserId: string | null
  spaces: any[]
  teams: any[]
  members: any[]
  isLoading: boolean
}

const ChatLeftSpace = ({
  selectedTeamId,
  selectedSpaceId,
  selectedUserId,
  spaces,
  teams,
  members,
  isLoading,
}: ChatLeftSpaceProps) => {
  // Find the selected items by ID
  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId)
  const selectedTeam = teams.find((team) => team.id === selectedTeamId)
  const selectedMember = members.find((member) => member.id === selectedUserId)

  const { filteredTasks, fetchAllTasks, searchTerm, searchTasks, userId } = useGlobalContext()

  // Update search with current space and team whenever they change
  useEffect(() => {
    searchTasks(searchTerm, selectedSpaceId, selectedTeamId)
  }, [selectedSpaceId, selectedTeamId])

  // Get tasks for display based on current selections
  const getDisplayTasks = () => {
    if (!filteredTasks.length) return []

    // If a user is selected, filter by mentions
    if (selectedUserId && selectedMember) {
      return filteredTasks.filter((task) => task.mentions?.includes(`@${selectedMember.entity_name}`))
    }

    return filteredTasks
  }

  const displayTasks = getDisplayTasks()

  useEffect(() => {
    fetchAllTasks()
  }, [])

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchTasks(e.target.value, selectedSpaceId, selectedTeamId)
  }

  return (
    <div className="relative h-[100dvh]">
      <NewNavbar
        selectedSpaceId={selectedSpaceId}
        selectedTeamId={selectedTeamId}
        selectedUserId={selectedUserId}
        selectedTeam={selectedTeam}
        selectedMember={selectedMember}
      />

      <h1 className="text-2xl font-bold mb-6 pl-6 pt-6">Chat Dashboard</h1>

      {/* Scrollable Content */}
      <div className="p-6 pt-0 pb-20 w-full h-[calc(100dvh-180px)] overflow-y-auto">
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-xl shadow-md p-4">
                  <h2 className="text-lg font-semibold mb-3">
                    {selectedSpaceId && selectedTeam
                      ? `Tasks in ${selectedTeam.team_name}`
                      : selectedUserId && selectedMember
                        ? `Tasks for ${selectedMember.username}`
                        : "Tasks"}
                  </h2>

                  {displayTasks.length > 0 ? (
                    <div className="space-y-3">
                      {displayTasks.map((task) => (
                        <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-medium text-gray-500 mt-1">
                            {task.mentions && <span className="text-blue-700">{task.mentions}</span>}{" "}
                            {task.task_content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Created: {task.time}</p>
                          {task.due_date && <p className="text-xs text-gray-500 mt-1">Due date: {task.due_date}</p>}
                          {task.task_status && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                task.task_status.toLowerCase() === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : task.task_status.toLowerCase() === "in progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {task.task_status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-400 italic">
                        {selectedSpaceId && selectedTeamId
                          ? `No tasks found for this team`
                          : selectedUserId
                            ? `No tasks assigned to this user`
                            : `No tasks found`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Input */}
      <div className="fixed bottom-4 left-[290px] right-0 max-w-[50%] bg-white z-50 rounded-full shadow-2xl">
        <div className="relative px-4 py-4">
          <Input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchInput}
            className="w-full pr-12 rounded-lg border border-gray-300 focus:ring-2 outline-none"
          />
          <Button className="absolute right-6 top-1/2 transform -translate-y-1/2" aria-label="Send">
            <SendHorizontal className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatLeftSpace