import { useState } from "react";
import { More, DocumentText } from "iconsax-reactjs";
import { DatasetActionSheet } from "./DatasetActionSheet";

interface DatasetCardProps {
  id: number;
  filename: string;
  file_size: number;
  row_count: number;
  status: "processing" | "success" | "failed";
  is_active: boolean;
  onDelete?: (id: number) => void;
  onActivate?: (id: number) => void;
  onDownload?: (id: number) => void;
  showActions?: boolean;
}

export default function DatasetCard({
  id,
  filename,
  file_size,
  row_count,
  status,
  is_active,
  onDelete,
  onActivate,
  onDownload,
  showActions = true,
}: DatasetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDotsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusStyle = () => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-600";
      case "failed":
        return "bg-red-100 text-red-600";
      case "processing":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <>
      {menuOpen && showActions && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="relative bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200">
        {showActions && (
          <>
            <button
              onClick={handleDotsClick}
              className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded-full"
            >
              <More size={20} color="gray" />
            </button>

            <DatasetActionSheet
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onDelete={() => onDelete?.(id)}
              onActivate={() => onActivate?.(id)}
              onDownload={() => onDownload?.(id)}
              isActive={is_active}
              status={status}
            />
          </>
        )}

        <div className="flex items-center gap-3 pr-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50">
            <DocumentText size={24} className="text-gray-500" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-gray-800 font-semibold text-sm truncate">
              {filename}
            </h2>

            <p className="text-gray-500 text-xs">
              {formatFileSize(file_size)} • {row_count} rows
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getStatusStyle()}`}
              >
                {status}
              </span>

              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  is_active
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
