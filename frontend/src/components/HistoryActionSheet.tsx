import { Trash } from "iconsax-reactjs";

interface HistoryActionSheetProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function HistoryActionSheet({
  open,
  onClose,
  onDelete,
}: HistoryActionSheetProps) {
  if (!open) return null;

  return (
    <div className="absolute right-2 top-2 z-20">
      <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            onClose();
          }}
        >
          <Trash size={16} />
          <span>Hapus</span>
        </button>
      </div>
    </div>
  );
}
