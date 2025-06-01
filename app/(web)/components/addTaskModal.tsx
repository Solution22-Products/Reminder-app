import NewReactMentions from "@/components/new-react-mentions";
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
import { useState } from "react";

interface addTaskModalProps {
  selectedTeam: any;
  selectedSpaceId: string | null;
  selectedTeamId: string | null;
  spaces: any[];
  teams: any[];
  members: any[];
}

const AddTaskModal = ({
  selectedTeam,
  selectedSpaceId,
  selectedTeamId,
  spaces,
  teams,
  members,
}: addTaskModalProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full gap-2 text-sm mt-0 mb-4 py-5 text-gray-400 hover:bg-transparent hover:text-gray-400 border-dashed border-gray-400"
          >
            Add Task
          </Button>
        </DialogTrigger>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Create a new task to your board</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <NewReactMentions
              selectedTeam={selectedTeam}
              selectedSpaceId={selectedSpaceId}
              selectedTeamId={selectedTeamId}
              editTask={false}
              isEditTask={""}
              setIsEditTask={""}
              currentTask={""}
              classname="input_mention kanbanAddTask"
              // memberId={memberId}
              // memberTeamsAndSpaces={memberTeamsAndSpaces}
              spaces={spaces}
              teams={teams}
              members={members}
              selectedUserId={""}
              selectedMember={members}
              kanbanView={false}
              setIsDialogOpen={setIsDialogOpen}
            />
            <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="h-10 absolute bottom-0 right-[140px]">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTaskModal;
