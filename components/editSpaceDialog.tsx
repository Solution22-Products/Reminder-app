"use client";
import { Button } from "@/components/ui/button";
import type React from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/utils/supabase/supabaseClient";
import { CircleX, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

interface EditSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: any;
  teams: any[];
  onUpdate: () => Promise<void>;
  editTeam: boolean;
  addedMembers: any[];
  setAddedMembers: (members: any[]) => void;
}

const EditSpaceDialog = ({
  open,
  onOpenChange,
  space,
  teams,
  onUpdate,
  editTeam,
  addedMembers,
  setAddedMembers,
}: EditSpaceDialogProps) => {
  const [spaceName, setSpaceName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamTags, setTeamTags] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoader, setUpdateLoader] = useState(false);

  const [editTeamName, setEditTeamName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<any[]>([]);
  const [noUserFound, setNoUserFound] = useState(false);
  // const [addedMembers, setAddedMembers] = useState<any[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [teamMemberError, setTeamMemberError] = useState(false);

  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    if (space) {
      setSpaceName(space.space_name || "");
      setEditTeamName(space.team_name || "");
      setTeamTags(teams || []);
    }
  }, [space, teams, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && teamName.trim()) {
      e.preventDefault();
      addTeamTag();
    }
  };

  const addTeamTag = () => {
    if (teamName.trim()) {
      const newTag = {
        id: Date.now(), // or use a UUID if needed
        team_name: teamName.trim(),
      };
      setTeamTags([...teamTags, newTag]);
      setTeamName("");
    }
  };

  const removeTeamTag = (index: number) => {
    setTeamTags(teamTags.filter((_, i) => i !== index));
  };

  const handleUpdateSpace = async () => {
    if (!spaceName) {
      toast({
        title: "Error",
        description: "Please enter the space name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdateLoader(true);
      // Update the space name
      const { error: spaceError } = await supabase
        .from("spaces")
        .update({ space_name: spaceName })
        .eq("id", space.id);

      if (spaceError) {
        toast({
          title: "Error",
          description: "Failed to update space.",
          variant: "destructive",
        });
        return;
      }

      // Filter out only new team tags
      const existingTeamNames = teams.map((t) => t.team_name.toLowerCase());
      const currentTeamTagNames = teamTags.map((tag) =>
        tag.team_name.toLowerCase()
      );

      // Find new teams to add
      const newTeams = teamTags.filter(
        (tag) => !existingTeamNames.includes(tag.team_name.toLowerCase())
      );

      // Find teams to delete (teams that exist in the database but not in the current teamTags)
      const teamsToDelete = teams.filter(
        (team) => !currentTeamTagNames.includes(team.team_name.toLowerCase())
      );

      // Add new teams
      for (const newTeam of newTeams) {
        const { error: teamError } = await supabase.from("teams").insert({
          team_name: newTeam.team_name,
          space_id: space.id,
          is_deleted: false,
        });

        if (teamError) {
          toast({
            title: "Error",
            description: `Failed to add team "${newTeam.team_name}".`,
            variant: "destructive",
          });
          return;
        }
      }

      // Delete removed teams
      for (const teamToDelete of teamsToDelete) {
        const { error: deleteError } = await supabase
          .from("teams")
          .update({ is_deleted: true })
          .eq("id", teamToDelete.id);

        if (deleteError) {
          toast({
            title: "Error",
            description: `Failed to delete team "${teamToDelete.team_name}".`,
            variant: "destructive",
          });
          return;
        }
      }
      onOpenChange(false);
      setUpdateLoader(false);
      onUpdate();
      toast({
        title: "Success",
        description: "Space updated successfully.",
      });
    } catch (err) {
      console.error("Error updating space:", err);
      setUpdateLoader(true);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const getAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "User");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      setAllUsers(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailInput(value);

    const filtered = allUsers.filter((user) =>
      user.email.toLowerCase().includes(value.toLowerCase())
    );

    if (filtered.length > 0 || value === "") {
      setMatchingUsers(filtered);
      setNoUserFound(false);
    } else {
      setMatchingUsers([]);
      setNoUserFound(true);
    }
  };

  const handleUserSelect = (user: any) => {
    // Initialize addedMembers as an empty array if it's null or undefined
    const currentMembers = Array.isArray(addedMembers) ? addedMembers : []

    // Check if the user is already added
    if (!currentMembers.some((member) => member.id === user.id)) {
      setAddedMembers([...currentMembers, user])
    }
    setEmailInput("")
    setMatchingUsers([])
  }
  

  const removeMember = (member: any, index: number) => {
    const updatedMembers = [...addedMembers];
    updatedMembers.splice(index, 1);
    setAddedMembers(updatedMembers);
  };

  const handleUpdateTeam = async () => {
    if (!editTeamName) {
      toast({
        title: "Error",
        description: "Please enter the team name.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdateLoader(true);

      // Update the team name
      const { error: teamError } = await supabase
        .from("teams")
        .update({ team_name: editTeamName, members: addedMembers })
        .eq("id", space.id);

      if (teamError) {
        toast({
          title: "Error",
          description: "Failed to update team name.",
          variant: "destructive",
        });
        setUpdateLoader(false);
        return;
      }

      onOpenChange(false);
      setUpdateLoader(false);
      onUpdate();
      toast({
        title: "Success",
        description: "Team updated successfully.",
      });
    } catch (err) {
      console.error("Error updating team:", err);
      setUpdateLoader(false);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setTeamName("");
    setAddedMembers([]);
    setTeamMemberError(false);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown1);
    return () => {
      document.removeEventListener("keydown", handleKeyDown1);
    };
  }, [highlightedIndex, matchingUsers]);

  const handleKeyDown1 = (e: KeyboardEvent) => {
    if (matchingUsers.length === 0) return;

    if (e.key === "ArrowDown") {
      // Move highlight down
      setHighlightedIndex((prevIndex) =>
        prevIndex < matchingUsers.length - 1 ? prevIndex + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      // Move highlight up
      setHighlightedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : matchingUsers.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      // Select highlighted user on Enter
      handleUserSelect(matchingUsers[highlightedIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="border-b border-zinc-200 pb-3">
            {editTeam ? "Edit Team" : "Edit Space"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {editTeam ? (
            <div className="flex flex-col items-start gap-1.5">
              <Label
                htmlFor="teamname"
                className="text-right text-sm font-semibold"
              >
                Team Name
              </Label>
              <Input
                id="teamname"
                onChange={(e) => setEditTeamName(e.target.value)}
                value={editTeamName}
                placeholder="e.g Team Title"
              />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-1.5">
              <Label
                htmlFor="name"
                className="text-right text-sm font-semibold"
              >
                Space Name
              </Label>
              <Input
                id="name"
                onChange={(e) => setSpaceName(e.target.value)}
                value={spaceName}
                placeholder="e.g Space Title"
              />
            </div>
          )}

          {editTeam ? (
            <>
              <div className="mt-0 relative">
                {matchingUsers.length > 0 &&
                  emailInput.length > 0 &&
                  !noUserFound && (
                    <div className="absolute bottom-[-28px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
                      {matchingUsers.length > 0 && (
                        <ul>
                          {matchingUsers.map((user, index) => (
                            <li
                              key={user.id}
                              className={`p-2 cursor-pointer ${
                                index === highlightedIndex
                                  ? "bg-gray-200"
                                  : "hover:bg-gray-100"
                              }`}
                              onClick={() => handleUserSelect(user)}
                              onMouseEnter={() => setHighlightedIndex(index)}
                            >
                              {user.email}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                {noUserFound && (
                  <div className="absolute bottom-[-28px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
                    <ul>
                      <li className="p-2 cursor-pointer hover:bg-gray-100">
                        No User Found
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="members"
                  className="text-sm text-[#111928] font-medium"
                >
                  Members
                </label>
                <Input
                  id="members"
                  autoComplete="off"
                  placeholder="Add guest email"
                  className="text-gray-500 mt-1.5 h-12 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
                  onChange={handleInputChange}
                  value={emailInput}
                  onFocus={getAllUsers}
                />
              </div>
              {addedMembers?.length > 0 && (
                <div className="mt-2 p-2 flex-wrap items-center gap-2 w-full border border-gray-300 rounded-md h-[208px] overflow-y-auto playlist-scroll">
                  {addedMembers?.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex justify-between items-center gap-2 my-2 py-1 px-2 w-full text-sm text-gray-500"
                    >
                      <div className="flex items-center gap-1">
                        <Image
                          src={member.profile_image}
                          alt="User Image"
                          width={36}
                          height={36}
                          className="w-[32px] h-[32px] rounded-full"
                        />
                        <span>{member.username.length > 15 ? `${member.username.slice(0, 15)}...` : member.username}</span>
                      </div>
                      <div className="flex items-center gap-3">
                      <span
                        className="text-gray-500 text-right"
                        
                      >
                        {member.designation?.length > 16
                          ? `${member.designation.slice(0, 16)}...`
                          : member.designation}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMember(member, index);
                        }}
                        className="focus:outline-none space_delete_button text-gray-400"
                      >
                        <Trash2 className="text-black" size={18} />
                      </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-start gap-1.5">
              <Label
                htmlFor="username"
                className="text-right text-sm font-semibold"
              >
                Teams
              </Label>
              <div className="w-full flex flex-wrap items-center border border-gray-300 rounded-md">
                <div className="flex items-center w-full">
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g Team Title"
                    className="w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {isEditing && (
                    <span className="bg-amber-100 text-amber-600 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                      Editing
                    </span>
                  )}
                </div>
                {teamTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2">
                    {teamTags.map((team, index) => (
                      <div
                        key={team.id}
                        className="flex items-center text-sm font-semibold gap-1 px-2 py-1 border border-amber-500 text-amber-500 rounded-[30px]"
                      >
                        {team.team_name}
                        <CircleX
                          size={18}
                          className="cursor-pointer transition-colors ml-1"
                          onClick={() => removeTeamTag(index)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="w-full">
          <Button
            variant="outline"
            className="w-1/2"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            className="w-1/2 bg-[#1A56DB] text-sm hover:bg-[#1A56DB]"
            type="button"
            onClick={editTeam ? handleUpdateTeam : handleUpdateSpace}
            disabled={updateLoader}
          >
            {updateLoader ? (
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
                  stroke="#fff"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="#fff"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSpaceDialog;
