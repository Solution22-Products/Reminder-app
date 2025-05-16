"use client";
import { Check, Trash2, X } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
import { DrawerContent, DrawerHeader, DrawerTitle, Drawer } from "./ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { FiSearch } from "react-icons/fi";
import { Input } from "./ui/input";
import { OverdueListSkeleton } from "@/app/(web)/components/skeleton-ui";
import { Button } from "./ui/button";
import { useState,useEffect } from "react";
import { useGlobalContext } from "@/context/store";
import { Calendar, Calendar as CustomCalendar } from "@/components/ui/calendar";
import { format, subDays, addDays } from "date-fns";
import { supabase } from "@/utils/supabase/supabaseClient";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { MentionsInput, Mention } from "react-mentions";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


interface TasksSearchProps {
  userTasks: any;
  userIdRole: string;
  // selectedTeam: any;
  teamId:any;
}
interface MentionData {
    id: number;
    display: string;
  }

const TaskSearch: React.FC<TasksSearchProps> = ({ userTasks, userIdRole, teamId }) => {
  const { userId } = useGlobalContext();
  const [date, setDate] = useState<Date | null>();
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const [swipedTasks, setSwipedTasks] = useState<any>({});

  const [taskStatus, setTaskStatus] = useState<string>("todo");
  const [openTaskId, setOpenTaskId] = useState<any>(null);
  const [searchTasks, setSearchTasks] = useState("");
  const [filteredTasksBySearch, setFilteredTasksBySearch] = useState<any[]>([]);
  const [editTaskInputValue, setEditTaskInputValue] = useState<string>("");
   const [employees, setEmployees] = useState<MentionData[]>([]);
   const [memberData, setMemberData] = useState<string[]>([]);
   const[tasks,setTasks]=useState<any>([]); 
   const[isDialogOpen,setIsDialogOpen]  = useState(false);

   const fetchData = async () => {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false);
  
    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }
    console.log("update done")
    // setTasks(tasks || []);
  };
  
  
  const handleSearchByTasks = (e: any) => {
    let searchValue = e.target.value.replace(/ /g, "_"); // Convert spaces to underscores
    setSearchTasks(searchValue);
  
    if (!searchValue.trim()) {
      setFilteredTasksBySearch([]);
      return;
    }
  
    const filtered = userTasks.filter((task: any) => {
      const taskContentMatch = task.task_content
        .toLowerCase()
        .includes(searchValue.toLowerCase());
  
      const mentionsMatch = Array.isArray(task.mentions)
        ? task.mentions.some((mention: string) =>
            mention.toLowerCase().includes(searchValue.toLowerCase())
          )
        : task.mentions?.toLowerCase().includes(searchValue.toLowerCase());
  
      return taskContentMatch || mentionsMatch;
    });
  
    setFilteredTasksBySearch(filtered);
  };
  
  const handleCompleteTask = async (id: number) => {
    try {
      // Fetch the task data
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .eq("is_deleted", false);

  //  setTasks((prev)=> prev.map((task)))

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
      setDate(null);
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
    setSwipedTasks((prev:any) => ({ ...prev, [id]: false })); // Close swipe
  };
  const handleDeleteTask = async (id: number, teamId: number) => {
    setSwipedTasks((prev:any) => ({ ...prev, [id]: false })); // Close swipe
    console.log("task deleted", id, teamId);
    const { data, error } = await supabase
      .from("tasks")
      .update({ is_deleted: true })
      .eq("team_id", teamId)
      .eq("id", id);
    if (error) throw error;

    fetchData();
    toast({
      title: "Deleted Successfully!",
      description: "Task deleted successfully!",
      action: (
        <Button
          variant="link"
          onClick={() => {
            fetchData();
          }}
        >
          Undo
        </Button>
      ),
    });
  };
  const handleSwipe = (taskId: number, direction: "left" | "right") => {
    setSwipedTasks((prev:any) => ({
      ...prev,
      [taskId]: direction === "left", // Swiped left means action buttons appear
    }));
  };
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
          setDate(null);
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
      const fetchTeamsAndTasks = async (teamId:any) => {
        try {
          const { data: teamData, error: teamError } = await supabase
            .from("teams")
            .select("members")
            .eq("id", teamId)
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
    
        fetchTeamsAndTasks(teamId);
      };
      const formatDate = (date: Date): string => {
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "short",
          day: "2-digit",
        };
    
        return date.toLocaleDateString("en-GB", options).replace(",", ""); // 'en-GB' gives the format "23 Aug 2024"
      };
      useEffect(() => {
        fetchData();
      }, [taskStatus]);
    

  return (
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
          {/* {userIdRole} */}

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
                {...((userId?.role === "owner" ||
                  (userId?.role === "User" &&
                    ((userId?.access?.task !== true &&
                      userId?.access?.all === true) ||
                      userId?.access?.task === true))) && {
                  onTouchStart: (e) => {
                    const startX = e.touches[0].clientX;
                    const handleTouchMove = (moveEvent: TouchEvent) => {
                      const endX = moveEvent.touches[0].clientX;
                      if (startX - endX > 50) {
                        handleSwipe(task.id, "left");
                        document.removeEventListener(
                          "touchmove",
                          handleTouchMove
                        );
                      } else if (endX - startX > 50) {
                        handleSwipe(task.id, "right");
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
                    if (
                      userId?.role === "owner" ||
                      (userId?.role === "User" &&
                        ((userId?.access?.task !== true &&
                          userId?.access?.all === true) ||
                          userId?.access?.task === true))
                    ) {
                      setOpenTaskId(task.id);
                      setEditTaskInputValue(
                        task.mentions
                          .map((mention: string) => `${mention}`)
                          .join(" ") +
                          " " +
                          task.task_content
                      );
                    }
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
                  <span
                      className={`font-bold text-[12px] ${
                        new Date(task.due_date) >= new Date()
                          ? "text-[#14B8A6]"
                          : "text-red-500"
                      }`}
                    >
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
                  {(userId?.role === "owner" ||
                  (userId?.role === "User" &&
                    ((userId?.access?.task !== true &&
                      userId?.access?.all === true) ||
                      userId?.access?.task === true))) &&
                  swipedTasks[task.id] && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center space-x-2 z-50 transition-all duration-300">
                      {/* Complete Button - Disabled if status is completed */}
                      {task.task_status !== "Completed" && (
                        <button
                          className="h-[46px] w-[46px] rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          <Check className="w-6 h-6" />
                        </button>
                      )}

                      {/* Delete Button */}
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <button
                            className="bg-red-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center"
                            onClick={() => setIsDialogOpen(true)}
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </DialogTrigger>

                        <DialogContent className="w-[80vw] max-w-sm px-6 py-4">
                          <DialogHeader className="p-0 text-left">
                            <DialogTitle className="text-lg font-semibold">
                              Delete Task
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 leading-6 mt-1">
                              Do you want to delete this task?
                            </DialogDescription>
                          </DialogHeader>

                          <div className="flex justify-start items-center w-full gap-4 mt-4">
                            <Button
                              variant="outline"
                              className="w-1/3"
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              className="bg-red-600 hover:bg-red-500 w-1/3"
                              onClick={() =>
                                handleDeleteTask(task.id, task.team_id)
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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
                          {userIdRole === "User" &&
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
                                {userIdRole == "owner" && (
                                  <SelectItem value="Completed">
                                    {" "}
                                    Completed
                                  </SelectItem>
                                )}
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
                                  onSelect={ setDate}
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
export default TaskSearch;
