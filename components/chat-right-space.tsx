"use client";
import { useGlobalContext } from "@/context/store";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import {
  Users,
  Search,
  Layers,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import CreateSpaceAndTeam from "./createSpaceAndTeam";
import { supabase } from "@/utils/supabase/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import EditSpaceDialog from "./editSpaceDialog";
import DeleteSpaceDialog from "./deleteSpaceDialog";

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
  fetchData: () => Promise<void>;
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
  fetchData,
  // userMembers,
  isLoading,
}: ChatRightSpaceProps) => {
  const { resetSearch, userId: loggedUserData } = useGlobalContext();

  const [visibleCount, setVisibleCount] = useState(5);
  const isShowingAll = visibleCount >= members.length;
  const [searchMember, setSearchMember] = useState("");
  const [spaceTrigger, setSpaceTrigger] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditSpace, setCurrentEditSpace] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentDeleteSpace, setCurrentDeleteSpace] = useState<any>(null);

  const [currentDeleteTeam, setCurrentDeleteTeam] = useState<any>(null);
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);

  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [currentEditTeam, setCurrentEditTeam] = useState<any>(null);

  const [addedMembers, setAddedMembers] = useState<any[]>([]);

  const toggleVisible = () => {
    setVisibleCount(isShowingAll ? 5 : members.length);
  };

  const getTeamsBySpaceId = (spaceId: string) => {
    return teams.filter((team) => team.space_id === spaceId);
  };

  const handleSpaceClick = (spaceId: string) => {
    onSelectSpace(spaceId);
    onSelectUser("");
    resetSearch();
  };

  const handleTeamClick = (teamId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the accordion
    onSelectTeam(teamId);
    onSelectUser("");
    resetSearch();
  };

  const handleUserClick = (userId: string) => {
    onSelectUser(userId);
    onSelectSpace("");
    onSelectTeam("");
    resetSearch();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchMember(e.target.value);
  };

  const filteredMembers = members.filter((member) =>
    member?.username?.toLowerCase()?.includes(searchMember.toLowerCase())
  );

  const handleEditSpace = (space: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEditSpace(space);
    setEditDialogOpen(true);
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

  const handleDeleteSpace = async (space: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDeleteSpace(space);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTeam = async (team: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentDeleteTeam(team);
    setDeleteTeamDialogOpen(true);
  };

  useEffect(() => {
    fetchData(); // Initial fetch

    const channel = supabase
      .channel("realtime-spaces")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spaces" },
        (payload) => {
          fetchData(); // Refresh the list on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceTrigger]);

  return (
    <div className="">
      {/* Spaces and Teams */}
      <section className="p-4 pt-0 h-[25rem] overflow-y-auto playlist-scroll">
        <div className="flex justify-between items-center sticky top-0 bg-white pt-4 pb-4">
          <div className="flex items-center">
            <Layers size={20} className="text-blue-500 mr-2" />
            <h2 className="text-lg font-bold">Spaces & Teams</h2>
          </div>
          {(loggedUserData?.role === "owner" ||
            (loggedUserData?.role === "User" &&
              ((loggedUserData?.access?.space !== true &&
                loggedUserData?.access?.all === true) ||
                loggedUserData?.access?.space === true))) && (
            <CreateSpaceAndTeam
              spaceTrigger={spaceTrigger}
              setSpaceTrigger={setSpaceTrigger}
            />
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
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
                      <div className="flex-1 truncate">
                        {space.space_name.length > 20
                          ? `${space.space_name.slice(0, 20)}...`
                          : space.space_name}
                      </div>
                      {(loggedUserData?.role === "owner" ||
                        (loggedUserData?.role === "User" &&
                          ((loggedUserData?.access?.space !== true &&
                            loggedUserData?.access?.all === true) ||
                            loggedUserData?.access?.space === true))) && (
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
                                <MoreVertical size={16} />
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
                    </AccordionTrigger>
                    <AccordionContent className="px-2 py-2">
                      {getTeamsBySpaceId(space.id).length === 0 && (
                        <p className="text-sm text-gray-500">No teams found</p>
                      )}
                      <ul className="list-none space-y-1">
                        {getTeamsBySpaceId(space.id).map((team) => (
                          <li
                            key={team.id}
                            className={`text-base font-medium text-zinc-950 hover:text-black cursor-pointer p-2 rounded flex justify-between items-center ${
                              selectedTeamId === team.id
                                ? "bg-[#1A56DB] !text-white font-medium"
                                : ""
                            }`}
                            onClick={(e) => handleTeamClick(team.id, e)}
                          >
                            {team.team_name}
                            {(loggedUserData?.role === "owner" ||
                              (loggedUserData?.role === "User" &&
                                ((loggedUserData?.access?.team !== true &&
                                  loggedUserData?.access?.all === true) ||
                                  loggedUserData?.access?.team === true))) && (
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
                                      <MoreVertical size={16} />
                                      <span className="sr-only">
                                        More options
                                      </span>
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
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
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
        )}
      </section>

      {/* Members List */}
      <section className="p-4 pt-20">
        <div className="mb-4 border-t border-zinc-200 pt-3 sticky top-0 bg-white">
          <div className="flex items-center">
            <Users size={20} className="text-green-500 mr-2" />
            <h2 className="text-lg font-bold">Members</h2>
          </div>
          <div className="relative mt-2">
            <Search
              size={18}
              className="absolute mt-5 left-3 transform -translate-y-1/2 text-zinc-500"
            />
            {searchMember && (
              <X
                size={16}
                className="absolute mt-5 top-0 right-2 transform -translate-y-1/2 text-zinc-500 cursor-pointer bg-white h-[30px]"
                onClick={() => {
                  setSearchMember("");
                  resetSearch();
                }}
              />
            )}
            <input
              type="text"
              placeholder="search for member"
              value={searchMember}
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
