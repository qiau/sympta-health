import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DocumentText, Data } from "iconsax-reactjs";
import { getActiveDataset, getDataset } from "../../services/datasetService";
import { groupByDate } from "../../utils/groupByDate";
import DatasetGroup from "../../components/DatasetGroup";
import type { Dataset, DatasetGroupData } from "../../types/datasetType";

export default function AdminDashboardPage() {
  const [datasetGroups, setDatasetGroups] = useState<DatasetGroupData[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [totalDatasets, setTotalDatasets] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDatasets = async () => {
    try {
      setLoading(true);

      const page = 1;
      const limit = 3;

      const [data, active] = await Promise.all([
        getDataset(page, limit),
        getActiveDataset(),
      ]);

      setTotalDatasets(data.total);
      setActiveDataset(active ?? null);
      setDatasetGroups(groupByDate(data.items, (item) => item.created_at));
    } catch (err) {
      console.error("Gagal load dataset", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-blue-50">
            <Data size={24} className="text-blue-500" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Total Dataset</p>
            <h2 className="text-xl font-bold text-gray-800">{totalDatasets}</h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-green-50">
            <DocumentText size={24} className="text-green-500" />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-gray-500">Dataset Aktif</p>
            <h2 className="text-sm font-semibold text-gray-800 truncate">
              {activeDataset?.filename ?? "Tidak ada"}
            </h2>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-md font-semibold text-gray-800">
            Dataset Terbaru
          </h2>

          <Link
            to="/admin/manage-dataset"
            className="text-sm text-primary-500 underline"
          >
            Kelola Dataset
          </Link>
        </div>

        {loading && <p className="text-xs text-gray-500">Memuat data...</p>}

        {!loading && datasetGroups.length === 0 && (
          <p className="text-xs text-gray-500">Belum ada dataset</p>
        )}

        <div className="space-y-4">
          {!loading &&
            datasetGroups.map((group) => (
              <DatasetGroup
                key={group.date}
                date={group.date}
                items={group.items}
                showActions={false}
              />
            ))}
        </div>
      </section>
    </section>
  );
}
