"use client";

import type React from "react";
import { Check, ListFilter, Search, Filter, X } from "lucide-react";
import { useGlobalContext } from "@/context/store";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import TaskFilter from "./task-filter";
import { useState } from "react";
import Image from "next/image";

interface NavbarProps {
  selectedTeamId: string | null;
  selectedSpaceId: string | null;
  selectedUserId: string | null;
  selectedTeam: any;
  selectedMember: any;
  name: any;
  spaces: any[];
}

const NewNavbar = ({
  selectedTeamId,
  selectedSpaceId,
  selectedUserId,
  selectedTeam,
  selectedMember,
  name,
  spaces,
}: NavbarProps) => {
  const {
    searchTerm,
    setSearchTerm,
    searchTasks,
    sortOption,
    setSortOption,
    clearAllFilters,
  } = useGlobalContext();

  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchTasks(e.target.value);
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split(":");
    setSortOption({ field, direction: direction as "asc" | "desc" });
    setSortOpen(false);
  };

  // Sort options with descriptions
  const sortOptions = [
    {
      label: "Created date: Ascending",
      value: "time:asc",
      description: "Oldest first",
    },
    {
      label: "Created date: Descending",
      value: "time:desc",
      description: "Newest first",
    },
  ];

  return (
    <div className="w-full flex justify-between items-center p-3 bg-white border-b border-zinc-300 h-[69px]">
      <div className="flex flex-col">
        {(selectedSpaceId || selectedTeamId) && (
          <>
            <h3 className="text-xl font-bold">
              {selectedTeam?.team_name || "Select Team"}
            </h3>
            <span className="text-sm text-zinc-400">
              {selectedTeam?.members?.length} Members
            </span>
          </>
        )}
        {selectedUserId && (
          <div className="flex items-center gap-1">
            <Image
              src={selectedMember?.profile_image}
              alt="avatar"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col justify-center gap-0">
              <h3 className="text-xl font-bold">{selectedMember?.username}</h3>
              <span className="text-sm text-zinc-400 -mt-1">
                {selectedMember?.role}
              </span>
            </div>
          </div>
        )}
        {name.kanban && (
          <>
            <h3 className="text-xl font-bold">{name.name}</h3>
            {spaces?.length === 1 || spaces?.length === 0 ? (
              <span className="text-sm text-zinc-400">
                {spaces?.length} Space
              </span>
            ) : (
              <span className="text-sm text-zinc-400">
                {spaces?.length} Spaces
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex justify-start items-center gap-2">
        <div>
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                className={`w-[40px] h-auto ${filterOpen ? "bg-zinc-100" : ""}`}
                variant="outline"
              >
                <Filter
                  className={`${
                    filterOpen ? "text-zinc-900" : "text-zinc-300"
                  }`}
                  size={20}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[317px]" align="end">
              <div className="flex flex-col">
                <div className="flex justify-between border-b border-zinc-300">
                  <h2 className="text-base font-bold p-2 font-inter">
                    Filter Task
                  </h2>
                  <X
                    className="text-zinc-500 cursor-pointer"
                    size={20}
                    onClick={() => setFilterOpen(false)}
                  />
                </div>
                <TaskFilter />
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Popover open={sortOpen} onOpenChange={setSortOpen}>
            <PopoverTrigger asChild>
              <Button
                className={`w-[40px] h-auto ${sortOpen ? "bg-zinc-100" : ""}`}
                variant="outline"
              >
                <ListFilter
                  className={`${sortOpen ? "text-zinc-900" : "text-zinc-300"}`}
                  size={20}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px]" align="end">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-bold border-b border-zinc-300 p-2">
                    Sorting
                  </h2>
                  <div className="pt-2 flex flex-col gap-1">
                    {sortOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                        className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer hover:bg-zinc-100 ${
                          `${sortOption.field}:${sortOption.direction}` ===
                          option.value
                            ? "bg-zinc-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {`${sortOption.field}:${sortOption.direction}` ===
                            option.value && (
                            <Check size={16} className="text-zinc-950" />
                          )}
                          <span className="text-sm font-medium">
                            {option.label}
                          </span>
                        </div>
                        {/* <span className="text-xs text-zinc-500">{option.description}</span> */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="relative">
          <Search
            size={18}
            className="absolute mt-5 left-3 transform -translate-y-1/2 text-zinc-500"
          />
          {searchTerm && (
            <X
              size={16}
              className="absolute mt-5 top-0 right-2 transform -translate-y-1/2 text-zinc-500 cursor-pointer bg-white h-[30px]"
              onClick={() => {
                setSearchTerm("");
                clearAllFilters();
              }}
            />
          )}
          <input
            type="text"
            placeholder="Search for task"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full border text-sm rounded-md px-3 focus:outline-none focus:ring-2 py-2 focus:ring-blue-300 pl-9"
          />
        </div>
      </div>
    </div>
  );
};

export default NewNavbar;
