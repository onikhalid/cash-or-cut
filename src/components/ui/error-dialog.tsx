import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  heading?: string;
  subheading?: string;
  retry?: (() => void) | null;
  retryLabel?: string;
  closeLabel?: string;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  isOpen,
  onClose,
  heading = "Error",
  subheading = "Something went wrong.",
  retry,
  retryLabel = "Retry",
  closeLabel = "Close",
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{heading}</AlertDialogTitle>
          <AlertDialogDescription>{subheading}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {retry && (
            <AlertDialogAction onClick={retry}>{retryLabel}</AlertDialogAction>
          )}
          <AlertDialogAction onClick={onClose}>{closeLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorDialog;
