"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CarouselItem } from "@/components/ui/carousel";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { set } from "date-fns";
interface Team {
  id: number;
  team_name: string;
  tasks: { id: number; inputValue: string }[];
}
interface Tab {
  id: number;
  space_name: string;
  email: string;
  username: string;
  designation: string;
  role: string;
  department: string;
}

const TeamCard: React.FC<{
  team: any;
  spaceId: any;
  sendDataToParent: any;
  sendFetchTeamRequest:any
}> = ({ team, spaceId, sendDataToParent,sendFetchTeamRequest }) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [matchingUsers, setMatchingUsers] = useState<any[]>([]);
  const [noUserFound, setNoUserFound] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [addedMembers, setAddedMembers] = useState<any[]>(team.members ?? []);
  const [teamMemberError, setTeamMemberError] = useState(false);
  const [isopen, setIsOpen] = useState(false);
  const isDeleting = false;
  // const fetchTeams = async () => {
  //   if (!spaceId) return;
  //   const { data, error } = await supabase
  //     .from("teams")
  //     .select("*")
  //     .eq("is_deleted", false)
  //     .eq("space_id", spaceId);

  //   if (error) {
  //     console.log(error);
  //     return;
  //   }
  //   console.log("fetching team");
  //   if (data) {
  //     const teamData = data.map((team) => ({
  //       ...team,
  //       tasks: [], // Initialize each team with an empty tasks array
  //     }));
  //     // setTeams(teamData as Team[]);
  //       console.log(data)
  //   }
    
  // };

    
  const getUserData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setEmailInput(inputValue);

    if (inputValue.trim() === "") {
      setMatchingUsers([]);
      setNoUserFound(false);
      return;
    }

    try {
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      const matchingUsers =
        data?.filter((user: any) => user.email.includes(inputValue)) || [];

      if (matchingUsers.length > 0) {
        setMatchingUsers(matchingUsers);
        setNoUserFound(false);
      } else {
        setMatchingUsers([]);
        setNoUserFound(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };
  const handleUserSelect = (user: Tab, teamId: any) => {
    setTeamMemberError(false);

    // Check if the user is already added
    const isAlreadyAdded = addedMembers.some((member) => member.id === user.id);
    if (isAlreadyAdded) {
      return;
    }
    setAddedMembers((prevMembers) => [...prevMembers, user]);
    sendDataToParent(user, teamId, "add");
    setEmailInput("");
    setHighlightedIndex(-1);
    console.log(addedMembers);
  };

  const removeMember = (user: any, index: number, teamId: any) => {
    sendDataToParent(user, teamId, "delete");
    setAddedMembers((prevMembers) =>
      prevMembers.filter(
        (member: any, i: number) => !(member.id === user.id && i === index)
      )
    );
  };

  const handleDeleteTeam = async (teamId: number) => {
    try {
      // Delete tasks associated with the team first
      const { error: taskError } = await supabase
        .from("tasks")
        .update({ is_deleted: true })
        .eq("team_id", teamId);

      if (taskError) {
        console.error("Error deleting tasks:", taskError);
        return;
      }
      console.log("Tasks deleted successfully.");
      // Now delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .update({ is_deleted: true })
        .eq("id", teamId);

      if (teamError) {
        console.error("Error deleting team:", teamError);
        return;
      }

      console.log("Team deleted successfully.");
      // fetchTeams();
      sendFetchTeamRequest();
      // Additional cleanup actions
      setIsOpen(false);
      
      console.log("Delete before Deleting");
     
      console.log("Delete after Deleting"); 
     
      toast({
        title: "Deleted Successfully!",
        description: "Team deleted successfully!",
        action: (
          <ToastAction altText="Undo" onClick={() => handleTeamUndo(teamId)}>
            Undo
          </ToastAction>
        ),
      });
    } catch (error) {
      console.error("Unexpected error during deletion:", error);
    }
  };

  const handleTeamUndo = async (teamId: number) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({ is_deleted: false })
        .eq("team_id", teamId);

      if (error) {
        console.error("Error undoing delete:", error);
        return;
      }
      // Now delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .update({ is_deleted: false })
        .eq("id", teamId);

      if (teamError) {
        console.error("Error deleting team:", teamError);
        return;
      }
      // Additional cleanup actions
      setIsOpen(false);
       sendFetchTeamRequest();
      toast({
        title: "Undo Successful",
        description: "The deleted team has been restored.",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore the deleted team. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
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
      setTeamMemberError(false);
      handleUserSelect(matchingUsers[highlightedIndex], "");
    }
  };
  // useEffect(() => {
  //   fetchTeams();
  // }, [spaceId, teamData, setTeamData]);
  return (
    <CarouselItem
      key={team.id}
      className="max-w-[270vw] basis-[28%] "
    >
      <>
        <div className="hidden">
          <span>{teams.length}</span>
        </div>
        <Card>
          <CardContent className="p-[18px] w-full h-[450px]  ">
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-black font-geist">
                {team.team_name}
              </p>
              <Dialog open={isopen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Trash2
                    size={20}
                    className="cursor-pointer"
                    onClick={() => setIsOpen(true)}
                  />
                </DialogTrigger>

                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="font-bold">Delete Team</DialogTitle>
                    <DialogDescription>
                      Do you want to delete{" "}
                      <span className="font-bold">{team.team_name}?</span>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex justify-center items-center w-full gap-4">
                    <Button
                      variant="outline"
                      className="w-1/3"
                      type="submit"
                      onClick={() => setIsOpen(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-500 w-1/3" 
                      type="button"
                      onClick={() => handleDeleteTeam(team.id)}
                      disabled={isDeleting}
                    >
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="py-1">
              <label
                htmlFor="name"
                className="text-sm text-gray-900 font-inter font-medium"
              >
                Team Name
              </label>
              <Input
                id="name"
                placeholder=""
                defaultValue={team.team_name}
                className="text-gray-500 mt-1.5 py-3 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
              />

              <div className="mt-4 relative">
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
                              onClick={() => handleUserSelect(user, team.id)}
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
                  className="text-sm text-gray-900 mb-2 font-inter font-medium"
                >
                  Members
                </label>
                <Input
                  value={emailInput}
                  autoComplete="off"
                  id="members"
                  placeholder="Add guest email"
                  className="text-gray-500 mt-1.5 h-12 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
                  onChange={getUserData}
                />
              </div>
              {teamMemberError && (
                <p className="text-red-500 text-sm mt-1">
                  Please fill the field
                </p>
              )}
              {addedMembers.length > 0 && (
                <div className="mt-2 p-2 flex flex-wrap items-center gap-2 w-full border border-gray-300 rounded-md max-h-[200px] overflow-y-auto playlist-scroll">
                  {addedMembers
                    .filter(
                      (member, index, self) =>
                        self.findIndex((m) => m.id === member.id) === index // Filter unique IDs
                    )
                    .map((member, index) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center gap-2 py-1 px-2 w-full text-sm text-gray-500"
                      >
                        <div className="flex items-center gap-1 ">
                          <Image
                            src={member.profile_image}
                            alt="user image"
                            width={36}
                            height={36}
                            className="w-[32px] h-[32px] rounded-full"
                          />
                          <span>{member.username || member.name}</span>
                        </div>
                        <span
                          className={`${
                            member.role === "superadmin"
                              ? "text-[#0E9F6E]"
                              : "text-gray-500"
                          }`}
                        >
                          {member.designation?.length > 10
                            ? `${member.designation?.slice(0, 7)}...`
                            : member.designation}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMember(member, index, team.id);
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
          </CardContent>
        </Card>
      </>
    </CarouselItem>
  );
};
export default TeamCard;
