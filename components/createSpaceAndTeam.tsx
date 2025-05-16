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

interface spaceTrigger {
  spaceTrigger: boolean;
  setSpaceTrigger: (value: boolean) => void;
}

const CreateSpaceAndTeam = ({
  spaceTrigger,
  setSpaceTrigger,
}: spaceTrigger) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamTags, setTeamTags] = useState<string[]>([]);
  const [saveLoader, setSaveLoader] = useState(false);

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

  const handleCreateSpace = async () => {
    if (!spaceName) {
      toast({
        title: "Error",
        description: "Please enter the space name to move forward.",
        variant: "destructive",
      });
      return;
    }
    if (teamTags.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one team tag to move forward.",
        variant: "destructive",
      });
      return;
    }
    try {
      setSaveLoader(true);
      const { data: spaceData, error } = await supabase
        .from("spaces")
        .insert({ space_name: spaceName, is_deleted: false })
        .select("id")
        .single();

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

      const spaceId = spaceData.id; // ✅ ensure you're using the correct key name
      console.log("Space created with ID:", spaceId);

      for (const tag of teamTags) {
        const { error: teamError } = await supabase.from("teams").insert({
          team_name: tag,
          space_id: spaceId,
          is_deleted: false,
        });

        if (teamError) {
          console.error(`Error inserting team for tag "${tag}":`, teamError);
          toast({
            title: "Error",
            description: `Failed to create team: ${tag}`,
            variant: "destructive",
          });
          // Optionally continue or break here
        }
      }

      setSpaceTrigger(!spaceTrigger);
      if (teamTags.length === 0) {
        toast({
          title: "Success",
          description: "New space created successfully.",
        });
        setSaveLoader(false);
      } else {
        toast({
          title: "Success",
          description: "New space and team created successfully.",
        });
        setSaveLoader(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setSaveLoader(true);
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
              disabled={saveLoader}
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
                    className="opacity-75"
                    fill="#fff"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateSpaceAndTeam;
