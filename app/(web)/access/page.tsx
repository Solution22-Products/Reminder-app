"use client";
import { useEffect, useState } from "react";
import WebNavbar from "../components/navbar";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/supabaseClient";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import "./style.css";
import Image from "next/image";
import Link from "next/link";
import { useGlobalContext } from "@/context/store";

interface employeeData {
  id: string;
  name: string;
  email: string;
  access: {
    space: boolean;
    team: boolean;
    task: boolean;
    all: boolean;
  };
}

const AccessPage = () => {
  const {userId} = useGlobalContext();
  const route = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [employeesData, setEmployeesData] = useState<employeeData[] | null>([]);
  const [saveLoader, setSaveLoader] = useState(false);
  const [cancelLoader, setCancelLoader] = useState(false);
  const[saveLoaderSpaceSetting, setSaveLoaderSpaceSetting] = useState(false);
  const[saveLoaderMember, setSaveLoaderMember] = useState(false);

  const getEmployeesData = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }
    setEmployeesData(
      data.map((emp) => ({
        ...emp,
        access: emp.access || {
          space: false,
          team: false,
          task: false,
          all: false,
        },
      }))
    );
    return data;
  };

  const handleCheckboxChange = (employeeId: number, accessKey: string) => {
    setEmployeesData((prev: any) =>
      prev.map((emp: any) =>
        emp.id === employeeId
          ? {
              ...emp,
              access:
                accessKey === "all"
                  ? // Toggle all checkboxes if "all" is clicked
                    Object.fromEntries(
                      Object.keys(emp.access).map((key) => [key, !emp.access[accessKey]])
                    )
                  : // Toggle individual checkbox if not "all"
                    { ...emp.access, [accessKey]: !emp.access[accessKey] },
            }
          : emp
      )
    );
  };

  const handleUpdate = async () => {
    setSaveLoader(true);
    try {
      const updates = employeesData?.map((emp: any) => ({
        id: emp.id,
        access: emp.access,
      }));

      const { error } = await supabase.from("users").upsert(updates);

      if (error) {
        console.error("Error updating access:", error);
        setSaveLoader(false);
        return;
      }
      setSaveLoader(false);
      toast({
        title: "Access Updated Successfully!",
        description: "Access has been updated successfully.",
      });
    } catch (err) {
      console.error("Error during update:", err);
      setSaveLoader(false);
    }
  };

  const filteredEmployees: any = employeesData?.filter((employee: any) =>
    employee.username.toLowerCase().includes(searchValue.toLowerCase())
  );

  useEffect(() => {
    const redirectToTask = () => {
      route.push("/home");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
      setLoading(false);
      return;
    } else {
      route.push("/access");
      setLoading(false);
    }

    getEmployeesData();
  }, [route]);

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
      <Toaster />
      <WebNavbar
        loggedUserData={userId as any}
        navbarItems={false}
        searchValue=""
        setSearchValue=""
        // teamFilterValue=""
        setTeamFilterValue=""
        // taskStatusFilterValue=""
        setTaskStatusFilterValue=""
        setDateFilterValue=""
        filterFn=""
        filterDialogOpen={''}
        setFilterDialogOpen={''}
        teamResetFn = {() => {}}
        notificationTrigger=''
        setNotificationTrigger=''
        allTasks={[]}
      />
      <div className="px-3">
        <div className="px-3 w-full h-[65px] flex bg-white rounded-[12px] border-none items-center max-w-full">
          <div className="flex justify-between w-full">
            <div className="flex space-x-[10px]">
            <button
               onClick={() => {
                setSaveLoaderSpaceSetting(true);
                setTimeout(() => {
                  route.push("/spaceSetting");
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
            <button
               onClick={() => {
                setSaveLoaderMember(true);
                setTimeout(() => {
                  route.push("/members");
                  setSaveLoaderMember(false);
                }, 1000);
              }}
              disabled={saveLoaderMember}
              className="rounded-lg font-inter font-medium text-sm border w-[104px] h-[41px] text-gray-400"
            >
              {saveLoaderMember ? (
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
                "Members"
              )}
            </button>
              <button className="rounded-lg text-sm font-medium font-inter border w-[89px] h-[41px] hover:bg-blue-600 bg-primaryColor-700 text-white">
                Access
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
            <button
              onClick={() => {
                setCancelLoader(true);
                setTimeout(() => {
                  route.push("/dashboard");
                  setCancelLoader(false);
                }, 2000);
              }}
              disabled={cancelLoader}
              className="w-[90px] h-10 border border-gray-300 rounded-md hover:bg-gray-200 text-sm text-center"
            >
              {cancelLoader ? (
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
                "Cancel"
              )}
            </button>
            <Button
              onClick={handleUpdate}
              disabled={saveLoader}
              className="bg-primaryColor-700 hover:bg-primaryColor-700 text-white hover:text-white w-[90px] h-10"
            >
              {saveLoader ? (
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
                    className="opacity-100"
                    fill="#fff"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </div>

        <Table className="block w-[97vw] h-[calc(100vh-228px)] overflow-y-auto playlist-scroll bg-white rounded-[10px] my-5 font-inter">
          <TableHeader className="sticky top-0 bg-white">
            <TableRow>
              <TableHead className="text-left w-[18%] pl-4 text-sm font-inter font-semibold text-gray-500 py-5">
                NAME
              </TableHead>
              <TableHead className="text-left w-[20%] text-sm font-semibold font-inter text-gray-500 py-5">
                DESIGNATION
              </TableHead>
              <TableHead className="text-center w-[20%] text-sm font-semibold font-inter text-gray-500 py-5">
                SPACE CRUD
              </TableHead>
              <TableHead className="text-center w-[20%] text-sm font-semibold font-inter text-gray-500 py-5">
                TEAM CRUD
              </TableHead>
              <TableHead className="text-center w-[20%] text-sm font-semibold font-inter text-gray-500 py-5">
                TASK CRUD
              </TableHead>
              <TableHead className="text-center w-[20%] pr-4 text-sm font-semibold font-inter text-gray-500 py-5">
                ALL
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees?.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell className="pl-4 text-sm font-semibold font-inter text-gray-900 capitalize py-4">
                    {employee.username}
                  </TableCell>
                  <TableCell className="text-sm font-inter font-normal text-gray-500">
                    {employee.designation || "N/A"}
                  </TableCell>
                  {["space", "team", "task", "all"].map((accessKey) => (
                    <TableCell key={accessKey} className="text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={employee.access[accessKey]}
                        disabled={
                          employee.role === "owner" &&
                          (accessKey === "all" ||
                            accessKey === "space" ||
                            accessKey === "team" ||
                            accessKey === "task")
                        }
                        onChange={() =>
                          handleCheckboxChange(employee.id, accessKey)
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center font-inter font-medium  text-gray-500 text-base py-4"
                >
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AccessPage;
