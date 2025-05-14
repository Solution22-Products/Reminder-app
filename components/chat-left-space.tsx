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

  const { filteredTasks, fetchAllTasks, searchTerm, searchTasks, userId } =
    useGlobalContext();

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
  };

  const handleDeleteTask = async (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDeleteTask(task);
    setDeleteTaskModalOpen(true);
  };

  const getDaysOverdue = (dueDate : string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = differenceInCalendarDays(today, due);
    return diff > 0 ? diff : 0;
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
      />

      {/* Scrollable Content */}
      <div className="p-3.5 pb-20 w-full h-[calc(100dvh-155px)] overflow-y-auto">
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
                  <div className="space-y-3">
                    {displayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 bg-gray-50 rounded-lg shadow-sm border-b
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
                          <div className="flex items-center gap-1 mt-2 text-sm text-zinc-400">
                            <Calendar className="text-zinc-400" size={18} />
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
                        {!isEditTask.isEditTask && (
                          <div className="flex justify-between items-center gap-1">
                            <div className="flex justify-between items-center gap-1 mt-2 text-sm text-zinc-400">
                              <Timer className="text-zinc-400" size={18} />
                              {task.due_date && (
                                <p className="capitalize">
                                  Due: {task.due_date}
                                </p>
                              )}
                              {
                                getDaysOverdue(task.due_date || "") > 0 && (
                                  <p className="capitalize text-xs font-bold px-2 py-0.5 my-auto rounded-full w-auto border-none text-white bg-[#F05252]">
                                    {getDaysOverdue(task.due_date || "")}{" "}
                                    days overdue
                                  </p>
                                )
                              }
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
                                {userId?.role === "owner" && (
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
            )}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <NewReactMentions
          selectedTeam={selectedTeam}
          selectedSpaceId={selectedSpaceId}
          selectedTeamId={selectedTeamId}
          editTask={false}
          isEditTask={false}
          setIsEditTask={setIsEditTask}
          classname="create_task_mention"
        />
      </div>
    </div>
  );
};

export default ChatLeftSpace;
