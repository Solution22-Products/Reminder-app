// "use client";
// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Drawer } from "antd";
// import { Button } from "@/components/ui/button"; // Ensure this exists in your project
// import { Trash2, CirclePlus, Plus } from "lucide-react";
// import { supabase } from "@/lib/supabase/client";
// import toast, { Toaster } from "react-hot-toast";
// import { useRouter, usePathname, useSearchParams } from "next/navigation";
// interface Team {
//     id: number;
//     team_name: string;
// }
// const notify = (message: string, success: boolean) =>
//     toast[success ? "success" : "error"](message, {
//       style: {
//         borderRadius: "10px",
//         background: "#fff",
//         color: "#000",
//       },
//       position: "top-right",
//       duration: 3000,
//     });

// export default function TeamSpaceEdit({ params }: { params: { spaceId: string } })
// {

//     const [teams, setTeams] = useState<any[]>([]);
//   const [memberAddDialogOpen, setMemberAddDialogOpen] = useState(false);

//   const [teamName, setTeamName] = useState("");
//   const [teamNameError, setTeamNameError] = useState(false);
//   const [emailInput, setEmailInput] = useState("");
//   const [matchingUsers, setMatchingUsers] = useState<any[]>([]);
//   const [noUserFound, setNoUserFound] = useState(false);
//   const [highlightedIndex, setHighlightedIndex] = useState(-1);
//   const [addedMembers, setAddedMembers] = useState<any[]>([]);
//   const [teamMemberError, setTeamMemberError] = useState(false);
//   const router = useRouter();
//   const { spaceId } = params;


//   const fetchTeams = async () => {
//     const { data, error } = await supabase
//       .from("teams")
//       .select("*")
//       .eq("space_id", spaceId);

//     if (error) {
//       console.log(error);
//       return;
//     }

//     if (data) {
//       const teamData = data.map((team) => ({
//         ...team,
//       }));
//       setTeams(teamData as Team[]);
//     }
//   };
//   const getUserData = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     setEmailInput(e.target.value);

//     try {
//       // Fetch all users from the database
//       const { data, error } = await supabase.from("users").select("*");

//       if (error) {
//         console.error("Error fetching users:", error);
//         return;
//       }

//       // Filter users whose email includes the input value
//       const matchingUsers =
//         data?.filter((user) => user.email.includes(emailInput)) || [];

//       if (matchingUsers.length > 0 || emailInput === "") {
//         setMatchingUsers(matchingUsers);
//         setNoUserFound(false);
//       } else {
//         setNoUserFound(true);
//       }
//     } catch (err) {
//       console.error("Unexpected error:", err);
//     }
//   };
//   const handleUserSelect = (user: any) => {
//     if (!addedMembers.some((member) => member.id === user.id)) {
//       setAddedMembers([...addedMembers, user]);
//     }
//     setEmailInput("");
//     setMatchingUsers([]);
//   };

//   const removeMember = (member: any, index: number) => {
//     const updatedMembers = [...addedMembers];
//     updatedMembers.splice(index, 1);
//     setAddedMembers(updatedMembers);
//   };
//   const handleSaveMembers = async () => {
//     if (teamName === "") {
//       setTeamNameError(true);
//       return;
//     } else if (addedMembers.length === 0) {
//       setTeamMemberError(true);
//       return;
//     } else {
//       // Fetch selected user details based on `id`
//       const { data: fetchedMembers, error: fetchError } = await supabase
//         .from("users")
//         .select("*")
//         .in(
//           "id",
//           addedMembers.map((member) => member.id)
//         );

//       if (fetchError) {
//         console.error("Error fetching members:", fetchError);
//         return;
//       }

//       // Check if there are any members already in the team
//       const { data: existingTeam, error: checkError } = await supabase
//         .from("teams")
//         .select("*")
//         .eq("team_name", teamName);

//       if (checkError) {
//         console.error("Error checking existing team:", checkError);
//         return;
//       }

