import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import HistoryGroup from "../../components/HistoryGroup";
import { useAuth } from "../../context/AuthContext";
import { useInfiniteHistory } from "../../hooks/useInfiniteHistory";
import { deleteAnalysisHistory } from "../../services/historyService";

export default function HistoryPage() {
  const { accessToken, loading: authLoading } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const {
    historyGroups,
    loading,
    loadingMore,
    error,
    loadMoreRef,
    removeItem,
  } = useInfiniteHistory(accessToken, authLoading);

  const requestDelete = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId == null) return;

    try {
      setDeleting(true);
      await deleteAnalysisHistory(pendingDeleteId);
      removeItem(pendingDeleteId);
    } catch (err) {
      console.error("Gagal menghapus history", err);
      alert("Gagal menghapus riwayat. Coba lagi nanti.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  return (
    <div className="space-y-4">
      {loading && <p className="text-sm text-gray-500">Memuat riwayat...</p>}

      {error && !loading && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && historyGroups.length === 0 && (
        <p className="text-sm text-gray-500">
          Belum ada riwayat keluhan. Yuk mulai konsultasi pertama kamu!
        </p>
      )}

      {!loading &&
        !error &&
        historyGroups.map((group) => (
          <HistoryGroup
            key={group.date}
            date={group.date}
            items={group.items}
            onItemDelete={requestDelete}
          />
        ))}
      <div ref={loadMoreRef} className="h-8 flex items-center justify-center">
        {loadingMore && (
          <p className="text-xs text-gray-400">Memuat riwayat lagi...</p>
        )}
      </div>
      {deleting && (
        <p className="text-xs text-gray-400">Menghapus riwayat...</p>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Hapus riwayat keluhan?"
        description="Riwayat yang dihapus tidak dapat dikembalikan."
        confirmText="Ya, hapus"
        cancelText="Batal"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
