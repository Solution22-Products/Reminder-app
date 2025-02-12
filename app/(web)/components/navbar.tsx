"use client";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, LogOut, Search, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { logout } from "@/app/(signin-setup)/logout/action";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import FilterComponent from "./filter";
import Notification from "./notificationComp";
// import FilterTeamSearch from "./filterTeamSearch";

interface loggedUserDataProps {
  loggedUserData: any;
  navbarItems: any;
  searchValue: any;
  setSearchValue: any;
  // teamFilterValue: any;
  setTeamFilterValue: any;
  // taskStatusFilterValue: any;
  setTaskStatusFilterValue: any;
  setDateFilterValue: any;
  filterFn: any;
  filterDialogOpen: any;
  setFilterDialogOpen: any;
  teamResetFn: any;
  notificationTrigger:any
  setNotificationTrigger:any
}

const WebNavbar: React.FC<loggedUserDataProps> = ({
  loggedUserData,
  navbarItems,
  searchValue,
  setSearchValue,
  // teamFilterValue,
  setTeamFilterValue,
  // taskStatusFilterValue,
  setTaskStatusFilterValue,
  setDateFilterValue,
  filterFn,
  filterDialogOpen,
  setFilterDialogOpen,
  teamResetFn,
  notificationTrigger,
  setNotificationTrigger
}) => {
  const route = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [selectOpen, setSelectOpen] = useState<boolean>(false);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [inprogressTasks, setInProgressTasks] = useState<number>(0);
  const [feedbackTasks, setFeedbackTasks] = useState<number>(0);
  const [taskDetails, setTaskDetails] = useState<any[]>([]);
  const[settingsLoader, setSettingsLoader] = useState(false);
  const[profileLoader, setProfileLoader] = useState(false);
  const entityName = loggedUserData?.entity_name || "Unknown Entity";

  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingOut(true); // Show loader when logging out
    await logout();
    setIsLoggingOut(false); // Hide loader after logout completes
  };

  const taskData = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false);
    if (error) {
      console.log(error);
    }

    if (data) {
      const includesTrueTasks = data.filter((task) =>
        task?.mentions?.includes(`@${loggedUserData?.entity_name}`)
      );

      setTaskDetails(includesTrueTasks);

      setInProgressTasks(
        data
          .map((task) => task.task_status)
          .filter((task) => task === "In progress").length
      );
      setFeedbackTasks(
        data
          .map((task) => task.task_status)
          .filter((task) => task === "Internal feedback").length
      );
      setTotalTasks(data.length);
    }
  };

  useEffect(() => {
    taskData();
  }, [totalTasks, inprogressTasks, feedbackTasks, entityName, notificationTrigger]);

  return (
    <>
      <div className="flex items-center justify-between w-full py-2 px-3">
        <Image
          src="/images/menu-top_bar.png"
          alt="Logo"
          width={84}
          height={44}
          className="w-[84px] h-[44px] cursor-pointer"
          onClick={() => route.push("/dashboard")}
        />

        <div className="flex items-center gap-2">
          {navbarItems && (
            <>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute top-3.5 left-2.5 text-gray-500"
                />
                <Input
                  // type="search"
                  placeholder="Search"
                  value={searchValue}
                  className="w-[384px] h-[42px] pl-8 pr-7 bg-white shadow-none font-medium justify-start gap-3 rounded-[10px] flex items-center "
                  onChange={(e)  => {setSearchValue(e.target.value)}}
                  // onFocus={() => setIsFocused(true)} // Set focus state to true
                  // onBlur={() => setIsFocused(false)} // Optional: Handle blur to close the page
                />
               
                <X
                  size={14}
                  className="absolute top-3.5 right-2.5 cursor-pointer"
                  onClick={() => setSearchValue("")}
                />
              </div>
              <FilterComponent
                // teamFilterValue={teamFilterValue}
                setTeamFilterValue={setTeamFilterValue}
                // taskStatusFilterValue={taskStatusFilterValue}
                setTaskStatusFilterValue={setTaskStatusFilterValue}
                setDateFilterValue={setDateFilterValue}
                filterFn={filterFn}
                loggedUserData={loggedUserData}
                filterDialogOpen={filterDialogOpen}
                setFilterDialogOpen={setFilterDialogOpen}
                teamResetFn={teamResetFn}
              />
              <div className="max-w-[300px] w-[273px] h-[42px] bg-white shadow-none pl-2 font-bold justify-start gap-3 rounded-[10px] flex items-center">
                <div className="w-full border-r border-zinc-300">
                  <p className="text-[8px]">Overall Task</p>
                  {loggedUserData?.role === "owner" ? (
                    <p className="text-sm font-bold text-red-500">
                      {totalTasks}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-red-500">
                      {taskDetails.length}
                    </p>
                  )}
                </div>
                <div className="w-full border-r border-zinc-300">
                  <p className="text-[8px]">In Progress</p>
                  {loggedUserData?.role === "owner" ? (
                    <p className="text-sm font-bold text-orange-500">
                      {inprogressTasks}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-orange-500">
                      {
                        taskDetails.filter(
                          (task) => task.task_status === "In progress"
                        ).length
                      }
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <p className="text-[8px]">Internal Feedback</p>
                  {loggedUserData?.role === "owner" ? (
                    <p className="text-sm font-bold text-green-500">
                      {feedbackTasks}
                    </p>
                  ) : (
                    <p className="text-sm font-bold text-green-500">
                      {
                        taskDetails.filter(
                          (task) => task.task_status === "Internal feedback"
                        ).length
                      }
                    </p>
                  )}
                </div>
              </div>
              <Notification
              notificationTrigger={notificationTrigger}
               />
            </>
          )}

          <Select open={selectOpen} onOpenChange={setSelectOpen}>
            <SelectTrigger className="w-[200px] h-[44px] bg-white focus-visible:border-none focus-visible:outline-none text-sm font-bold shadow-none pl-2 justify-start gap-1">
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Image
                    src={loggedUserData?.profile_image}
                    alt="Logo"
                    width={36}
                    height={36}
                    className="w-[32px] h-[32px] rounded-full"
                  />
                  <SelectValue
                    className=""
                    placeholder={
                      loggedUserData?.username.length > 14
                        ? loggedUserData?.username.slice(0, 14) + "..."
                        : loggedUserData?.username
                    }
                  />
                </div>
                <p>
                  <ChevronDown size={20} />
                </p>
              </div>
            </SelectTrigger>
            <SelectContent className="w-[200px] py-3">
              <div className="flex items-center justify-start gap-1.5 px-3">
                <Image
                  src={loggedUserData?.profile_image}
                  alt="Logo"
                  width={36}
                  height={36}
                  className="w-[32px] h-[32px] rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold">
                    {loggedUserData?.username.length > 16
                      ? loggedUserData?.username.slice(0, 16) + "..."
                      : loggedUserData?.username}
                  </p>
                  <p className="text-sm font-normal">
                    {loggedUserData?.email.length > 16
                      ? loggedUserData?.email.slice(0, 16) + "..."
                      : loggedUserData?.email}
                  </p>
                </div>
              </div>
              <div className="py-3 my-3 text-gray-700 border-t border-b border-gray-200 px-3 cursor-pointer">
                <p
                  onClick={() => {
                    setProfileLoader(true);
                    setTimeout(() => {
                      route.push("/user-profile");
                      setProfileLoader(false);
                    }, 1000);
                  }}
                  className={`text-sm font-normal ${
                    loggedUserData?.role === "owner" ? "pb-3" : "pb-0"
                  }`}
                >
                  {profileLoader ? (
                <svg
                className="animate-spin h-5 w-5 m-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#1A56DB"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-100"
                  fill="#1A56DB"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              ) : (
                "Your Profile"
              )}
                </p>
                {loggedUserData?.role === "owner" && (
                  <p
                    className="text-sm font-normal"
                    onClick={() => {
                      setSettingsLoader(true);
                      setTimeout(() => {
                        route.push("/spaceSetting");
                        setSettingsLoader(false);
                        setSelectOpen(false);
                      }, 1000);
                    }}
                    // disabled={settingsLoader}
                  >
                    {settingsLoader ? (
                <svg
                className="animate-spin h-5 w-5 m-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#1A56DB"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-100"
                  fill="#1A56DB"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              ) : (
                "Settings"
              )}
                  </p>
                )}
              </div>
              <form onSubmit={handleLogout} className="flex">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        typeof="submit"
                        className="rounded bg-button_orange text-white cursor-pointer hover:bg-button_orange relative"
                        style={isLoggingOut ? { pointerEvents: "none" } : {}}
                      >
                        {isLoggingOut ? (
                          <div className="ml-20 flex items-center justify-center text-center">
                            <svg
                              className="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="#1A56DB"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="#1A56DB"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </div>
                        ) : (
                          <p className="text-sm text-[#F05252] px-3 flex items-center gap-2 cursor-pointer">
                            <LogOut size={20} />
                            Sign Out
                          </p>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </form>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default WebNavbar;