//       if (existingTeam && existingTeam.length > 0) {
//         console.log("Team already exists with these members:", existingTeam);
//         notify("Team already exists with these members", false);
//         return;
//       }

//       try {
//         // Insert selected user details as array of objects into the `teams` table
//         const { data: insertedData, error: insertError } = await supabase
//           .from("teams")
//           .insert({
//             team_name: teamName,
//             members: fetchedMembers.map((member) => ({
//               id: member.id,
//               name: member.username, // Assuming `name` is a field in your `users` table
//               role: member.role,
//               department: member.department,
//               designation: member.designation,
//               email: member.email, // Assuming `email` is a field in your `users` table
//               entity_name: member.entity_name,
//             })),
//             space_id: spaceId,
//           });

//         if (insertError) {
//           console.error("Error saving members:", insertError);
//           return;
//         }
//         setTeamName("");
//         setAddedMembers([]);
//         setTeamNameError(false);
//         setTeamMemberError(false);
//         setMemberAddDialogOpen(false);

//         notify("Members saved successfully", true);
//       } catch (err) {
//         console.error("Unexpected error:", err);
//       }
//     }
//   };

//   const handleDeleteTeam = async (teamId: number) => {
//     try {
//       const { error } = await supabase.from("teams").delete().eq("id", teamId);
//       if (error) {
//         console.error("Error deleting team:", error);
//         return;
//       }
//       // setTeamNameDialogOpen(false);
//       fetchTeams();
//     } catch (error) {
//       console.error("Error deleting team:", error);
//     }
//   };

//   const handleClose = () => {
//     setTeamName("");
//     setAddedMembers([]);
//     setTeamNameError(false);
//     setTeamMemberError(false);
//   };

//   useEffect(() => {
//     document.addEventListener("keydown", handleKeyDown);
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [highlightedIndex, matchingUsers]);
//   const handleKeyDown = (e: KeyboardEvent) => {
//     if (matchingUsers.length === 0) return;

//     if (e.key === "ArrowDown") {
//       // Move highlight down
//       setHighlightedIndex((prevIndex) =>
//         prevIndex < matchingUsers.length - 1 ? prevIndex + 1 : 0
//       );
//     } else if (e.key === "ArrowUp") {
//       // Move highlight up
//       setHighlightedIndex((prevIndex) =>
//         prevIndex > 0 ? prevIndex - 1 : matchingUsers.length - 1
//       );
//     } else if (e.key === "Enter" && highlightedIndex >= 0) {
//       // Select highlighted user on Enter
//       handleUserSelect(matchingUsers[highlightedIndex]);
//     }
//   };

//   useEffect(() => {
//     fetchTeams();
//   }, [spaceId]);
//     return(
//         <>

//         {teams.length > 0 ? (
//                   teams.map((team: any) => (
//                     <CarouselItem
//                       key={team.id}
//                       className="w-[339px] h-auto min-h-[200px] basis-[28%]"
//                     >
//                       <>
//                         <Card>
//                           <CardContent className="p-[18px] w-full h-full">
//                             <div className="flex justify-between items-center">
//                               <p className="text-lg font-semibold text-black font-geist">
//                                 {team.team_name}
//                               </p>
//                               <Trash2
//                                 size={20}
//                                 className="cursor-pointer"
//                                 onClick={() => handleDeleteTeam(team.id)}
//                               />
//                             </div>
//                             <div className="py-2">
//                               <label
//                                 htmlFor="name"
//                                 className="text-sm text-[#111928] font-medium"
//                               >
//                                 Team Name
//                               </label>
//                               <Input
//                                 id="name"
//                                 placeholder=""
//                                 defaultValue={team.team_name}
//                                 className="text-gray-500 mt-1.5 py-3 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
//                               />

