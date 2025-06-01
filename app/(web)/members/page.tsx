"use client";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import WebNavbar from "@/app/(web)/components/navbar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, ClipboardPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase/supabaseClient";
import { updateMetadata } from "./action";
import Link from "next/link";
import Image from "next/image";
import "./style.css";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useGlobalContext } from "@/context/store";
import { Input } from "@/components/ui/input";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import Notification from "../components/notificationComp";

interface Member {
  id: string;
  username: string;
  profile_image: string;
  designation: string;
  email: string;
  mobile: string;
  role: string;
  password: string;
}

// const formSchema = z.object({
//   picture: z
//     .any()
//     .refine(
//       (file) => file?.length === 1,
//       "*Supported image formats include JPEG, PNG"
//     )
//     .refine(
//       (file) => file[0]?.type === "image/png" || file[0]?.type === "image/jpeg",
//       "Must be a png or jpeg"
//     )
//     .refine((file) => file[0]?.size <= 5000000, "Max file size is 5MB."),
//   companyName: z.string().min(2, {
//     message: "Company name is not recognised. Please try again.",
//   }),
//   email: z.string().email({
//     message: "Please enter a valid email address",
//   }),
//   mobile: z
//     .string()
//     .min(9, {
//       message: "Please enter a valid mobile number with at least 9 digits",
//     })
//     .max(11, {
//       message: "Please enter a valid mobile number with no more than 11 digits",
//     })
//     .regex(/^[0-9]+$/, {
//       message: "Please enter a valid mobile number with no special characters",
//     }),
// });

