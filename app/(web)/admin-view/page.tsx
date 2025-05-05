"use client"
import ChatLeftSpace from "@/components/chat-left-space"
import ChatRightSpace from "@/components/chat-right-space"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase/supabaseClient"
import { useGlobalContext } from "@/context/store"

const AdminView = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const { userId: currentUser } = useGlobalContext()

  // State to track selected IDs
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // State to store data
  const [spaces, setSpaces] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [userMembers, setUserMembers] = useState<any[]>([])

  // Fetch all data at the parent level
  const fetchAllData = async () => {
    setDataLoading(true)
    try {
      const [spacesResponse, teamsResponse, membersResponse] = await Promise.all([
        supabase.from("spaces").select("*").eq("is_deleted", false),
        supabase.from("teams").select("*").eq("is_deleted", false),
        supabase.from("users").select("*").eq("is_deleted", false),
      ])
  
      const spacesData = spacesResponse.data || []
      const teamsData = teamsResponse.data || []
      const membersData = membersResponse.data || []
  
      setSpaces(spacesData)
      setTeams(teamsData)
      setMembers(membersData)
  
      // Set default selections
      let defaultSpace : any = null
  
      if (spacesData.length > 0) {
        if (currentUser?.role === "owner") {
          defaultSpace = spacesData[0]
          setSelectedSpaceId(defaultSpace.id)
        } else {
          const userSpaces = spacesData.filter((space) => {
            const teamsInSpace = teamsData.filter((team) => team.space_id === space.id)
            const userMembers = teamsInSpace.map((team) => team.members.map((member: any) => member.username));
            setUserMembers(userMembers)
            console.log("teamsInSpace ", userMembers)
            return teamsInSpace.some((team) =>
              team.members?.some((member: any) => member.entity_name === currentUser?.entity_name)
            )
          })
  
          if (userSpaces.length > 0) {
            defaultSpace = userSpaces[0]
            setSelectedSpaceId(defaultSpace.id)
          }
        }
  
        if (defaultSpace) {
          const teamsForSpace = teamsData.filter((team) => team.space_id === defaultSpace.id)
          if (teamsForSpace.length > 0) {
            setSelectedTeamId(teamsForSpace[0].id)
          }
        }
      }
  
      if (membersData.length > 0) {
        setSelectedUserId(membersData[0].id)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [currentUser])

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth <= 992) {
        router.push("/home")
        setLoading(false)
      } else {
        setLoading(false)
      }
    }

    checkScreenSize()

    // Add resize listener
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [router])

  // Handlers for selection
  const handleSelectSpace = (spaceId: string) => {
    setSelectedSpaceId(spaceId)

    // When space changes, update team selection to first team in that space
    const teamsForSpace = teams.filter((team) => team.space_id === spaceId)
    if (teamsForSpace.length > 0) {
      setSelectedTeamId(teamsForSpace[0].id)
    } else {
      setSelectedTeamId(null)
    }
  }

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId)
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="w-full min-h-[100dvh] h-full flex">
      <div className="w-[75%]">
        <ChatLeftSpace
          selectedSpaceId={selectedSpaceId}
          selectedTeamId={selectedTeamId}
          selectedUserId={selectedUserId}
          spaces={spaces}
          teams={teams}
          members={members}
          isLoading={dataLoading}
        />
      </div>
      <div className="w-[25%] h-[100dvh] overflow-y-auto flex flex-col space-y-5 justify-start border-l border-gray-300">
        <ChatRightSpace
          onSelectSpace={handleSelectSpace}
          onSelectTeam={handleSelectTeam}
          onSelectUser={handleSelectUser}
          selectedSpaceId={selectedSpaceId}
          selectedTeamId={selectedTeamId}
          selectedUserId={selectedUserId}
          spaces={spaces}
          teams={teams}
          members={members}
          userMembers={userMembers}
          isLoading={dataLoading}
        />
      </div>
    </div>
  )
}

export default AdminView
