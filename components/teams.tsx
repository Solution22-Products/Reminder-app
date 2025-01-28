"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/supabaseClient";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export default function Teams() {
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data: teams, error } = await supabase
          .from("teams")
          .select("team_name");

        if (error) {
          throw error;
        }

        if (teams) {
          const names = teams.map(
            (team: { team_name: string }) => team.team_name
          );
          setTeamNames(names);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch team names.");
      }
    };

    fetchTeams();
  }, []); // Dependency array ensures this runs once

  return (
    <>
    <div className="hidden">
      <span>{error}</span>
    </div>
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold font-geist text-black">Teams</h4>
        <p className="text-teal-500  font-geist font-medium  text-sm cursor-pointer">View all</p>
      </div>

      <div className="space-y-1">
        <Carousel opts={{ align: "start" }} className="w-full max-w-sm">
          <div className="flex items-center space-y-3">
            <CarouselContent >
              {teamNames.length > 0 ? (
                teamNames.map((teamName, index) => (
                  <CarouselItem key={index} className="flex-none">
                    <button className="rounded-[10px] border border-teal-500 font-geist bg-white flex items-center justify-center min-w-min h-10 px-4 text-base font-medium text-greyblack">
                      <p>{teamName}</p>
                    </button>
                  </CarouselItem>
                ))
              ) : (
                <p className="text-gray-500">No teams available</p>
              )}
            </CarouselContent>
          </div>
        </Carousel>
      </div>
    </>
  );
}
