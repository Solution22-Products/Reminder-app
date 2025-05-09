"use client";
import { Button } from "@/components/ui/button";
import type React from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/utils/supabase/supabaseClient";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface EditSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: any;
  teams: any[];
  onUpdate: () => Promise<void>;
  deleteTeam: boolean;
}

const DeleteSpaceDialog = ({
  open,
  onOpenChange,
  space,
  teams,
  onUpdate,
  deleteTeam,
}: EditSpaceDialogProps) => {

    const [deleteLoader, setDeleteLoader] = useState(false);

  useEffect(() => {}, [space, teams, open]);

  const handleDeleteSpace = async () => {
    try {
        setDeleteLoader(true);
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .update({ is_deleted: true })
        .eq("space_id", space.id);
      if (teamError) throw teamError;
      const { data: spaceData, error: spaceError } = await supabase
        .from("spaces")
        .update({ is_deleted: true })
        .eq("id", space.id);
      if (spaceError) throw spaceError;
      onOpenChange(false);
      setDeleteLoader(false);
      onUpdate();
      toast({
        title: "Success",
        description: "Space deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting space:", error);
    }
  };

  const handleDeleteTeam = async () => {
    try {
        setDeleteLoader(true);
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .update({ is_deleted: true })
        .eq("id", space.id);
      if (teamError) throw teamError;
      onOpenChange(false);
      setDeleteLoader(false);
      onUpdate();
      toast({
        title: "Success",
        description: "Team deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            {deleteTeam ? (
              <DialogTitle className="pb-1">Delete Team</DialogTitle>
            ) : (
              <DialogTitle className="pb-1">Delete Space</DialogTitle>
            )}
            <DialogDescription>
              {deleteTeam ? (
                <span>Are you sure you want to delete this team?</span>
              ) : (
                <span>Are you sure you want to delete this space?</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4"></div>
          <DialogFooter className="w-full">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-1/2"
                type="button"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="w-1/2 bg-red-500 text-sm hover:bg-red-500 hover:opacity-85"
              type="button"
              onClick={deleteTeam ? handleDeleteTeam : handleDeleteSpace}
              disabled={deleteLoader}
            >
              {deleteLoader ? (
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
              "Delete"
            )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteSpaceDialog;
