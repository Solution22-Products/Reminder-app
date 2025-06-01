"use client";

import type React from "react";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Calendar, Ellipsis, Pencil, Timer, Trash2 } from "lucide-react";
import { useGlobalContext } from "@/context/store";
import NewNavbar from "./newNavbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { supabase } from "@/utils/supabase/supabaseClient";
import NewReactMentions from "./new-react-mentions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import DeleteSpaceDialog from "./deleteSpaceDialog";
import { differenceInCalendarDays } from "date-fns";

interface ChatLeftSpaceProps {
  selectedTeamId: string | null;
  selectedSpaceId: string | null;
  selectedUserId: string | null;
  spaces: any[];
  teams: any[];
  members: any[];
  isLoading: boolean;
}

type TeamSpaceInfo = {
  teamId: string;
  spaceId: string | null;
};

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
  const selectedSpace = spaces.find((space) => space.id === selectedSpaceId);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);
  const selectedMember = members.find((member) => member.id === selectedUserId);

  const [currentDeleteTask, setCurrentDeleteTask] = useState<any>(null);
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);
  const [isEditTask, setIsEditTask] = useState({
    id: "",
    isEditTask: false,
  });
  const [currentTask, setCurrentTask] = useState<any>(null);

  const {
    filteredTasks,
    fetchAllTasks,
    searchTerm,
    searchTasks,
    userId: loggedUserData,
  } = useGlobalContext();

  // Update search with current space and team whenever they change
  useEffect(() => {
    searchTasks(searchTerm, selectedSpaceId, selectedTeamId);
  }, [selectedSpaceId, selectedTeamId]);

  // Get tasks for display based on current selections
  const getDisplayTasks = () => {
    if (!filteredTasks.length) return [];

    // If a user is selected, filter by mentions
    if (selectedUserId && selectedMember) {
      return filteredTasks.filter((task) =>
        task.mentions?.includes(`@${selectedMember.entity_name}`)
      );
    }

    return filteredTasks;
  };

  const getTeamsBySpaceId = (spaceId: string) => {
    return teams.filter((team) => team.space_id === spaceId);
  };

  const displayTasks = getDisplayTasks();

  const handleEditTask = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTask(task);
    setIsEditTask({ id: task.id, isEditTask: true });
    console.log(selectedUserId ? selectedUserId : null);
  };

  const handleDeleteTask = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDeleteTask(task);
    setDeleteTaskModalOpen(true);
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = differenceInCalendarDays(today, due);
    return diff > 0 ? diff : 0;
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

    // 'en-US' gives format like "Aug 23, 2024"
    return date.toLocaleDateString("en-US", options).replace(",", "");
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  return (
    <div className="">
      <NewNavbar
        selectedSpaceId={selectedSpaceId}
        selectedTeamId={selectedTeamId}
        selectedUserId={selectedUserId}
        selectedTeam={selectedTeam}
        selectedMember={selectedMember}
        name={{ name: "Kanban View", kanban: false }}
        spaces={spaces}
      />

      {/* Scrollable Content */}
      <div
        className={`p-3.5 w-full ${
          loggedUserData?.role === "owner" ||
          (loggedUserData?.role === "User" &&
            ((loggedUserData?.access?.task !== true &&
              loggedUserData?.access?.all === true) ||
              loggedUserData?.access?.task === true))
            ? "h-[calc(100dvh-152px)] pb-20 overflow-y-auto"
            : "h-[calc(100dvh-70px)] pb-0 overflow-y-auto"
        } 
         overflow-y-auto playlist-scroll`}
      >
        <div className="">
          <div className="">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="">
                {displayTasks.length > 0 ? (
                  <div className="space-y-2.5">
                    {displayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 bg-white rounded-lg side_focus_color
                        ${
                          task.task_status === "todo"
                            ? "border-l-[4px] border-reddish"
                            : task.task_status === "In progress"
                            ? "border-l-[4px] border-[#EEA15A]"
                            : task.task_status === "Internal feedback"
                            ? "border-l-[4px] border-[#142D57]"
                            : "border-l-[4px] border-[#3FAD51]"
                        }
                      `}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 mt-2 text-sm text-zinc400">
                            <Calendar className="text-zinc400" size={18} />
                            <p>Created: {task.time}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p
                              className={`capitalize text-xs font-semibold px-2 py-1 my-auto rounded-full w-auto border-none ${
                                task.priority?.toLocaleLowerCase() === "low"
                                  ? "text-[#142D57] bg-[#DEE9FC]"
                                  : task.priority?.toLocaleLowerCase() ===
                                    "high"
                                  ? "text-[#C81E1E] bg-[#F8DADA]"
                                  : task.priority?.toLocaleLowerCase() ===
                                      "medium" && "text-[#da8537] bg-[#F8F0DA]"
                              }`}
                            >
                              {task.priority}
                            </p>
                            {(loggedUserData?.role === "owner" ||
                              (loggedUserData?.role === "User" &&
                                ((loggedUserData?.access?.task !== true &&
                                  loggedUserData?.access?.all === true) ||
                                  loggedUserData?.access?.task === true))) && (
                              <div className="flex items-center gap-2">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <Ellipsis size={16} />
                                      <span className="sr-only">
                                        More options
                                      </span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => handleEditTask(task, e)}
                                    >
                                      <Pencil size={16} className="mr-2" />
                                      Edit Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => handleDeleteTask(task, e)}
                                    >
                                      <Trash2 size={16} className="mr-2" />
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                            {currentDeleteTask && (
                              <DeleteSpaceDialog
                                open={deleteTaskModalOpen}
                                onOpenChange={setDeleteTaskModalOpen}
                                space={currentDeleteTask}
                                teams={getTeamsBySpaceId(currentDeleteTask.id)}
                                onUpdate={fetchAllTasks}
                                deleteTeam={false}
                                deleteTask={true}
                              />
                            )}
                          </div>
                        </div>

                        {isEditTask.isEditTask && isEditTask.id === task.id ? (
                          <NewReactMentions
                            selectedTeam={selectedTeam}
                            selectedSpaceId={selectedSpaceId}
                            selectedTeamId={selectedTeamId}
                            editTask={true}
                            isEditTask={isEditTask}
                            setIsEditTask={setIsEditTask}
                            currentTask={currentTask}
                            classname="input_mention"
                            // memberId={memberId}
                            // memberTeamsAndSpaces={memberTeamsAndSpaces}
                            spaces={spaces}
                            teams={teams}
                            members={members}
                            selectedUserId={selectedUserId}
                            selectedMember={selectedMember}
                            kanbanView={false}
                            setIsDialogOpen={''}
                          />
                        ) : (
                          <p className="text-sm font-medium text-zinc-950 mt-1">
                            {task.mentions && (
                              <span className="text-blue-700">
                                {task.mentions}
                              </span>
                            )}{" "}
                            {task.task_content}
                          </p>
                        )}
                        {(!isEditTask.isEditTask ||
                          isEditTask.id !== task.id) && (
                          <div className="flex justify-between items-center gap-1">
                            <div className="flex justify-between items-center gap-1 mt-2 text-sm text-zinc400">
                              <Timer className="text-zinc400" size={18} />
                              {task.due_date && (
                                <span className="">
                                  Due:{" "}
                                  {new Date(task.due_date)
                                    .toDateString()
                                    .slice(4, 15) +
                                    " " +
                                    new Date(task.due_date).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      }
                                    )}
                                </span>
                              )}
                              {getDaysOverdue(task.due_date || "") > 0 && (
                                <p className="text-xs font-bold px-2 py-0.5 my-auto rounded-full w-auto border-none text-white bg-[#F05252]">
                                  {getDaysOverdue(task.due_date || "")} days
                                  overdue
                                </p>
                              )}
                            </div>
                            <Select
                              defaultValue={task.task_status}
                              onValueChange={async (value) => {
                                const { data, error } = await supabase
                                  .from("tasks")
                                  .update({ task_status: value })
                                  .eq("id", task.id)
                                  // .eq("team_id", team.id)
                                  .single();
                                if (error) {
                                  console.error(
                                    "Error updating task status:",
                                    error
                                  );
                                }
                                fetchAllTasks();
                              }}
                            >
                              <SelectTrigger
                                className={`w-[140px] pt-2 pr-[10px] text-sm border-none font-medium text-center justify-center rounded-[30px] ${
                                  task.task_status === "todo"
                                    ? "text-[#C81E1E] bg-[#F8DADA]"
                                    : task.task_status === "In progress"
                                    ? "text-[#EEA15A] bg-[#F8F0DA]"
                                    : task.task_status === "Internal feedback"
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
                                {loggedUserData?.role === "owner" && (
                                  <SelectItem value="Completed">
                                    Completed
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-center h-[60dvh]">
                    <div className="flex flex-col h-full items-center justify-center space-y-3">
                      <svg
                        className="w-10 h-10 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.75 9.75h.008v.008H9.75V9.75zm4.5 0h.008v.008h-.008V9.75zm-4.5 4.5h.008v.008H9.75v-.008zm4.5 0h.008v.008h-.008v-.008zM12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm font-medium">
                        {selectedSpaceId && selectedTeamId
                          ? "No tasks found for this team"
                          : selectedUserId
                          ? "No tasks assigned to this user"
                          : "No tasks found"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {(loggedUserData?.role === "owner" ||
        (loggedUserData?.role === "User" &&
          ((loggedUserData?.access?.task !== true &&
            loggedUserData?.access?.all === true) ||
            loggedUserData?.access?.task === true))) && (
        <div className="pt-4">
          <NewReactMentions
            selectedTeam={selectedTeam}
            selectedSpaceId={selectedSpaceId}
            selectedTeamId={selectedTeamId}
            editTask={false}
            isEditTask={false}
            setIsEditTask={setIsEditTask}
            classname="create_task_mention"
            // memberId={memberId}
            // memberTeamsAndSpaces={memberTeamsAndSpaces}
            spaces={spaces}
            teams={teams}
            members={members}
            selectedUserId={selectedUserId}
            selectedMember={selectedMember}
            kanbanView={false}
            setIsDialogOpen={''}
          />
        </div>
      )}
    </div>
  );
};

export default ChatLeftSpace;
