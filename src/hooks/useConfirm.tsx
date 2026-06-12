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

type ConfirmOptions = {
  title: string;
  description: string;
};

export function useConfirm() {
  const [state, setState] = useState<{
    resolve: (value: boolean) => void;
    title: string;
    description: string;
  } | null>(null);

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        resolve,
        title: options.title,
        description: options.description,
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

  const ConfirmationDialog = () => (
    <AlertDialog
      open={state !== null}
      onOpenChange={(open) => {
        if (!open) setState(null);
      }}
    >
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
