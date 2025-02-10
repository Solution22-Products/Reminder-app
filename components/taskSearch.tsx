
// import { Trash2, X} from "lucide-react";
// import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet";
// import { DrawerContent, DrawerHeader, DrawerTitle ,Drawer} from "./ui/drawer";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
// import { FiSearch } from "react-icons/fi";
// import { Input } from "./ui/input";
// import { OverdueListSkeleton } from "@/app/(web)/components/skeleton-ui";
// import { Button } from "./ui/button";
// import { useState } from "react";

// interface TasksSearchProps{
// userTasks:any;

// }

// const TaskSearch:React.FC<TasksSearchProps> = ({userTasks}) => {
//     const [date, setDate] = useState<Date | null>(null);
//     const [taskLoading, setTaskLoading] = useState<boolean>(false);
//     const [swipedTasks, setSwipedTasks] = useState<any>({});

//     const [taskStatus, setTaskStatus] = useState<string>("todo");
//     const [openTaskId, setOpenTaskId] = useState<any>(null);
//     const [searchTasks, setSearchTasks] = useState("");
//     const [filteredTasksBySearch, setFilteredTasksBySearch] = useState<any[]>([]);
//     const handleSearchByTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const value = event.target.value.toLowerCase();
//         setSearchTasks(value);
    
//         if (!value.trim()) {
//           // If input is empty, don't show tasks
//           setFilteredTasksBySearch([]);
//           return;
//         }
    
//         // Filter tasks based on role
//         const filtered = userTasks.filter((task: any) => {
//           const isTeamMatch = selectedTeam?.id === task.team_id;
//           const hasMentionMatch = task.mentions.some((mention: string) =>
//             mention.toLowerCase().includes(value)
//           );
    
//           if (userId?.role === "owner") {
//             return isTeamMatch && hasMentionMatch; // Owner: all tasks in the team with matching mentions
//           } else {
//             const isUserMentioned = task.mentions.includes(
//               `@${userId?.entity_name}`
//             );
//             return isTeamMatch && isUserMentioned && hasMentionMatch; // User: Only their own tasks
//           }
//         });
    
//         setFilteredTasksBySearch(filtered);
//       };

//     return (

//         <div className="w-10 h-10">
//               <Sheet>
//                 <SheetTrigger>
//                   <FiSearch className="absolute mt-3 ml-[12px] text-zinc-500" />
//                   <input
//                     type="text"
//                     className="w-10 h-10 justify-center items-center gap-[6px] rounded-lg border border-zinc-300 bg-white"
//                   />
//                 </SheetTrigger>
//                 <SheetContent className="w-full bg-mobbg p-4  flex flex-col">
//                   {/* Search Input */}
//                   <div className="relative w-[90%]">
//                     <FiSearch className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
//                     <Input
//                       placeholder="Search ..."
//                       value={searchTasks}
//                       onChange={handleSearchByTasks}
//                       className="rounded-[10px] bg-white h-10 pl-10 w-full border-[#D4D4D8]"
//                     />
//                     <X
//                       size={14}
//                       className="absolute right-3 top-3 cursor-pointer w-4 h-5 text-zinc-500"
//                       onClick={() => {
//                         setSearchTasks("");
//                         setFilteredTasksBySearch([]);
//                       }}
//                     />
//                   </div>

//                   {/* Filtered Tasks List */}
//                   <div className="mt-4 w-full flex-1 h-[60vh] overflow-y-auto playlist-scroll">
//                     {taskLoading ? (
//                       <OverdueListSkeleton />
//                     ) : filteredTasksBySearch.length === 0 ? (
//                       <div className="w-full h-full flex justify-center items-center">
//                         <p className="text-[#A6A6A7] text-lg font-medium">
//                           No Task Found
//                         </p>
//                       </div>
//                     ) : (
//                       filteredTasksBySearch.map((task: any, index: number) => (
//                         <div
//                           key={task.id}
//                           className="relative"
//                           {...(userId?.role === "owner" && {
//                             onTouchStart: (e) => {
//                               const startX = e.touches[0].clientX;
//                               const handleTouchMove = (
//                                 moveEvent: TouchEvent
//                               ) => {
//                                 const endX = moveEvent.touches[0].clientX;
//                                 if (startX - endX > 50) {
//                                   handleSwipe(task.id, "left"); // Swipe left
//                                   document.removeEventListener(
//                                     "touchmove",
//                                     handleTouchMove
//                                   );
//                                 } else if (endX - startX > 50) {
//                                   handleSwipe(task.id, "right"); // Swipe right
//                                   document.removeEventListener(
//                                     "touchmove",
//                                     handleTouchMove
//                                   );
//                                 }
//                               };
//                               document.addEventListener(
//                                 "touchmove",
//                                 handleTouchMove
//                               );
//                             },
//                           })}
//                         >
//                           {/* Task Card */}
//                           <div
//                             onClick={() => setOpenTaskId(task.id)}
//                             className={`p-3 w-full bg-white border border-[#E1E1E1] mb-3 rounded-[10px] cursor-pointer transition-transform duration-300 ${
//                               swipedTasks[task.id]
//                                 ? "-translate-x-32"
//                                 : "translate-x-0"
//                             }`}
//                           >
//                             <div className="w-full">
//                               <div className="flex justify-between items-center">
//                                 <p className="text-[12px] text-[#A6A6A7] font-medium">
//                                   {task.time}
//                                 </p>
//                               </div>
//                               <p className="text-black mt-2 text-sm">
//                                 <span className="font-semibold inline-block">
//                                   {task.mentions}
//                                 </span>{" "}
//                                 {task.task_content}
//                               </p>
//                             </div>
//                             <div className="flex justify-between items-center mt-3">
//                               <span className="text-red-500 font-bold text-[12px]">
//                                 {new Date(task.due_date).toLocaleDateString(
//                                   "en-US",
//                                   {
//                                     year: "numeric",
//                                     month: "short",
//                                     day: "numeric",
//                                   }
//                                 )}
//                               </span>
//                               <span
//                                 className={`rounded-3xl text-sm font-semibold py-1.5 px-2 ${
//                                   task.task_status === "todo"
//                                     ? "text-reddish bg-[#F8DADA]"
//                                     : task.task_status === "In progress"
//                                     ? "text-[#EEA15A] bg-[#F8F0DA]"
//                                     : task.task_status === "feedback"
//                                     ? "text-[#142D57] bg-[#DEE9FC]"
//                                     : "text-[#3FAD51] bg-[#E5F8DA]"
//                                 }`}
//                               >
//                                 {task.task_status}
//                               </span>
//                             </div>
//                           </div>

