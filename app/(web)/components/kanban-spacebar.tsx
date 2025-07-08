"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { useGlobalContext } from "@/context/store";
import CreateSpaceAndTeam from "@/components/createSpaceAndTeam";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  MoreVertical,
  Pencil,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import EditSpaceDialog from "@/components/editSpaceDialog";
import DeleteSpaceDialog from "@/components/deleteSpaceDialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/utils/supabase/supabaseClient";
import NewReactMentions from "@/components/new-react-mentions";
import { differenceInCalendarDays } from "date-fns";
import AddTaskModal from "./addTaskModal";
import Notification from "./notificationComp";

interface NavbarProps {
  spaces: any[];
  selectedSpaceId?: string | null;
  onSpaceSelect?: (spaceId: string) => void;
  teams: any[];
  members: any[];
  fetchData: () => Promise<void>;
}

const KanbanSpacebar = ({
  spaces,
  selectedSpaceId,
  onSpaceSelect,
  teams,
  members,
  fetchData,
}: NavbarProps) => {
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(
    selectedSpaceId || null
  );
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const {
    fetchAllTasks,
    userId: loggedUserData,
    filteredTasks,
    setKanbanTasks,
  } = useGlobalContext();

  // Existing states
  const [spaceTrigger, setSpaceTrigger] = useState(false);
  const [currentEditSpace, setCurrentEditSpace] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentDeleteSpace, setCurrentDeleteSpace] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [isEditTask, setIsEditTask] = useState({
    id: "",
    isEditTask: false,
  });
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [currentDeleteTask, setCurrentDeleteTask] = useState<any>(null);
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);

  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [currentEditTeam, setCurrentEditTeam] = useState<any>(null);
  const [addedMembers, setAddedMembers] = useState<any[]>([]);
  const [currentDeleteTeam, setCurrentDeleteTeam] = useState<any>(null);
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const getTeamsBySpaceId = (spaceId: string) => {
    return teams.filter((team) => team.space_id === spaceId);
  };

  const getTasksByTeamId = (teamId: string): any[] => {
    return filteredTasks.filter((task: any) => task.team_id === teamId);
  };

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
        setAddedMembers(data.members);
        return data;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleEditTeam = (team: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEditTeam(team);
    setEditTeamDialogOpen(true);
    setAddedMembers([]);
    getTeamData(team.id);
  };

  const handleDeleteTeam = async (team: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDeleteTeam(team);
    setDeleteTeamDialogOpen(true);
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = differenceInCalendarDays(today, due);
    return diff > 0 ? diff : 0;
  };

  const handleSpaceClick = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    setSelectedTeamId(null); // Reset team selection when space changes
    if (onSpaceSelect) {
      onSpaceSelect(spaceId);
    }
  };

  const handleEditSpace = (space: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEditSpace(space);
    setEditDialogOpen(true);
  };

  const handleDeleteSpace = async (space: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDeleteSpace(space);
    setDeleteDialogOpen(true);
  };

  const currentSpaceTeams = activeSpaceId
    ? getTeamsBySpaceId(activeSpaceId)
    : [];

  useEffect(() => {
    setActiveSpaceId(
      selectedSpaceId || (spaces.length > 0 ? spaces[0].id : null)
    );
    setKanbanTasks(false);
  }, [selectedSpaceId, spaces]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Initial check
      checkScrollButtons();

      // Add event listener for scroll
      container.addEventListener("scroll", checkScrollButtons);

      // Add event listener for resize
      window.addEventListener("resize", checkScrollButtons);

      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, []);

  // Check scroll buttons when spaces change
  useEffect(() => {
    const timer = setTimeout(checkScrollButtons, 100);
    return () => clearTimeout(timer);
  }, [spaces]);

  const hasPermission =
    loggedUserData?.role === "owner" ||
    (loggedUserData?.role === "User" &&
      ((loggedUserData?.access?.space !== true &&
        loggedUserData?.access?.all === true) ||
        loggedUserData?.access?.space === true));

  return (
    <>
      <div className="flex items-center justify-between p-3 gap-3 w-full">
        {/* Space Navigation Area - 80% */}
        {activeSpaceId && (
          <div className="w-[80%] flex items-center gap-2">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`h-11 w-8 flex-shrink-0 ${
                !canScrollLeft ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ChevronLeft size={16} />
              <span className="sr-only">Previous spaces</span>
            </Button>

            {/* Scrollable Spaces Container */}
            <div className="flex-1 relative overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="flex items-center overflow-x-auto bg-[#E2E8F0] p-1 rounded-sm no-scrollbar"
                style={{ scrollbarWidth: "none" }}
              >
                {spaces.length > 0 &&
                  spaces.map((space) => (
                    <div
                      key={space.id}
                      onClick={() => handleSpaceClick(space.id)}
                      className={`flex items-center capitalize gap-1 px-3 py-1 cursor-pointer text-sm whitespace-nowrap rounded-sm flex-shrink-0 ${
                        activeSpaceId === space.id
                          ? "bg-white text-zinc-950 font-medium"
                          : "text-[#606267]"
                      }`}
                    >
                      {space.display ? (
                        <>
                          {space.display.length > 18 ? (
                            <p>{space.display.slice(0, 18) + "..."}</p>
                          ) : (
                            <p>{space.display}</p>
                          )}
                        </>
                      ) : (
                        <>
                          {space.space_name.length > 15 ? (
                            <p>{space.space_name.slice(0, 15) + "..."}</p>
                          ) : (
                            <p>{space.space_name}</p>
                          )}
                        </>
                      )}
                      {hasPermission && (
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-6 w-6 ${
                                  activeSpaceId === space.id
                                    ? "block"
                                    : "hidden"
                                }`}
                              >
                                <MoreVertical size={14} />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => handleEditSpace(space, e)}
                              >
                                <Pencil size={16} className="mr-2" />
                                Edit Space
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => handleDeleteSpace(space, e)}
                              >
                                <Trash2 size={16} className="mr-2" />
                                Delete Space
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`h-11 w-8 flex-shrink-0 ${
                !canScrollRight ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ChevronRight size={16} />
              <span className="sr-only">Next spaces</span>
            </Button>
          </div>
        )}

        {/* Create Space Button Area - 20% */}
        {hasPermission && (
          <div className="w-[20%] flex justify-end">
            <CreateSpaceAndTeam
              spaceTrigger={spaceTrigger}
              setSpaceTrigger={setSpaceTrigger}
            />
          </div>
        )}

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>

      {/* Filter, Search, and Sort Controls */}

      {/* Teams and Tasks Display */}
      <div className="px-3">
        {!activeSpaceId ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Please select a space to view teams and tasks
            </p>
          </div>
        ) : currentSpaceTeams.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No teams found for this space</p>
            <Button variant="outline" className="gap-2">
              <Plus size={16} />
              Create Team
            </Button>
          </div>
        ) : (
          <Carousel
            opts={{ align: "start" }}
            className="w-full"
            style={{ height: "calc(100dvh - 200px)" }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {currentSpaceTeams.map((team) => {
                const teamTasks = getTasksByTeamId(team.id);
                // const isTeamSelected = selectedTeamId === team.id
                // const showTeam = !selectedTeamId || isTeamSelected

                // if (!showTeam) return null

                return (
                  <CarouselItem
                    key={team.id}
                    className="pl-2 md:pl-4 basis-[35%] h-full"
                  >
                    <Card className={`h-full flex flex-col bg-[#E2E8F0]`}>
                      <CardHeader className="pb-3 pt-3 pl-2.5 flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold capitalize">
                              {team.team_name}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* <Button
                              variant={isTeamSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTeamId(isTeamSelected ? null : team.id)}
                            >
                              {isTeamSelected ? "Deselect" : "Select"}
                            </Button> */}
                            {(loggedUserData?.role === "owner" ||
                              (loggedUserData?.role === "User" &&
                                ((loggedUserData?.access?.team !== true &&
                                  loggedUserData?.access?.all === true) ||
                                  loggedUserData?.access?.team === true))) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => handleEditTeam(team, e)}
                                  >
                                    <Pencil size={16} className="mr-2" />
                                    Edit Team
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => handleDeleteTeam(team, e)}
                                  >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete Team
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-y-auto bg-white p-3 rounded-b-xl">
                        {(loggedUserData?.role === "owner" ||
                          (loggedUserData?.role === "User" &&
                            ((loggedUserData?.access?.task !== true &&
                              loggedUserData?.access?.all === true) ||
                              loggedUserData?.access?.task === true))) && (
                          <AddTaskModal
                            selectedTeam={team}
                            selectedSpaceId={activeSpaceId}
                            selectedTeamId={team.id}
                            spaces={spaces}
                            teams={teams}
                            members={members}
                          />
                        )}

                        {teamTasks.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500 mb-3">
                              {selectedTeamId
                                ? "No tasks match current filters"
                                : "No tasks assigned yet"}
                            </p>
                          </div>
                        ) : (
                          <div
                            className="space-y-3 overflow-y-auto playlist-scroll"
                            style={{
                              height:
                                loggedUserData?.role === "owner" ||
                                (loggedUserData?.role === "User" &&
                                  ((loggedUserData?.access?.task !== true &&
                                    loggedUserData?.access?.all === true) ||
                                    loggedUserData?.access?.task === true))
                                  ? "calc(100dvh - 289px)"
                                  : "calc(100dvh - 232px)",
                            }}
                          >
                            {teamTasks.map((task) => (
                              <div
                                key={task.id}
                                className={`p-3 bg-white rounded-lg side_focus_color
                        ${
                          task.task_status === "todo"
                            ? "border-l-[4px] border-red-500"
                            : task.task_status === "In progress"
                            ? "border-l-[4px] border-[#EEA15A]"
                            : task.task_status === "Internal feedback"
                            ? "border-l-[4px] border-[#142D57]"
                            : "border-l-[4px] border-[#3FAD51]"
                        }
                      `}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                                    <Calendar
                                      className="text-gray-500"
                                      size={18}
                                    />
                                    <p>Created: {task.time}</p>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <p
                                      className={`capitalize text-xs font-semibold px-2 py-1 my-auto rounded-full w-auto border-none ${
                                        task.priority?.toLowerCase() === "low"
                                          ? "text-[#142D57] bg-[#DEE9FC]"
                                          : task.priority?.toLowerCase() ===
                                            "high"
                                          ? "text-[#C81E1E] bg-[#F8DADA]"
                                          : task.priority?.toLowerCase() ===
                                              "medium" &&
                                            "text-[#da8537] bg-[#F8F0DA]"
                                      }`}
                                    >
                                      {task.priority}
                                    </p>
                                    {(loggedUserData?.role === "owner" ||
                                      (loggedUserData?.role === "User" &&
                                        ((loggedUserData?.access?.task !==
                                          true &&
                                          loggedUserData?.access?.all ===
                                            true) ||
                                          loggedUserData?.access?.task ===
                                            true))) && (
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
                                              onClick={(e) =>
                                                handleEditTask(task, e)
                                              }
                                            >
                                              <Pencil
                                                size={16}
                                                className="mr-2"
                                              />
                                              Edit Task
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={(e) =>
                                                handleDeleteTask(task, e)
                                              }
                                            >
                                              <Trash2
                                                size={16}
                                                className="mr-2"
                                              />
                                              Delete Task
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {isEditTask.isEditTask &&
                                isEditTask.id === task.id ? (
                                  <NewReactMentions
                                    selectedTeam={team.team_name}
                                    selectedSpaceId={
                                      selectedSpaceId as string | null
                                    }
                                    selectedTeamId={team.id}
                                    editTask={true}
                                    isEditTask={isEditTask}
                                    setIsEditTask={setIsEditTask}
                                    currentTask={currentTask}
                                    classname="input_mention"
                                    spaces={spaces}
                                    teams={teams}
                                    members={members}
                                    selectedUserId={""}
                                    selectedMember={""}
                                    kanbanView={true}
                                    setIsDialogOpen={""}
                                  />
                                ) : (
                                  <p className="text-sm font-medium text-zinc-950 mt-1 py-2">
                                    {task.mentions && (
                                      <span className="text-blue-700 font-bold">
                                        {task.mentions}
                                      </span>
                                    )}{" "}
                                    {task.task_content}
                                  </p>
                                )}
                                {(!isEditTask.isEditTask ||
                                  isEditTask.id !== task.id) && (
                                  <div className="flex justify-between items-center gap-1">
                                    <div className="flex flex-col items-start gap-1.5 mt-2 text-sm text-gray-500">
                                      <div className="flex justify-between items-center gap-1">
                                        <Timer
                                          className="text-gray-500"
                                          size={18}
                                        />
                                        {task.due_date && (
                                          <span className="">
                                            Due:{" "}
                                            {new Date(task.due_date)
                                              .toDateString()
                                              .slice(4, 15) +
                                              " " +
                                              new Date(
                                                task.due_date
                                              ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                              })}
                                          </span>
                                        )}
                                      </div>
                                      {getDaysOverdue(task.due_date || "") >
                                        0 && (
                                        <p className="text-xs font-bold px-2 py-0.5 my-auto rounded-full w-auto border-none text-white bg-[#F05252]">
                                          {getDaysOverdue(task.due_date || "")}{" "}
                                          days overdue
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
                        )}
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        )}
      </div>

      {/* Dialogs */}
      {currentEditSpace && (
        <EditSpaceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          space={currentEditSpace}
          teams={getTeamsBySpaceId(currentEditSpace.id)}
          onUpdate={fetchData}
          editTeam={false}
          addedMembers={[]}
          setAddedMembers={() => {}}
        />
      )}
      {currentDeleteSpace && (
        <DeleteSpaceDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          space={currentDeleteSpace}
          teams={getTeamsBySpaceId(currentDeleteSpace.id)}
          onUpdate={fetchData}
          deleteTeam={false}
          deleteTask={false}
        />
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
      {currentEditTeam && (
        <EditSpaceDialog
          open={editTeamDialogOpen}
          onOpenChange={setEditTeamDialogOpen}
          space={currentEditTeam}
          teams={getTeamsBySpaceId(currentEditTeam.id)}
          onUpdate={fetchData}
          editTeam={true}
          addedMembers={addedMembers}
          setAddedMembers={setAddedMembers}
        />
      )}
      {currentDeleteTeam && (
        <DeleteSpaceDialog
          open={deleteTeamDialogOpen}
          onOpenChange={setDeleteTeamDialogOpen}
          space={currentDeleteTeam}
          teams={getTeamsBySpaceId(currentDeleteTeam.id)}
          onUpdate={fetchData}
          deleteTeam={true}
          deleteTask={false}
        />
      )}
    </>
  );
};

export default KanbanSpacebar;
