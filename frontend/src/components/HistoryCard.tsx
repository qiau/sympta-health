import { Link } from "react-router-dom";
import { HistoryActionSheet } from "./HistoryActionSheet";
import { useState } from "react";
import { Messages1, More } from "iconsax-reactjs";

interface HistoryCardProps {
  id: number;
  complaint: string;
  recommendation: string;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}

export default function HistoryCard({
  id,
  complaint,
  recommendation,
  onDelete,
  showActions = true,
}: HistoryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDotsClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-20" onClick={handleCloseMenu} />
      )}
      <div className="relative bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all duration-200">
        {showActions && (
          <>
            {" "}
            <button
              type="button"
              onClick={handleDotsClick}
              className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded-full"
            >
              <More size="20" color="gray" />
            </button>
            <HistoryActionSheet
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onDelete={() => onDelete?.(id)}
            />
          </>
        )}

        <Link to={`/history/${id}`} className="block pr-10">
          <div className="flex items-center gap-3">
            <div className="flex flex-none h-12 w-12 items-center justify-center rounded-full bg-gray-50">
              <Messages1 size={24} className="text-gray-500" />
            </div>

            <div className="min-w-0 space-y-1">
              <h2 className="text-gray-800 font-semibold text-md line-clamp-1">
                {complaint}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-1">
                {recommendation}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
