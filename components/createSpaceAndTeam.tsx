"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/utils/supabase/supabaseClient";
import { BadgePlus, CircleX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

const CreateSpaceAndTeam = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamTags, setTeamTags] = useState<string[]>([]);

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && teamName.trim()) {
      e.preventDefault();
      addTeamTag();
    }
  };

  const addTeamTag = () => {
    if (teamName.trim()) {
      setTeamTags([...teamTags, teamName.trim()]);
      setTeamName("");
    }
  };

  const removeTeamTag = (index: number) => {
    setTeamTags(teamTags.filter((_, i) => i !== index));
  };

  const fetchSpaces = async () => {
    try {
      const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching spaces:", error);
        return;
      }
      console.log(data, "data");
    } catch (err) {
      console.error("Error fetching spaces:", err);
    }
  }

  const handleCreateSpace = async () => {
    console.log("Space Name:", spaceName);
    console.log("Team Name:", teamName);
    console.log("Team Tags:", teamTags);
    if (!spaceName) {
      toast({
        title: "Error",
        description: "Please enter the space name to move forward.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { data, error } = await supabase
        .from("spaces")
        .insert({ space_name: spaceName, is_deleted: false })
        .select();

      // Handle errors from the insertion
      if (error) {
        console.error("Error inserting space:", error);
        toast({
          title: "Error",
          description: "Failed to add new space.",
          variant: "destructive",
        });
        return;
      }
      console.log(data, "data");
      toast({
        title: "Success",
        description: "New space created successfully.",
      });
    } catch(err) {
        console.error("Unexpected error:", err);
    } finally {
        setIsDialogOpen(false);
        setSpaceName("");
        setTeamTags([]);
        setTeamName("");
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSpaceName("");
    setTeamTags([]);
    setTeamName("");
  };

  useEffect(() => {
    fetchSpaces(); // Initial fetch

    const channel = supabase
      .channel("realtime-spaces")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "spaces" },
        (payload) => {
          console.log("Realtime payload:", payload);
          fetchSpaces(); // Refresh the list on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#1A56DB] text-sm hover:bg-[#1A56DB]">
            New space <BadgePlus size={16} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="border-b border-zinc-200 pb-3">
              New Space & Team
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex flex-col items-start gap-1.5">
              <Label
                htmlFor="name"
                className="text-right text-sm font-semibold"
              >
                Space Name
              </Label>
              <Input
                id="name"
                onChange={(e) => setSpaceName(e.target.value)}
                value={spaceName}
                placeholder="e.g Space Title"
                className=""
              />
            </div>
            <div className="flex flex-col items-start gap-1.5">
              <Label
                htmlFor="username"
                className="text-right text-sm font-semibold"
              >
                Teams
              </Label>
              <div className="w-full flex flex-wrap items-center border border-gray-300 rounded-md">
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g Team Title"
                  className="w-[35%] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={spaceName.length === 0}
                />
                {teamTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2">
                    {teamTags.map((tag, index) => (
                      <div
                        key={index}
                        //   variant="secondary"
                        className="flex items-center text-sm font-semibold gap-1 px-2 py-1 border border-amber-500 text-amber-500 rounded-[30px]"
                      >
                        {tag}
                        <CircleX
                          size={18}
                          className="cursor-pointer transition-colors ml-1"
                          onClick={() => removeTeamTag(index)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="w-full">
            <Button
              variant="outline"
              className="w-1/2"
              type="button"
              onClick={() => handleCancel()}
            >
              Cancel
            </Button>
            <Button
              className="w-1/2 bg-[#1A56DB] text-sm hover:bg-[#1A56DB]"
              type="button"
              onClick={() => handleCreateSpace()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateSpaceAndTeam;