//                           {/* Swipe Actions (Only visible when swiped & owner) */}
//                           {userId?.role === "owner" && swipedTasks[task.id] && (
//                             <div
//                               className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center space-x-2 
//             z-50 transition-all duration-300"
//                             >
//                               <button
//                                 className="bg-green-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center cursor-pointer"
//                                 onClick={() => handleCompleteTask(task.id)}
//                               >
//                                 <Check className="w-6 h-6" />
//                               </button>

//                               <button
//                                 className="bg-red-500 text-white h-[46px] w-[46px] rounded-full flex items-center justify-center"
//                                 onClick={() =>
//                                   handleDeleteTask(task.id, task.team_id)
//                                 }
//                               >
//                                 <Trash2 className="w-6 h-6" />
//                               </button>
//                             </div>
//                           )}

//                           {/* Task Drawer (Edit Task) */}
//                           {openTaskId === task.id && (
//                             <Drawer
//                               open={openTaskId !== null}
//                               onOpenChange={() => setOpenTaskId(null)}
//                             >
//                               <DrawerContent className="px-4">
//                                 <DrawerHeader className="flex justify-between items-center px-0">
//                                   <DrawerTitle>Edit Task</DrawerTitle>
//                                   <Select
//                                     defaultValue={task.task_status}
//                                     onValueChange={(value) =>
//                                       setTaskStatus(value)
//                                     }
//                                   >
//                                     <SelectTrigger
//                                       className={`w-[120px] pt-2 pr-[10px] text-center justify-center rounded-[30px] border-none ${
//                                         task.task_status === "todo"
//                                           ? "text-reddish bg-[#F8DADA]"
//                                           : task.task_status === "In progress"
//                                           ? "text-[#EEA15A] bg-[#F8F0DA]"
//                                           : "text-[#142D57] bg-[#DEE9FC]"
//                                       }`}
//                                     >
//                                       <SelectValue placeholder="status" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                       <SelectItem value="todo">
//                                         To Do
//                                       </SelectItem>
//                                       <SelectItem value="In progress">
//                                         In Progress
//                                       </SelectItem>
//                                       <SelectItem value="feedback">
//                                         Feedback
//                                       </SelectItem>
//                                     </SelectContent>
//                                   </Select>
//                                 </DrawerHeader>

//                                 {/* Task Details */}
//                                 <div className="p-4 border border-[#CECECE] rounded-[10px]">
//                                   <p>
//                                     <span className="text-[#BA6A6A]">
//                                       @{selectedSpace?.space_name}
//                                     </span>{" "}
//                                     <span className="text-[#5898C6]">
//                                       @{selectedTeam?.team_name}
//                                     </span>{" "}
//                                     <span className="text-[#518A37]">
//                                       {task.mentions}
//                                     </span>{" "}
//                                     {task.task_content}
//                                   </p>
//                                 </div>

//                                 {/* Task Actions */}
//                                 <div className="w-full flex items-center gap-3 mt-5 mb-8">
//                                   <Popover>
//                                     <PopoverTrigger asChild>
//                                       <Button 
//                                         variant={"outline"}
//                                         className="w-1/2 justify-center text-left font-normal"
//                                       >
//                                         {date ? (
//                                           format(date, "PPP")
//                                         ) : (
//                                           <span>{task.due_date}</span>
//                                         )}
//                                       </Button>
//                                     </PopoverTrigger>
//                                     <PopoverContent
//                                       className="w-auto p-0"
//                                       align="start"
//                                     >
//                                       <Calendar
//                                         mode="single"
//                                         selected={date}
//                                         onSelect={setDate}
//                                         initialFocus
//                                       />
//                                     </PopoverContent>
//                                   </Popover>
//                                   <Button
//                                     className="bg-[#1A56DB] text-white hover:bg-[#1A56DB] font-medium text-sm text-center shadow-none w-1/2 rounded-[10px]"
//                                     onClick={() =>
//                                       handleUpdateTask(task.id, taskStatus)
//                                     }
//                                   >
//                                     Update
//                                   </Button>
//                                 </div>
//                               </DrawerContent>
//                             </Drawer>
//                           )}
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </SheetContent>
//               </Sheet>
//             </div>
//     )
// }
// export default TaskSearch;