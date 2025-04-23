"use client";
import { useState, useEffect } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { Trash2, CirclePlus } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Ensure this exists in your project
import { supabase } from "@/utils/supabase/supabaseClient";
// const notify = (message: string, success: boolean) =>
//   toast[success ? "success" : "error"](message, {
//     style: {
//       borderRadius: "10px",
//       background: "#fff",
//       color: "#000",
//     },
//     position: "top-right",
//     duration: 3000,
//   });
interface Team {
  id: number;
  team_name: string;
}
interface SearchBarProps {
  spaceId: number;
  sendDataToParent: any;
}
const AddTeam: React.FC<SearchBarProps> = ({ spaceId, sendDataToParent }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [memberAddDialogOpen, setMemberAddDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamNameError, setTeamNameError] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<any[]>([]);
  const [noUserFound, setNoUserFound] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [addedMembers, setAddedMembers] = useState<any[]>([]);
  const [teamMemberError, setTeamMemberError] = useState(false);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("space_id", spaceId)
      .eq("is_deleted", false);

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      const teamData = data.map((team) => ({
        ...team,
      }));
      setTeams(teamData as Team[]);
      console.log("teamData", teamData);
    }
  };

  const getUserData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);

    try {
      // Fetch all users from the database
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      // Filter users whose email includes the input value
      const matchingUsers =
        data?.filter((user) => user.email.includes(emailInput)) || [];

      if (matchingUsers.length > 0 || emailInput === "") {
        setMatchingUsers(matchingUsers);
        setNoUserFound(false);
      } else {
        setNoUserFound(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };
  const handleUserSelect = (user: any) => {
    if (!addedMembers.some((member) => member.id === user.id)) {
      setAddedMembers([...addedMembers, user]);
    }
    setEmailInput("");
    setMatchingUsers([]);
  };

  const removeMember = (member: any, index: number) => {
    const updatedMembers = [...addedMembers];
    updatedMembers.splice(index, 1);
    setAddedMembers(updatedMembers);
  };
  const handleSaveMembers = async () => {
    const trimmedTeamName = teamName.trim().toLowerCase();

    if (trimmedTeamName === "") {
      setTeamNameError(true);
      return;
    } else if (addedMembers.length === 0) {
      setTeamMemberError(true);
      return;
    } else {
      // Fetch selected user details based on `id`
      const { data: fetchedMembers, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .in(
          "id",
          addedMembers.map((member) => member.id)
        );

      if (fetchError) {
        console.error("Error fetching members:", fetchError);
        return;
      }

      // Check if there are any members already in the team
      const { data: existingTeam, error: checkError } = await supabase
        .from("teams")
        .select("*")
        .eq("space_id", spaceId)
        .eq("is_deleted", false);

      if (checkError) {
        console.error("Error checking existing team:", checkError);
        return;
      }

      const isDuplicate = existingTeam?.some(
        (team) => team.team_name.trim().toLowerCase() === trimmedTeamName
      );

      if (isDuplicate) {
        toast({
          title: "Team already exists",
          description: `A team named "${teamName}" already exists in this space. Please choose a different name.`,
        });
        return;
      }

      try {
        // Insert selected user details as array of objects into the `teams` table
        const { error: insertError } = await supabase.from("teams").insert({
          team_name: teamName,
          members: fetchedMembers.map((member) => ({
            id: member.id,
            name: member.username, // Assuming `name` is a field in your `users` table
            role: member.role,
            department: member.department,
            designation: member.designation,
            email: member.email, // Assuming `email` is a field in your `users` table
            entity_name: member.entity_name,
          })),
          space_id: spaceId,
          is_deleted: false,
        });

        if (insertError) {
          console.error("Error saving members:", insertError);
          return;
        }
        setTeamName("");
        setAddedMembers([]);
        setTeamNameError(false);
        setTeamMemberError(false);
        setMemberAddDialogOpen(false);

        // notify("Team And Members saved successfully", true);
        sendDataToParent();
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    }
  };

  const handleClose = () => {
    setMemberAddDialogOpen(false);
    setTeamName("");
    setAddedMembers([]);
    setTeamNameError(false);
    setTeamMemberError(false);
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [highlightedIndex, matchingUsers]);
  const handleKeyDown = (e: KeyboardEvent) => {
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
  useEffect(() => {
    fetchTeams();
  }, [spaceId]);

  return (
    <>
      <div className="hidden">
        <span>{teams.length}</span>
      </div>
      <Sheet open={memberAddDialogOpen} onOpenChange={setMemberAddDialogOpen}>
        <SheetTrigger asChild>
          <div className="border   flex flex-col justify-between items-center pt-2 pb-2 border-dashed rounded-[12px] w-[170px] h-[450px] max-w-[200px]">
            <button
              className=" px-3 bg-white w-[130px] h-[41px] rounded-[8px] border border-gray-300 border-dashed items-center flex justify-center cursor-pointer hover:bg-slate-50"
              // onClick={toggleDrawer}
            >
              <span className="text-gray-600 px-[5px]">
                <CirclePlus size={16} />
              </span>
              <p className="text-gray-500 font-medium text-sm font-inter">
                Add Team
              </p>
            </button>
          </div>
        </SheetTrigger>
        <SheetContent
          className="min-h-screen overflow-y-scroll"
          style={{ maxWidth: "500px" }}
        >
          <SheetHeader>
            <SheetTitle className="text-base">TEAM SETTING</SheetTitle>
          </SheetHeader>
          <div className="py-2">
            <label
              htmlFor="name"
              className="text-sm text-[#111928] font-medium"
            >
              Team Name
            </label>
            <Input
              id="name"
              placeholder="Development Name"
              className="text-gray-500 mt-1.5 py-3 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
              onChange={(e: any) => {
                setTeamName(e.target.value);
                setTeamNameError(false);
              }}
            />
            {teamNameError && (
              <p className="text-red-500 text-sm mt-1">Please fill the field</p>
            )}
            <div className="mt-8 relative">
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
                placeholder="Add guest email"
                className="text-gray-500 mt-1.5 h-12 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
                onChange={getUserData}
                value={emailInput}
              />

              {/* <Button className="absolute right-[30px] bottom-[38px] rounded-[10px] border border-zinc-300 bg-primaryColor-700 text-white text-xs font-medium hover:bg-primaryColor-700">
                    <Plus size={16} />
                    Add
                  </Button> */}
            </div>
            {teamMemberError && (
              <p className="text-red-500 text-sm mt-1">Please fill the field</p>
            )}
            {addedMembers.length > 0 && (
              <div className="mt-2 p-2 flex flex-wrap items-center gap-2 w-full border border-gray-300 rounded-md">
                {addedMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex justify-between items-center gap-2 py-1 px-2 w-full text-sm text-gray-500"
                  >
                    <div className="flex items-center gap-1">
                      <Image
                        src={member.profile_image}
                        alt="user image"
                        width={36}
                        height={36}
                        className="w-[32px] h-[32px] rounded-full"
                      />

                      <span>{member.username}</span>
                    </div>
                    <span
                      className={`${
                        member.role === "superadmin"
                          ? "text-[#0E9F6E]"
                          : "text-gray-500"
                      }`}
                    >
                      {member.designation?.length > 16
                        ? `${member.designation?.slice(0, 15)}...`
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
                ))}
              </div>
            )}
          </div>
          <SheetFooter className="mt-5">
            <Button
              type="submit"
              variant={"outline"}
              className="w-1/2 border border-gray-200 text-gray-800 font-medium"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2 bg-primaryColor-700 hover:bg-blue-600 text-white"
              onClick={handleSaveMembers}
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};
export default AddTeam;
