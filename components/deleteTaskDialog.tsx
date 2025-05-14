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

interface DeleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: any;
  teams: any[];
  onUpdate: () => Promise<void>;
  deleteTeam: boolean;
}

const DeleteTaskDialog = ({
  open,
  onOpenChange,
  space,
  teams,
  onUpdate,
  deleteTeam,
}: DeleteTaskDialogProps) => {

    const [deleteLoader, setDeleteLoader] = useState(false);
    
      useEffect(() => {}, [space, teams, open]);
  return <>

  </>;
};

export default DeleteTaskDialog;
