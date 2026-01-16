'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
}

export function TaskDetailsDialog({ open, onOpenChange, taskId }: TaskDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <div className="p-4">
          Task Details - Coming Soon
        </div>
      </DialogContent>
    </Dialog>
  );
}
