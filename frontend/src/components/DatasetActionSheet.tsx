import { Trash, TickCircle, DocumentDownload } from "iconsax-reactjs";

interface DatasetActionSheetProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  onActivate: () => void;
  onDownload: () => void;
  isActive: boolean;
  status: "processing" | "success" | "failed";
}

export function DatasetActionSheet({
  open,
  onClose,
  onDelete,
  onActivate,
  onDownload,
  isActive,
  status,
}: DatasetActionSheetProps) {
  if (!open) return null;

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    onClose();
  };

  return (
    <div className="absolute right-2 top-10 z-30">
      <div className="w-44 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
        {status === "failed" ? (
          <>
            <button
              type="button"
              onClick={(e) => handleClick(e, onDownload)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <DocumentDownload size={16} />
              <span>Unduh</span>
            </button>
            <button
              type="button"
              onClick={(e) => handleClick(e, onDelete)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              <Trash size={16} />
              <span>Hapus</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => handleClick(e, onDownload)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <DocumentDownload size={16} />
              <span>Unduh</span>
            </button>

            {!isActive && (
              <>
                <button
                  type="button"
                  onClick={(e) => handleClick(e, onActivate)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <TickCircle size={16} />
                  <span>Aktifkan</span>
                </button>

                <div className="my-1 h-px bg-gray-200" />

                <button
                  type="button"
                  onClick={(e) => handleClick(e, onDelete)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  <Trash size={16} />
                  <span>Hapus</span>
                </button>
              </>
            )}

            {isActive && (
              <div className="px-3 py-2 text-xs text--500">
                Dataset aktif digunakan sistem
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
