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

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

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
            />
            <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="h-10 absolute bottom-0 right-[140px]">
              Cancel
            </Button>
          </div>
          {/* <DialogFooter className="w-full">
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
              //   onClick={() => handleCreateSpace()}
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
          </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddTaskModal;
