"use client";
import SpaceBar from "../components/spacebar";
import "./style.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGlobalContext } from "@/context/store";
import NewNavbar from "@/components/newNavbar";
import { supabase } from "@/utils/supabase/supabaseClient";
import KanbanSpacebar from "../components/kanban-spacebar";

const CanbanDashboard = () => {
  const { userId: currentUser } = useGlobalContext();
  const route = useRouter();
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [userMembers, setUserMembers] = useState<any[]>([]);
  const [userSpace, setUserSpace] = useState<any[]>([]);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [{ data: spacesData }, { data: teamsData }, { data: membersData }] =
        await Promise.all([
          supabase
            .from("spaces")
            .select("*")
            .eq("is_deleted", false)
            .order("space_name", { ascending: true }),
          supabase
            .from("teams")
            .select("*")
            .eq("is_deleted", false)
            .order("team_name", { ascending: false }),
          supabase
            .from("users")
            .select("*")
            .eq("is_deleted", false)
            .eq("role", "User")
            .order("entity_name", { ascending: false }),
        ]);

      if (spacesData) setSpaces(spacesData);
      if (teamsData) setTeams(teamsData);
      if (membersData) setMembers(membersData);

      if (!currentUser) return;

      // Filter matched teams for current user
      const matchedTeams =
        teamsData?.filter((team) => {
          // Include team if no members (length === 0 or undefined), or if it contains currentUser
          return (
            !team.members ||
            team.members.length === 0 ||
            team.members.some(
              (member: any) => member.entity_name === currentUser.entity_name
            )
          );
        }) || [];

      setUserTeams(matchedTeams);
      const uniqueMembers = Array.from(
        new Map(
          matchedTeams
            .flatMap((team) => team.members || [])
            .map((member: any) => [member.entity_name, member])
        ).values()
      );

      // console.log("Unique Members:", uniqueMembers);

      // Find matched spaces
      const matchedSpaceIds = new Set(
        matchedTeams.map((team) => team.space_id)
      );
      const matchedSpaces =
        spacesData?.filter((space) => matchedSpaceIds.has(space.id)) || [];

      // console.log("Matched Spaces:", matchedSpaces);

      const getUniqueItems = (array: any[], key: string) => {
        const seen = new Set();
        return array.filter((item) => {
          const value = item[key];
          if (!seen.has(value)) {
            seen.add(value);
            return true;
          }
          return false;
        });
      };

      const isOwner = currentUser.role === "owner";
      const sourceSpaces: any = isOwner ? spacesData : matchedSpaces;
      const sourceTeams: any = isOwner ? teamsData : matchedTeams;
      const sourceUsers: any = isOwner ? membersData : uniqueMembers;

      const uniqueSpaces = getUniqueItems(
        sourceSpaces.map((space: any) => ({
          id: space.id,
          display: space.space_name,
        })),
        "display"
      );

      setSpaces(uniqueSpaces);
      setUserSpace(sourceSpaces);
      setUserTeams(sourceTeams);
      setUserMembers(sourceUsers);
      // console.log("Final Spaces Set:", sourceSpaces);

      if (sourceSpaces.length > 0) {
        setSelectedSpaceId(sourceSpaces[0].id); // Set default space
      }

      if (sourceTeams.length > 0) {
        setSelectedTeamId(sourceTeams[0].id); // Set default team
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const redirectToTask = () => {
      route.push("/home");
    };

    if (window.innerWidth <= 992) {
      redirectToTask();
      setLoading(false);
      return;
    } else {
      route.push("/canban-view");
      setLoading(false);
    }
  }, [route]);

  const handleSpaceSelect = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
  };

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

  return (
    <div className="w-full flex flex-col">
      {/* <SpaceBar
       loggedUserData={userId as any}
        /> */}

      <NewNavbar
        selectedSpaceId={""}
        selectedTeamId={""}
        selectedUserId={""}
        selectedTeam={""}
        selectedMember={""}
        name={{ name: "Kanban View", kanban: true }}
        spaces={spaces}
      />
      <KanbanSpacebar
        spaces={spaces}
        teams={teams}
        selectedSpaceId={selectedSpaceId}
        onSpaceSelect={handleSpaceSelect}
      />
    </div>
  );
};

export default CanbanDashboard;