const Members = () => {
  const { userId } = useGlobalContext();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoader, setSaveLoader] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);
  const [saveLoaderAccess, setSaveLoaderAccess] = useState(false);
  const [saveLoaderSpaceSetting, setSaveLoaderSpaceSetting] = useState(false);

  // Fetch members from Supabase
  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("is_deleted", false);
    if (error) {
      console.error("Error fetching members:", error.message);
    } else {
      setMembers(data || []);
    }
  };
  // const handleAddSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     let imageUrl = editData.profile_image;

  //     // Upload the image to Supabase Storage
  //     if (file) {
  //       const { data: uploadData, error: uploadError } = await supabase.storage
  //         .from("profiles")
  //         .upload(`profiles/${file.name}`, file, {
  //           cacheControl: "3600",
  //           upsert: true,
  //         });

  //       if (uploadError)
  //         throw new Error(`Image upload failed: ${uploadError.message}`);

  //       const { data: publicUrlData } = supabase.storage
  //         .from("profiles")
  //         .getPublicUrl(`profiles/${file.name}`);
  //       imageUrl = publicUrlData?.publicUrl || "";
  //     }

  //     if (editData.id) {
  //       // Update existing member
  //       const { error: updateError } = await supabase
  //         .from("users")
  //         .update({
  //           username: editData.username,
  //           profile_image: imageUrl,
  //           designation: editData.designation,
  //           email: editData.email,
  //           mobile: editData.mobile,
  //           role: editData.role,
  //         })
  //         .eq("id", editData.id);

  //       if (updateError)
  //         throw new Error(`Update failed: ${updateError.message}`);
  //     } else {
  //       // Add new member
  //       const { error: insertError } = await supabase.from("users").insert({
  //         username: editData.username,
  //         profile_image: imageUrl,
  //         designation: editData.designation,
  //         email: editData.email,
  //         mobile: editData.mobile,
  //         role: editData.role,
  //       });

  //       if (insertError)
  //         throw new Error(`Insert failed: ${insertError.message}`);
  //     }

  //     // Re-fetch members to update the list
  //     await fetchMembers();
  //   } catch (error: any) {
  //     console.error("Error during submission:", error.message);
  //   }
  // };

  const handleDelete = async (memberId: string) => {
    console.log("member id ", memberId);
    try {
      // Delete the member from the database
      const { error } = await supabase
        .from("users")
        .update({ is_deleted: true })
        .eq("id", memberId);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
      updateMetadata("Inactive", memberId);
      // Remove the member from the state to update the UI
      setMembers((prevMembers) =>
        prevMembers.filter((member) => member.id !== memberId)
      );
      setIsDeleteDialogOpen(false);
      toast({
        title: "Deleted Successfully!",
        description: "Member deleted successfully!",
        action: (
          <ToastAction
            altText="Undo"
            onClick={() => handleMemberUndo(memberId)}
          >
            Undo
          </ToastAction>
        ),
      });
    } catch (error: any) {
      console.error("Error during deletion:", error.message);
    }
  };

  const handleMemberUndo = async (memberId: string) => {
    try {
      // Update the member in the database to undo the deletion
      const { error } = await supabase
        .from("users")
        .update({ is_deleted: false })
        .eq("id", memberId);

      if (error) {
        throw new Error(`Undo failed: ${error.message}`);
      }

      // Re-fetch members to update the list
      await fetchMembers();
      updateMetadata("Active", memberId);
    } catch (error: any) {
      console.error("Error during undo:", error.message);
    }
  };

  useEffect(() => {
    const redirectToTask = () => {
      router.push("/home");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
      setLoading(false);
      return;
    } else {
      router.push("/members");
      setLoading(false);
    }
    fetchMembers(); // Load members on component mount
  }, [router]);

  if (loading) {
    return (
      <div className="loader w-full h-screen flex justify-center items-center">
        <div className="flex items-center gap-1">
          <p className="w-5 h-5 bg-black rounded-full animate-bounce"></p>
          <p className="text-2xl font-bold">Loading...</p>
        </div>
      </div>
    ); // Simple loader UI
  }

  if (userId?.role === "User") {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="https://res.cloudinary.com/razeshzone/image/upload/v1588316204/house-key_yrqvxv.svg"
            alt="denied"
            width={200}
            height={200}
            className="w-[100px] h-[100px]"
          />
          <h1 className="text-9xl font-bold">403</h1>
          <p className="text-2xl font-bold">Access Denied!</p>
          <h4 className="text-sm text-gray-500 text-center font-inter">
            You don’t have access to this area of application. Speak <br /> to
            your administrator to unblock this feature. <br /> You can go back
            to{" "}
            <Link
              href="/dashboard"
              className="text-primaryColor-700 underline font-bold"
            >
              Dashboard
            </Link>
          </h4>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 w-full">
        <Notification />
        <div className="px-3 w-full h-[65px] flex bg-white rounded-[12px] border-none items-center max-w-full">
          <div className="flex justify-between w-full">
            <div className="flex space-x-[10px]">
              <button
                onClick={() => {
                  setSaveLoaderSpaceSetting(true);
                  setTimeout(() => {
                    router.push("/spaceSetting");
                    setSaveLoaderSpaceSetting(false);
                  }, 1000);
                }}
                disabled={saveLoaderSpaceSetting}
                className="rounded-lg font-inter font-medium text-sm border w-[134px] h-[41px] text-gray-400"
              >
                {saveLoaderSpaceSetting ? (
                  <svg
                    className="animate-spin h-5 w-5 m-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#1A56DB"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-100"
                      fill="#1A56DB"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Space Settings"
                )}
              </button>
              <button className="rounded-lg text-sm font-inter font-medium border w-[104px] h-[41px] text-white hover:bg-blue-600 hover:text-white bg-primaryColor-700">
                Members
              </button>
              <button
                onClick={() => {
                  setSaveLoaderAccess(true);
                  setTimeout(() => {
                    router.push("/access");
                    setSaveLoaderAccess(false);
                  }, 1000);
                }}
                disabled={saveLoaderAccess}
                className="rounded-lg font-inter font-medium text-sm border w-[89px] h-[41px] text-gray-400"
              >
                {saveLoaderAccess ? (
                  <svg
                    className="animate-spin h-5 w-5 m-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#1A56DB"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-100"
                      fill="#1A56DB"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Access"
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-5">
          <div className="relative">
            <Search
              size={14}
              className="absolute top-3.5 left-2.5 text-gray-500"
            />
            <Input
              placeholder="Search"
              value={searchValue}
              className="w-[384px] h-[42px] pl-8 pr-7 bg-white shadow-none font-medium justify-start gap-3 rounded-[10px] flex items-center"
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <X
              size={14}
              className="absolute top-3.5 right-2.5 cursor-pointer text-gray-500"
              onClick={() => setSearchValue("")}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* <Button className="w-[149px] h-[41px] space-x-2 px-5 py-[2.5px] border bg-[#E5ECF6] border-gray-300 text-sm text-gray-800 rounded-lg font-inter font-normal gap-[10px] flex items-center hover:bg-gray-200  ">
              <Upload className="h-5 w-5 text-gray-900" />
              Upload CSV
            </Button> */}
            <Button
              className="rounded-lg text-sm font-medium font-inter  text-white border flex items-center max-w-[142px] w-[165px] h-[41px] bg-primaryColor-700 space-x-2  px-5 py-[2.5px]  hover:bg-blue-600 cursor-pointer"
              onClick={() => {
                setSaveLoader(true);
                setTimeout(() => {
                  router.push("/add-member");
                  setSaveLoader(false);
                }, 1000);
              }}
              disabled={saveLoader}
            >
              {saveLoader ? (
                <svg
                  className="animate-spin h-6 w-6"
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
                <>
                  <ClipboardPlus className="h-5 w-5" />
                  Add New User
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="pt-[18px] pb-[18px]">
          <Table className=" block w-full h-[calc(100vh-175px)] overflow-y-auto playlist-scroll bg-white rounded-[10px] font-inter">
            <TableHeader className="sticky top-0 bg-white z-0 ">
              <TableRow>
                <TableHead className="w-[28%] px-4 py-4 text-sm font-inter font-semibold text-gray-500">
                  NAME
                </TableHead>
                <TableHead className=" w-[25%] px-4 py-4 text-sm font-inter font-semibold text-gray-500 ">
                  DESIGNATION
                </TableHead>
                <TableHead className="  w-[25%] px-4 py-4 text-sm font-inter font-semibold text-gray-500 ">
                  EMAIL
                </TableHead>
                <TableHead className=" w-[25%] px-4 py-4  text-sm  font-inter font-semibold text-gray-500">
                  MOBILE
                </TableHead>
                <TableHead className=" w-[30%] px-4 py-4  text-sm  font-inter font-semibold text-gray-500">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.filter(
                (member) =>
                  member.username
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                  member.designation
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                  member.email
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                  member.mobile.includes(searchValue)
              ).length > 0 ? (
                members
                  .filter(
                    (member) =>
                      member.username
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                      member.designation
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                      member.email
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                      member.mobile.includes(searchValue)
                  )
                  .map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="px-4 py-4 text-sm font-semibold text-gray-900">
                        <div className="flex items-center space-x-3">
                          {member.profile_image && (
                            <img
                              src={member.profile_image}
                              alt={`${member.username}'s profile`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span className="text-gray-900 font-inter">
                            {member.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-inter font-normal  text-gray-500">
                        {member.designation}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-inter font-normal  text-gray-500">
                        {member.email}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm font-inter font-normal  text-gray-500">
                        {member.mobile}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="p-2 rounded hover:bg-gray-100"
                                  onClick={() => {
                                    setCurrentEditingId(member.id); // Set the current editing space ID
                                    setTimeout(() => {
                                      router.push(`/edit-member/${member.id}`);
                                      setCurrentEditingId(null); // Reset after redirection
                                    }, 2000);
                                  }}
                                  disabled={currentEditingId === member.id}
                                >
                                  {currentEditingId === member.id ? (
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
                                        stroke="#1A56DB"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-100"
                                        fill="#1A56DB"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  ) : (
                                    <Pencil className="h-5 w-5 " />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  <Dialog
                                    open={isDeleteDialogOpen}
                                    onOpenChange={setIsDeleteDialogOpen}
                                  >
                                    <DialogTrigger>
                                      <button
                                        className="p-2 rounded hover:bg-gray-100"
                                        onClick={() => {
                                          setMemberToDelete(member.id);
                                          setIsDeleteDialogOpen(true);
                                        }}
                                        disabled={
                                          currentEditingId === member.id
                                        }
                                      >
                                        <Trash2 className="h-5 w-5" />
                                      </button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-[425px]">
                                      <DialogHeader>
                                        <DialogTitle>Delete Space</DialogTitle>
                                        <DialogDescription>
                                          Do you want to delete{" "}
                                          <span className="font-bold">
                                            {currentEditingId === member.id
                                              ? member.username
                                              : "this member"}
                                          </span>
                                          ?
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="flex justify-center items-center w-full gap-4 mt-4">
                                        <Button
                                          variant="outline"
                                          className="w-1/3"
                                          onClick={() =>
                                            setIsDeleteDialogOpen(false)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          className="bg-red-600 hover:bg-red-500 w-1/3"
                                          onClick={() => {
                                            if (memberToDelete) {
                                              handleDelete(memberToDelete);
                                            }
                                          }}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center font-inter font-medium  text-gray-500 text-base py-4"
                  >
                    Members not found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};
export default Members;
// router.push(`/edit-member/${member.id}`);
