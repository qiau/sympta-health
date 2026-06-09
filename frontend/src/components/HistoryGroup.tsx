import type { AnalysisHistory } from "../types/historyType";
import HistoryCard from "./HistoryCard";

interface HistoryGroupProps {
  date: string;
  items: AnalysisHistory[];
  onItemDelete?: (id: number) => void;
  showActions?: boolean;
}

export default function HistoryGroup({
  date,
  items,
  onItemDelete,
  showActions = true,
}: HistoryGroupProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400">{date}</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <HistoryCard
            key={item.id}
            id={item.id}
            complaint={item.teks_keluhan}
            recommendation={item.rekomendasi_tindakan ?? "-"}
            onDelete={onItemDelete}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
}
