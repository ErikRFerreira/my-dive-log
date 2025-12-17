import { Button } from '@/components/ui/button';
import Modal from '@/components/common/Modal';

type DeleteDiveModalProps = {
  isOpen: boolean;
  location?: string | null;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function DeleteDiveModal({
  isOpen,
  location,
  isPending = false,
  onCancel,
  onConfirm,
}: DeleteDiveModalProps) {
  if (!isOpen) return null;

  return (
    <Modal title="Delete Dive" closeModal={onCancel}>
      <p className="text-foreground mb-6">
        {`Are you sure you want to delete the dive at ${location ?? 'this location'}? This action cannot be undone.`}
      </p>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 bg-transparent"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
        >
          {isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
}
