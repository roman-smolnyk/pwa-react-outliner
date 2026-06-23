import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

type StateProps = {
  resolve: (value: boolean) => void;
  title: string;
  description: string;
} | null;

export function useConfirm() {
  const [state, setState] = useState<StateProps>(null);

  const confirm = (title: string, description: string) => {
    return new Promise<boolean>((resolve) => {
      setState({
        resolve,
        title,
        description,
      });
    });
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Gracefully resolve false if user clicks backdrop or presses Esc
      state?.resolve(false);
      setState(null);
    }
  };

  const ConfirmationDialog = () => (
    <AlertDialog open={state !== null} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{state?.title}</AlertDialogTitle>
          <AlertDialogDescription>{state?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [confirm, ConfirmationDialog] as const;
}
