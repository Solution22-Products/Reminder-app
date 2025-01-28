"use client";

import { RiArrowDropDownLine } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { FaEllipsisH } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import { useState, createContext, useContext } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Command, CommandList } from "@/components/ui/command";

import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalContext } from "@/context/store";

const Teams = [
  "Design Team",
  "Development Team",
  "S.E.O Team",
  "WordPress Team",
  "Management",
  // "Add new Team",
];
const adminTaskStatusOptions = [
  {
    value: "todo",
    label: "todo",
  },
  {
    value: "In progress",
    label: "In progress",
  },
  {
    value: "feedback",
    label: "feedback",
  },
  {
    value: "Completed",
    label: "Completed",
  },
];
const taskStatusOptions = [
  {
    value: "todo",
    label: "todo",
  },
  {
    value: "In progress",
    label: "In progress",
  },
  {
    value: "feedback",
    label: "feedback",
  },
];

const DropDown = () => {
  const router = useRouter();
  const { userId } = useGlobalContext();
  const searchParams = useSearchParams(); // To read current query params

  const [selectedTeam, setSelectedTeam] = useState(
    searchParams.get("team") || Teams[0]
  );
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerOpen1, setIsDrawerOpen1] = useState(false);

  // Update the URL query parameter
  const updateQueryParam = (key: string, value: string) => {
    // Create a new search params object
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value); // Add/update the query param
    } else {
      params.delete(key); // Remove the query param if value is empty
    }

    // Navigate with the updated query string
    router.push(`?${params.toString()}`);
  };

  // const handleSelected = (sort: any) => {
  //   setSelectedSorting(sort);
  //   updateQueryParam("sort", sort || undefined);
  //   console.log("Selected Space:", sort);
  //   setIsDrawerOpen(false);
  // };
  const handleSelect = (team: any) => {
    setSelectedTeam(team);
    updateQueryParam("team", team || undefined);
    console.log("Selected Space:", team);
    setIsDrawerOpen1(false);
  };

  return (
    <>
      <div className="flex  justify-between  ">
        <Drawer open={isDrawerOpen1} onOpenChange={setIsDrawerOpen1}>
          <DrawerTrigger>
            <div className="bg-white py-3  rounded-xl border h-[40px] w-[243px] border-gray-300 px-[18px] flex items-center ">
              <p>{selectedTeam}</p>
              <RiArrowDropDownLine className="w-[18px] h-[18px]  text-black ml-auto  " />
            </div>
          </DrawerTrigger>
          <DrawerContent className="h-[70%]">
            <DrawerTitle className="pt-[18px] px-5">Teams</DrawerTitle>
            <Command>
              <CommandList>
                <ul className="mt-4 space-y-3 py-5 px-5 pt-3">
                  {Teams.map((team) => (
                    <li
                      key={team}
                      onClick={() => handleSelect(team)}
                      className={`flex items-center   border-b-[1px] border-zinc-300 cursor-pointer ${
                        selectedTeam === team
                          ? "text-zinc-950 font-semibold"
                          : "text-blackish"
                      }`}
                    >
                      <span className="w-4 h-4 mr-2 flex justify-center items-center">
                        {selectedTeam === team ? (
                          <FaCheck className="text-blackish" />
                        ) : (
                          <span className="w-4 h-4" />
                        )}
                      </span>
                      <p className="text-sm pt-[12px] pr-[10px] flex items-center ">
                        {team}
                      </p>
                    </li>
                  ))}
                </ul>
              </CommandList>
            </Command>

            {/* <DrawerFooter>
              <button className="mt-[18px] p-2 mb-10 border w-[340px] h-10 border-teal-500 text-teal-500 rounded-lg bg-lightskyblue">
                Manage Teams
              </button>
            </DrawerFooter> */}
          </DrawerContent>
        </Drawer>

        <div className="w-10 h-10">
          <FiSearch className="absolute mt-3 ml-[12px]  text-zinc-500" />
          <input
            type="text"
            className="w-10 h-10  justify-center items-center gap-[6px] rounded-lg border border-zinc-300 bg-white "
          />
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger onClick={() => setIsDrawerOpen(true)}>
            <div className="flex w-10 h-10  p-[8px_12px] justify-center items-center gap-[6px] rounded-lg border border-zinc-300 bg-white">
              <FaEllipsisH className="h-4 w-6" />
            </div>
          </DrawerTrigger>
          <DrawerContent className="h-[70%]">
            <DrawerTitle className="pt-[18px] px-5">Filter</DrawerTitle>
            <Command>
              <CommandList>
                {/* <ul className="mt-4 space-y-5 px-5 pt-3">
                  {filter.map((sort) => (
                    <li
                      key={sort}
                      onClick={() => handleSelected(sort)}
                      className={`flex items-center border-b-[1px] pt-[10px] pr-[10px] border-zinc-300 cursor-pointer 
                        ${selectedSorting === sort
                          ? "text-zinc-950 font-semibold"
                          : "text-blackish"
                        }`}
                    >
                      <span className="w-4 h-4 mr-2 flex justify-center items-center">
                        {selectedSorting === sort ? (
                          <FaCheck className="text-blackish " />
                        ) : (
                          <span className="w-4 h-4" />
                        )}
                      </span>
                      <p className="text-sm pb-1 ">{sort}</p>
                    </li>
                  ))}
                </ul> */}
                <p> {userId?.role}</p>
                <ul className="mt-4 space-y-5 px-5 pt-3">
                  {userId?.role === "owner" &&
                    adminTaskStatusOptions.map((status) => (
                      <li
                        key={status.value}
                        onClick={() => {
                          setSelectedTaskStatus(status.value);
                          setIsDrawerOpen(false); // Close the drawer on selection
                        }}
                        className={`flex items-center border-b-[1px] border-zinc-300 cursor-pointer ${
                          selectedTaskStatus === status.value
                            ? "text-zinc-950 font-semibold"
                            : "text-blackish"
                        }`}
                      >
                        {status.label}
                      </li>
                    ))}

                  {userId?.role === "user" &&
                    taskStatusOptions.map((status: any) => {
                      console.log("Rendering status:", status.label);
                      return (
                        <li
                          key={status.value}
                          onClick={() => {
                            setSelectedTaskStatus(status.value);
                            setIsDrawerOpen(false); // Close the drawer on selection
                          }}
                          className={`flex items-center border-b-[1px] border-zinc-300 cursor-pointer ${
                            selectedTaskStatus === status.value
                              ? "text-zinc-950 font-semibold"
                              : "text-blackish"
                          }`}
                        >
                          {status.label}
                        </li>
                      );
                    })}
                </ul>
              </CommandList>
            </Command>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
};
export default DropDown;
