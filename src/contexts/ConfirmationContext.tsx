import { createContext, useContext, useState } from "react";
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

type ConfirmationContextType = (title: string, description?: string) => Promise<boolean>;

const ConfirmationContext = createContext<ConfirmationContextType | null>(null);

type StateProps = {
  resolve: (value: boolean) => void;
  title: string;
  description: string;
} | null;

export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StateProps>(null);

  function confirm(title: string, description?: string) {
    return new Promise<boolean>((resolve) => {
      setState({
        resolve,
        title,
        description: description ?? "",
      });
    });
  }

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
      state?.resolve(false);
      setState(null);
    }
  };

  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}

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
    </ConfirmationContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmationProvider");
  }
  return context;
}
