"use client";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarDays, Filter } from "lucide-react";
import Select from "react-select";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useGlobalContext } from "@/context/store";
import { Input } from "@/components/ui/input";
interface FilterProps {
  loggedUserData: any;
  // teamFilterValue: string;
  setTeamFilterValue: (value: string) => void;
  // taskStatusFilterValue: string;
  setTaskStatusFilterValue: (value: string) => void;
  setDateFilterValue: (value: string) => void;
  filterFn: () => void;
  filterDialogOpen: boolean;
  setFilterDialogOpen: (value: boolean) => void;
  teamResetFn: () => void;
}

const taskStatusOptions = [
  {
    value: "todo",
    label: "todo",
  },
  {
    value: "In progress",
    label: "In progress",
  },
  {
    value: "feedback",
    label: "feedback",
  },
];

const adminTaskStatusOptions = [
  {
    value: "todo",
    label: "todo",
  },
  {
    value: "In progress",
    label: "In progress",
  },
  {
    value: "feedback",
    label: "feedback",
  },
  {
    value: "Completed",
    label: "Completed",
  },
];

const FilterComponent: React.FC<FilterProps> = ({
  loggedUserData,
  // teamFilterValue,
  setTeamFilterValue,
  // taskStatusFilterValue,
  setTaskStatusFilterValue,
  setDateFilterValue,
  filterFn,
  filterDialogOpen,
  setFilterDialogOpen,
  teamResetFn,
}) => {
  const [teamData, setTeamData] = useState<any>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<any>(null);
  const [date, setDate] = useState<any>(null);
  // const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const { selectedActiveTab } = useGlobalContext();
  const {userId} = useGlobalContext();

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
    };

    return date.toLocaleDateString("en-GB", options); // 'en-GB' gives the format "23 Aug 2024"
  };

  let spaceData: any;
  spaceData = sessionStorage.getItem("spaceData");
  spaceData = JSON.parse(spaceData);
  const getTeamData = async () => {
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("space_id", selectedActiveTab)
        .eq("is_deleted", false);
      // console.log("Team data:", data);
      if (error) {
        console.error("Error fetching team data:", error);
        return;
      }

      if (data) {
        const filteredTeamName = data.filter((team: any) => team.members.some((member: any) => member.id === userId?.id));
        userId?.role === "owner" ? setTeamData(data) : setTeamData(filteredTeamName);
        // setTeamData(filteredTeamName);
        console.log("Filtered team data:", filteredTeamName);
        console.log("Team data:", data);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  };

  const allTeamData = teamData.map((team: any) => {
    // console.log("team", team); // Logging the team
    return {
      value: team.team_name,
      label: team.team_name,
    };
  });

  const handleSelectChange = (selectedOption: any) => {
    setSelectedTeam(selectedOption);
    setTeamFilterValue(selectedOption?.value || "");
    console.log("Selected Team:", selectedOption);
  };

  const handleSelectStatus = (selectedOption: any) => {
    setSelectedTaskStatus(selectedOption);
    setTaskStatusFilterValue(selectedOption?.value || "");
    console.log("Selected Task Status:", selectedOption);
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate || null);
    setDateFilterValue(selectedDate ? formatDate(selectedDate) : "");
    console.log(
      "Selected Date: ",
      selectedDate ? formatDate(selectedDate) : ""
    );
  };

  useEffect(() => {
    getTeamData();
  }, [selectedActiveTab]);

  const handleCloseCancel = () => {
    setSelectedTeam(null);
    setSelectedTaskStatus(null);
    setDate(null);
    setDateFilterValue("");
    setTaskStatusFilterValue("");
    setTeamFilterValue("");
    setFilterDialogOpen(false);
    teamResetFn();
  };

  return (
    <>
      <Sheet open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="px-2.5 rounded-[10px] h-[42px]">
            <Filter className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent className="font-inter">
          <SheetHeader>
            <SheetTitle className="text-[#6B7280] text-base">
              FILTER OPTION
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col justify-between w-full h-full">
            <div>
              <div className="py-3">
                <Label className="text-sm text-gray-900 block pb-1">Team</Label>
                <Select
                  className="w-full mt-1 text-sm"
                  options={allTeamData}
                  onChange={handleSelectChange} // Log selected team to console
                  value={selectedTeam} // Controlled value
                  isClearable
                  placeholder="All / Design / Management"
                />
              </div>

              <div className="pb-3">
                <Label className="text-sm text-gray-900 block pb-1">
                  Task status
                </Label>
                <Select
                  className="w-full mt-1 text-sm"
                  options={userId?.role === "owner" ? adminTaskStatusOptions : taskStatusOptions}
                  onChange={handleSelectStatus} // Log selected team to console
                  value={selectedTaskStatus} // Controlled value
                  isClearable
                  placeholder="All / To Do / In Progress / Feedback"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-900 block pb-1">
                  Due Date
                </Label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="flex items-center justify-between w-full px-3 py-2 border rounded-lg text-left focus:outline-none"
                        type="button"
                      >
                        {date ? (
                          <span className="text-sm text-gray-500">
                            {format(date, "dd/MMM/yyyy")}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">
                            00/00/0000
                          </span>
                        )}
                        <CalendarDays
                          size={20}
                          className="ml-2 text-gray-500"
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {/* <div className="flex items-center mt-4 gap-2">
                <input type="checkbox" />
                <label className="text-sm text-gray-900 block">
                  Task assigned to me
                </label>
              </div> */}
            </div>

            <SheetFooter className="w-full flex gap-2 pb-4">
              <Button
                className="w-1/2"
                variant="outline"
                onClick={handleCloseCancel}
              >
                Cancel
              </Button>
              <Button
                className="w-1/2 bg-primaryColor-700 text-white hover:bg-primaryColor-700 hover:text-white"
                variant="outline"
                onClick={filterFn}
              >
                Update
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FilterComponent;
