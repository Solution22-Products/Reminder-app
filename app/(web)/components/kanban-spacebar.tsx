"use client";

import { useEffect, useState } from "react";
import { Carousel1, CarouselContent1, CarouselItem1 } from "./webCarousel";
import { useGlobalContext } from "@/context/store";
import CreateSpaceAndTeam from "@/components/createSpaceAndTeam";

interface NavbarProps {
  spaces: any[];
  selectedSpaceId?: string | null;
  onSpaceSelect?: (spaceId: string) => void;
  teams: any[];
}

const KanbanSpacebar = ({
  spaces,
  selectedSpaceId,
  onSpaceSelect,
  teams,
}: NavbarProps) => {
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(
    selectedSpaceId || (spaces.length > 0 ? spaces[0].id : null)
  );
  const { userId: loggedUserData } = useGlobalContext();
  const [spaceTrigger, setSpaceTrigger] = useState(false);

  const handleSpaceClick = (spaceId: string) => {
    setActiveSpaceId(spaceId);
    if (onSpaceSelect) {
      onSpaceSelect(spaceId);
    }
    const a = teams.filter((team) => team.space_id === selectedSpaceId)
    console.log(a);
  };

  useEffect(() => {
    setActiveSpaceId(
      selectedSpaceId || (spaces.length > 0 ? spaces[0].id : null)
    );
  }, [selectedSpaceId, spaces]);

  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center overflow-x-auto hide-scrollbar bg-[#E2E8F0] p-1.5 rounded-sm">
        {spaces.length === 0 ? (
          <p className="text-sm text-gray-500 p-2">No spaces available</p>
        ) : (
          spaces.map((space: any) => (
            <div
              key={space.id}
              onClick={() => handleSpaceClick(space.id)}
              className={`flex items-center capitalize gap-1 px-3 py-1.5 cursor-pointer text-sm whitespace-nowrap rounded-sm ${
                activeSpaceId === space.id
                  ? "bg-white text-zinc-950 font-medium"
                  : "text-[#606267]"
              }`}
            >
              {/* {space.display.length > 18 ? (
                <p>{space.display.slice(0, 18) + "..."}</p>
              ) : (
                <p>{space.display}</p>
              )} */}
              {space.display ? (
                <>
                  {space.display.length > 18 ? (
                <p>{space.display.slice(0, 18) + "..."}</p>
              ) : (
                <p>{space.display}</p>
              )}
                </>
              ) : (
                <>
                  {space.space_name.length > 18 ? (
                <p>{space.space_name.slice(0, 18) + "..."}</p>
              ) : (
                <p>{space.space_name}</p>
              )}
                </>
              )}
            </div>
          ))
        )}
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
  );
};

export default KanbanSpacebar;
