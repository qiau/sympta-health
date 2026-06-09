import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import {
  activateDataset,
  deleteDataset,
  downloadDataset,
} from "../../services/datasetService";
import DatasetGroup from "../../components/DatasetGroup";
import { useInfiniteDataset } from "../../hooks/useInfiniteDataset";

export default function ManageDatasetPage() {
  const { accessToken, loading: authLoading } = useAuth();

  const {
    datasetGroups,
    loading,
    loadingMore,
    error,
    loadMoreRef,
    removeItem,
    activateItem,
  } = useInfiniteDataset(accessToken, authLoading);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "activate" | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const requestDelete = (id: number) => {
    setSelectedId(id);
    setConfirmType("delete");
    setConfirmOpen(true);
  };

  const requestActivate = (id: number) => {
    setSelectedId(id);
    setConfirmType("activate");
    setConfirmOpen(true);
  };

  const requestDownload = async (id: number) => {
    try {
      const { blob, filename } = await downloadDataset(id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async () => {
    if (!selectedId || !confirmType) return;

    try {
      setLoadingAction(true);

      if (confirmType === "delete") {
        await deleteDataset(selectedId);
        removeItem(selectedId);
      }

      if (confirmType === "activate") {
        await activateDataset(selectedId);
        activateItem(selectedId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
      setConfirmOpen(false);
      setSelectedId(null);
      setConfirmType(null);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setSelectedId(null);
    setConfirmType(null);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-gray-800">Manage Dataset</h1>
        <p className="text-sm text-gray-500">
          Kelola dataset yang digunakan sistem
        </p>
      </div>

      {loading && <p className="text-sm text-gray-500">Memuat dataset...</p>}

      {error && !loading && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && datasetGroups.length === 0 && (
        <p className="text-sm text-gray-500">Belum ada dataset</p>
      )}

      <div className="space-y-6">
        {datasetGroups.map((group) => (
          <DatasetGroup
            key={group.date}
            date={group.date}
            items={group.items}
            onItemDelete={requestDelete}
            onItemActivate={requestActivate}
            onItemDownload={requestDownload}
          />
        ))}
      </div>

      <div ref={loadMoreRef} />

      {loadingMore && (
        <p className="text-sm text-gray-500">Memuat lebih banyak...</p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmType === "delete" ? "Hapus Dataset?" : "Aktifkan Dataset?"
        }
        description={
          confirmType === "delete"
            ? "Dataset yang dihapus tidak dapat dikembalikan."
            : "Dataset ini akan menjadi dataset aktif dan menggantikan yang sebelumnya."
        }
        confirmText={confirmType === "delete" ? "Hapus" : "Aktifkan"}
        variant={confirmType === "delete" ? "danger" : "default"}
        loading={loadingAction}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </section>
  );
}
