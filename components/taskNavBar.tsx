"use client";
import { RiBarChartHorizontalLine } from "react-icons/ri";
import Image from "next/image";
import { FaCheck } from "react-icons/fa6";
import { useGlobalContext } from "@/context/store";
import { useState, useEffect } from "react";
import profile from "@/public/images/img-placeholder.svg";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Command, CommandList } from "@/components/ui/command";
import { supabase } from "@/utils/supabase/supabaseClient";

const TaskNavBar = () => {
  const { userId } = useGlobalContext();
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [spacesList, setSpacesList] = useState<string[]>([]);

  // Fetch spaces from Supabase
  const fetchSpaces = async () => {
    const { data, error } = await supabase
      .from("spaces")
      .select("space_name")
      .eq("is_deleted", false);

    if (error) {
      console.error("Error fetching spaces:", error);
      return;
    }

    if (data) {
      const spaceNames = data.map((space: { space_name: string }) => space.space_name);
      setSpacesList(spaceNames);
      if (spaceNames.length > 0) {
        setSelectedSpace(spaceNames[0]); // Set the first space as the default selected space
      }
    }
  };

  useEffect(() => {
    fetchSpaces(); // Fetch spaces when the component mounts
  }, []);

  const handleSelected = (space: string) => {
    setSelectedSpace(space);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <header className="flex justify-between items-center bg-navbg p-[18px] ">
        {/* Drawer Trigger */}
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger onClick={() => setIsDrawerOpen(true)}>
            <div className="flex w-10 h-10 justify-center items-center rounded-[10px] border border-zinc-300 bg-bgwhite">
              <RiBarChartHorizontalLine className="text-black h-6 w-6" />
            </div>
          </DrawerTrigger>

          {/* Drawer Content */}
          <DrawerContent className="h-[70%]">
            <DrawerTitle className="pt-[18px] px-5">Spaces</DrawerTitle>

            <Command>
              <CommandList>
                <ul className="mt-4 space-y-5 px-5 pt-3">
                  {spacesList.map((space) => (
                    <li
                      key={space}
                      onClick={() => handleSelected(space)}
                      className={`flex items-center border-b-[1px] border-zinc-300 cursor-pointer ${
                        selectedSpace === space ? "text-zinc-950 font-semibold" : "text-blackish"
                      }`}
                    >
                      <span className="w-4 h-4 mr-2 flex justify-center items-center">
                        {selectedSpace === space ? (
                          <FaCheck className="text-blackish" />
                        ) : (
                          <span className="w-4 h-4" />
                        )}
                      </span>
                      <p className="text-lg font-inter text-black pt-[10px] pr-[10px]">{space}</p>
                    </li>
                  ))}
                </ul>
              </CommandList>
            </Command>
          </DrawerContent>
        </Drawer>

        {/* Space Title */}
        <div className="w-[180px] h-6 text-center">
          <h2 className="text-lg text-blackish text-center">{selectedSpace}</h2>
        </div>

        {/* Profile Image */}
        <Image
          src={userId?.profile_image || profile}
          alt="Profile"
          className="rounded-full"
          width={40}
          height={40}
        />
      </header>
    </>
  );
};

export default TaskNavBar;
