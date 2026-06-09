import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  uploadDataset,
  getDataset,
  deleteDataset,
  activateDataset,
  downloadDataset,
} from "../../services/datasetService";
import type { DatasetGroupData } from "../../types/datasetType";
import { groupByDate } from "../../utils/groupByDate";
import DatasetGroup from "../../components/DatasetGroup";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export default function UploadDatasetPage() {
  const { accessToken } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [datasetGroups, setDatasetGroups] = useState<DatasetGroupData[]>([]);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "activate" | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const loadDatasets = async () => {
    try {
      setLoading(true);

      const page = 1;
      const limit = 3;

      const data = await getDataset(page, limit);

      setDatasetGroups(groupByDate(data.items, (item) => item.created_at));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    loadDatasets();
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("File CSV harus dipilih.");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setError("File harus CSV.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadDataset(file);
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setError(err.message ?? "Gagal upload dataset.");
    } finally {
      setUploading(false);
      await loadDatasets();
    }
  };

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
      }

      if (confirmType === "activate") {
        await activateDataset(selectedId);
      }

      await loadDatasets();
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
        <h1 className="text-lg font-bold text-primary-500">Upload Dataset</h1>
        <p className="text-sm text-gray-600">
          Upload file CSV untuk memperbarui dataset sistem
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-xl shadow space-y-4"
      >
        <div className="space-y-2">
          <label className="block text-md font-semibold">Pilih File CSV</label>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              id="file-upload"
              onChange={(e) => {
                const selected = e.target.files?.[0] ?? null;
                setFile(selected);
                setError(null);
              }}
              className="hidden"
              disabled={uploading}
            />

            <label
              htmlFor="file-upload"
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 text-sm"
            >
              Pilih File
            </label>

            <div className="flex items-center gap-2 text-sm text-gray-600 max-w-[220px]">
              <span className="truncate">
                {file ? file.name : "Belum ada file dipilih"}
              </span>

              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setError(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="text-gray-400 hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {file && (
          <div className="text-xs text-gray-500">
            File dipilih: <strong>{file.name}</strong>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={uploading || !file}
          className="w-full p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {uploading ? "Mengupload..." : "Upload"}
        </button>
      </form>

      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-md">Riwayat Dataset</h2>
          <Link
            to="/admin/manage-dataset"
            className="text-sm text-primary-500 underline"
          >
            Lihat semua
          </Link>
        </div>

        {loading && <p className="text-xs text-gray-500">Memuat dataset...</p>}

        {!loading && datasetGroups.length === 0 && (
          <p className="text-xs text-gray-500">Belum ada dataset</p>
        )}

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
      </div>
    </section>
  );
}
