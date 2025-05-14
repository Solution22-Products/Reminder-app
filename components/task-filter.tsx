"use client";

import { useGlobalContext } from "@/context/store";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import DatePicker from "react-datepicker";

const TaskFilter = () => {
  const { filterOptions, setFilterOptions, applyFilters, clearAllFilters } =
    useGlobalContext();
  const [date, setDate] = useState<Date | undefined>(
    filterOptions.dueDate ? new Date(filterOptions.dueDate) : undefined
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Status options
  const statusOptions = [
    "todo",
    "In progress",
    "Completed",
    "Internal feedback",
  ];

  // Priority options
  const priorityOptions = ["high", "medium", "low"];

  const handleStatusToggle = (status: string) => {
    setFilterOptions((prev) => {
      const newStatus = prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status];

      return {
        ...prev,
        status: newStatus,
      };
    });
  };

  const handlePriorityToggle = (priority: string) => {
    setFilterOptions((prev) => {
      const newPriority = prev.priority.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...prev.priority, priority];

      return {
        ...prev,
        priority: newPriority,
      };
    });
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
  return date.toLocaleDateString("en-US", options);
};

  const handleDateChange = (selectedDate: Date | undefined) => {
  if (selectedDate) {
    const formattedDate = formatDate(selectedDate);
    console.log("Selected Date:", formattedDate);
    setDate(selectedDate);
    setFilterOptions((prev) => ({
      ...prev,
      dueDate: formattedDate,
    }));
    setIsPopoverOpen(false); // Close popover
  } else {
    setDate(undefined);
    setFilterOptions((prev) => ({
      ...prev,
      dueDate: null,
    }));
  }
};

  const handleOverdueToggle = () => {
    setFilterOptions((prev) => ({
      ...prev,
      showOverdueOnly: !prev.showOverdueOnly,
    }));
  };

  const handleClearFilters = () => {
    setDate(undefined);
    clearAllFilters();
  };

  return (
    <div className="flex flex-col gap-0">
      <div>
        <h2 className="text-base font-bold p-2 pb-1">
          Status
        </h2>
        <div className="flex flex-wrap gap-2 mt-0 p-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusToggle(status)}
              className={`px-3 py-1 text-base rounded-full border capitalize ${
                filterOptions.status.includes(status)
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold p-2">
          Priority
        </h2>
        <div className="flex flex-wrap gap-2 mt-0 p-2">
          {priorityOptions.map((priority) => (
            <button
              key={priority}
              onClick={() => handlePriorityToggle(priority)}
              className={`px-3 py-1 text-sm rounded-full border capitalize ${
                filterOptions.priority.includes(priority)
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold p-2">
          Due Date
        </h2>
        <div className="p-2">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
              <DatePicker
                className={`w-full focus-visible:outline-none border-none text-transparent`}
                closeOnScroll={(e) => e.target === document}
                popperPlacement="right-end" // Automatically adjust position
                selected={date}
                onChange={(date) => {
                  if (date) {
                    handleDateChange(date);
                    // setCurrentDate(date);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* <div className="p-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="overdue"
            checked={filterOptions.showOverdueOnly}
            onChange={handleOverdueToggle}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="overdue">Show Overdue Only</Label>
        </div>
      </div> */}

      <div className="flex flex-col gap-2 p-2">
        {/* <Button onClick={applyFilters} className="w-full">
          Apply
        </Button> */}
        <Button
          onClick={handleClearFilters}
          variant="outline"
          className="w-full"
        >
          Clear All Filter
        </Button>
      </div>
    </div>
  );
};

export default TaskFilter;
