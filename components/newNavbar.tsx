"use client";

import type React from "react";

import { ListFilter, Search } from "lucide-react";
import { useGlobalContext } from "@/context/store";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

interface NavbarProps {
  selectedTeamId: string | null;
  selectedSpaceId: string | null;
  selectedUserId: string | null;
  selectedTeam: any;
  selectedMember: any;
}

const NewNavbar = ({
  selectedTeamId,
  selectedSpaceId,
  selectedUserId,
  selectedTeam,
  selectedMember,
}: NavbarProps) => {
  const { searchTerm, searchTasks } = useGlobalContext();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchTasks(e.target.value);
  };

  return (
    <div className="w-full flex justify-between items-center p-3 bg-white border-b border-zinc-300 h-[69px]">
      <div className="flex flex-col">
        {(selectedSpaceId || selectedTeamId) && (
          <>
            <h3 className="text-xl font-bold">{selectedTeam?.team_name}</h3>
            <span className="text-sm text-zinc-400">
              {selectedTeam?.members?.length} Members
            </span>
          </>
        )}
        {selectedUserId && (
          <h3 className="text-xl font-bold">{selectedMember?.username}</h3>
        )}
      </div>

      <div className="flex justify-start items-center gap-2">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button className="w-[40px] h-auto" variant="outline"><ListFilter className="text-zinc-300" size={20} /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
                <h2 className="text-base font-bold border-b border-zinc-300 p-2">Sorting</h2>
                <ul className="pt-2 text-sm space-y-1">
                    <li>Created date : Ascending</li>
                    <li>Created date : Descending</li>
                </ul>
            </PopoverContent>
          </Popover>
        </div>
        <div className="relative">
          <Search
            size={18}
            className="absolute mt-5 left-3 transform -translate-y-1/2 text-zinc-500"
          />
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
