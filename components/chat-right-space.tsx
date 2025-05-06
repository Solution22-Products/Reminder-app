"use client";
import { useGlobalContext } from "@/context/store";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Users, Search, Layers } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import CreateSpaceAndTeam from "./createSpaceAndTeam";

interface ChatRightSpaceProps {
  onSelectSpace: (spaceId: string) => void;
  onSelectTeam: (teamId: string) => void;
  onSelectUser: (userId: string) => void;
  selectedSpaceId: string | null;
  selectedTeamId: string | null;
  selectedUserId: string | null;
  spaces: any[];
  teams: any[];
  members: any[];
  // userMembers: any[]
  isLoading: boolean;
}

const ChatRightSpace = ({
  onSelectSpace,
  onSelectTeam,
  onSelectUser,
  selectedSpaceId,
  selectedTeamId,
  selectedUserId,
  spaces,
  teams,
  members,
  // userMembers,
  isLoading,
}: ChatRightSpaceProps) => {
  const { userId: currentUser } = useGlobalContext();

  // Filter spaces based on user role
  // const spaces =
  //   currentUser?.role === "owner"
  //     ? spaces
  //     : spaces.filter((space) => {
  //         const teamsInSpace = teams.filter((team) => team.space_id === space.id)
  //         return teamsInSpace.some((team) =>
  //           team.members?.some((member: any) => member.entity_name === currentUser?.entity_name),
  //         )
  //       })

  const [visibleCount, setVisibleCount] = React.useState(5);
  const isShowingAll = visibleCount >= members.length;
  const [searchTerm, setSearchTerm] = React.useState("");

  const toggleVisible = () => {
    setVisibleCount(isShowingAll ? 5 : members.length);
  };

  const getTeamsBySpaceId = (spaceId: string) => {
    return teams.filter((team) => team.space_id === spaceId);
  };

  const handleSpaceClick = (spaceId: string) => {
    onSelectSpace(spaceId);
  };

  const handleTeamClick = (teamId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the accordion
    onSelectTeam(teamId);
  };

  const handleUserClick = (userId: string) => {
    onSelectUser(userId);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredMembers = members.filter((member) =>
    member?.username?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  // const filteredUserMembers = userMembers.filter((member) =>
  //   member?.username?.toLowerCase()?.includes(searchTerm.toLowerCase())
  // );

  return (
    <div className="">
      {/* Spaces and Teams */}
      <section className="bg-white shadow-md p-4 h-[25rem] overflow-y-auto playlist-scroll">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
          <Layers size={20} className="text-blue-500 mr-2" />
          <h2 className="text-lg font-bold">Spaces & Teams</h2>
          </div>
          <CreateSpaceAndTeam />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Accordion
            type="single"
            className="w-full space-y-2"
            value={selectedSpaceId || ""}
            onValueChange={(value) => {
              if (value) {
                // If a new accordion is opened, select that space
                handleSpaceClick(value);
              } else if (spaces.length > 0) {
                // If an accordion is closed, open the next one or the first one
                const currentIndex = spaces.findIndex(
                  (space) => space.id === selectedSpaceId
                );
                const nextIndex = (currentIndex + 1) % spaces.length;
                handleSpaceClick(spaces[nextIndex].id);
              }
            }}
            collapsible={false}
          >
            {spaces.length === 0 ? (
              <p className="text-sm text-gray-500 p-2">No spaces available</p>
            ) : (
              spaces.map((space) => (
                <AccordionItem
                  className={`border-b border-zinc-200 `}
                  key={space.id}
                  value={space.id}
                >
                  <AccordionTrigger
                    className="px-4 py-2 text-base font-semibold capitalize hover:no-underline flex justify-between items-center hover:bg-gray-50"
                    onClick={() => handleSpaceClick(space.id)}
                  >
                    {space.space_name.length > 20
                      ? `${space.space_name.slice(0, 20)}...`
                      : space.space_name}
                  </AccordionTrigger>
                  <AccordionContent className="px-2 py-2">
                    {getTeamsBySpaceId(space.id).length === 0 && (
                      <p className="text-sm text-gray-500">No teams found</p>
                    )}
                    <ul className="list-none space-y-1">
                      {getTeamsBySpaceId(space.id).map((team) => (
                        <li
                          key={team.id}
                          className={`text-base font-medium text-zinc-950 hover:text-black cursor-pointer p-2 rounded ${
                            selectedTeamId === team.id
                              ? "bg-[#1A56DB] !text-white font-medium"
                              : ""
                          }`}
                          onClick={(e) => handleTeamClick(team.id, e)}
                        >
                          {team.team_name}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        )}
      </section>

      {/* Members List */}
      <section className="bg-white shadow-md p-4">
        <div className="mb-4 border-t border-zinc-200 pt-3">
          <div className="flex items-center">
            <Users size={20} className="text-green-500 mr-2" />
            <h2 className="text-lg font-bold">Members</h2>
          </div>
          <div className="relative mt-2">
            <Search
              size={18}
              className="absolute mt-5 left-3 transform -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="search for member"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full border text-sm rounded-md px-3 focus:outline-none focus:ring-2 py-2 focus:ring-blue-300 pl-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <p className="text-sm text-gray-500">No members found</p>
        ) : (
          <>
            <ul className="space-y-2">
              {filteredMembers.slice(0, visibleCount).map((member) => (
                <li
                  key={member.id}
                  className={`flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer ${
                    selectedUserId === member.id
                      ? "bg-[#1A56DB] text-white font-medium"
                      : ""
                  }`}
                  onClick={() => handleUserClick(member.id)}
                >
                  <img
                    src={
                      member.profile_image ||
                      "/placeholder.svg?height=32&width=32&query=user"
                    }
                    alt={member.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-base font-medium">
                    {member.username}
                  </span>
                </li>
              ))}
            </ul>

            {filteredMembers.length > 5 && (
              <div className="mt-3 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleVisible}
                  className="text-sm"
                >
                  {isShowingAll ? "Show Less" : "Show More"}
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default ChatRightSpace;
