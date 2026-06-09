import type { Dataset } from "../types/datasetType";
import DatasetCard from "./DatasetCard";

interface DatasetGroupProps {
  date: string;
  items: Dataset[];
  onItemDelete?: (id: number) => void;
  onItemActivate?: (id: number) => void;
  onItemDownload?: (id: number) => void;
  showActions?: boolean;
}

export default function DatasetGroup({
  date,
  items,
  onItemDelete,
  onItemActivate,
  onItemDownload,
  showActions = true,
}: DatasetGroupProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400">{date}</h3>

      <div className="space-y-3">
        {items.map((item) => (
          <DatasetCard
            key={item.id}
            id={item.id}
            filename={item.filename}
            file_size={item.file_size}
            row_count={item.row_count}
            status={item.status}
            is_active={item.is_active}
            onDelete={onItemDelete}
            onActivate={onItemActivate}
            onDownload={onItemDownload}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
}