//                               <div className="mt-8 relative">
//                                 {matchingUsers.length > 0 &&
//                                   emailInput.length > 0 &&
//                                   !noUserFound && (
//                                     <div className="absolute bottom-[-28px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
//                                       {matchingUsers.length > 0 && (
//                                         <ul>
//                                           {matchingUsers.map((user, index) => (
//                                             <li
//                                               key={user.id}
//                                               className={`p-2 cursor-pointer ${
//                                                 index === highlightedIndex
//                                                   ? "bg-gray-200"
//                                                   : "hover:bg-gray-100"
//                                               }`}
//                                               onClick={() =>
//                                                 handleUserSelect(user)
//                                               }
//                                               onMouseEnter={() =>
//                                                 setHighlightedIndex(index)
//                                               }
//                                             >
//                                               {user.email}
//                                             </li>
//                                           ))}
//                                         </ul>
//                                       )}
//                                     </div>
//                                   )}
//                                 {noUserFound && (
//                                   <div className="absolute bottom-[-28px] max-h-[160px] h-auto overflow-y-auto w-full bg-white border border-gray-300 rounded-md">
//                                     <ul>
//                                       <li className="p-2 cursor-pointer hover:bg-gray-100">
//                                         No User Found
//                                       </li>
//                                     </ul>
//                                   </div>
//                                 )}
//                               </div>

//                               <div>
//                                 <label
//                                   htmlFor="members"
//                                   className="text-sm text-[#111928] font-medium"
//                                 >
//                                   Members
//                                 </label>
//                                 <Input
//                                   autoComplete="off"
//                                   id="members"
//                                   placeholder="Add guest email"
//                                   className="text-gray-500 mt-1.5 h-12 px-2 bg-gray-50 border border-gray-300 rounded-md focus-visible:ring-transparent"
//                                   onChange={getUserData}
//                                 />
//                               </div>

//                               {addedMembers.length > 0 && (
//                                 <div className="mt-2 p-2 flex flex-wrap items-center gap-2 w-full border border-gray-300 rounded-md">
//                                   {addedMembers.map((member, index) => (
//                                     <div
//                                       key={member.id}
//                                       className="flex justify-between items-center gap-2 py-1 px-2 w-full text-sm text-gray-500"
//                                     >
//                                       <div className="flex items-center gap-1">
//                                         {/* <Image
//                             src="/public/images/Subtract.png"
//                             alt="user image"
//                             width={36}
//                             height={36}
//                             className="w-6 h-6 rounded-full"
//                           /> */}
//                                         <span>
//                                           {member.username || member.name}
//                                         </span>
//                                       </div>
//                                       <span
//                                         className={`${
//                                           member.role === "superadmin"
//                                             ? "text-[#0E9F6E]"
//                                             : "text-gray-500"
//                                         }`}
//                                       >
//                                         {member.designation?.length > 25
//                                           ? `${member.designation?.slice(
//                                               0,
//                                               26
//                                             )}...`
//                                           : member.designation}
//                                       </span>
//                                       <button
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           removeMember(member, index);
//                                         }}
//                                         className="focus:outline-none space_delete_button text-gray-400"
//                                       >
//                                         <Trash2
//                                           className="text-black"
//                                           size={18}
//                                         />
//                                       </button>
//                                     </div>
//                                   ))}
//                                 </div>
//                               )}
//                             </div>
//                             {/* <div className="border border-gray-500 rounded-lg w-[100%] pb-3 h-auto pt-3">
                              
//                             </div> */}

//                             <div className="flex items-center justify-between w-full">
//                               <Button
//                                 type="submit"
//                                 variant={"outline"}
//                                 className="w-[120px] border border-gray-200 text-gray-800 font-medium"
//                                 onClick={handleClose}
//                               >
//                                 Cancel
//                               </Button>
//                               <Button
//                                 type="submit"
//                                 className="w-[120px] bg-primaryColor-700 hover:bg-blue-600 text-white"
//                                 onClick={handleSaveMembers}
//                               >
//                                 Save
//                               </Button>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       </>
//                     </CarouselItem>
//                   ))
//                 ) : (
//                   <div className="w-full min-h-[80vh] flex justify-center items-center">
//                     <p className="text-lg font-semibold">No teams found</p>
//                   </div>
//                 )}


//         </>
//     )
// }

