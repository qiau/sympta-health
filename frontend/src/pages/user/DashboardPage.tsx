import { Link } from "react-router-dom";
import HistoryGroup from "../../components/HistoryGroup";
import { useAuth } from "../../context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import type { HistoryGroupData } from "../../types/historyType";
import { getAnalysisHistory } from "../../services/historyService";
import { groupByDate } from "../../utils/groupByDate";

export default function UserDashboardPage() {
  const { accessToken, loading: authLoading } = useAuth();
  const [historyGroups, setHistoryGroups] = useState<HistoryGroupData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!accessToken) {
      setLoadingHistory(false);
      return;
    }

    setLoadingHistory(true);
    setError(null);
    try {
      const page = 1;
      const limit = 3;
      const data = await getAnalysisHistory(page, limit);
      setHistoryGroups(groupByDate(data.items, (item) => item.created_at));
    } catch (err) {
      console.error("Gagal memuat history", err);
      setError("Gagal memuat riwayat keluhan.");
    } finally {
      setLoadingHistory(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (authLoading) return;
    void loadHistory();
  }, [authLoading, loadHistory]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-primary-400 p-4">
        <div className="flex flex-row items-center gap-2 rounded-2xl bg-primary-300 p-4">
          <div className="flex-2 space-y-2">
            <h1 className="text-white text-lg font-bold">
              Ceritakan Keluhanmu!
            </h1>
            <p className="text-white text-xs">
              Dapatkan rekomendasi medis dari sistem cerdas kami
            </p>
            <Link
              to="/input-symptom"
              className="mt-2 inline-block px-4 py-2 bg-white text-sm text-primary-500 rounded-md hover:bg-gray-100 transition font-semibold"
            >
              Mulai
            </Link>
          </div>
          <div className="flex-1">
            <img
              src="/card-home-illustration.svg"
              alt="card home illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-gray-800">
            Riwayat Keluhan Terakhir
          </h2>
          <Link
            to="/history"
            className="text-primary-600 hover:underline text-sm font-medium underline"
          >
            Lihat semua
          </Link>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Baca lagi yuk rekomendasi yang sudah kamu dapat.
        </p>
        {loadingHistory && (
          <p className="text-sm text-gray-500">Memuat riwayat...</p>
        )}

        {error && !loadingHistory && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {!loadingHistory && !error && historyGroups.length === 0 && (
          <p className="text-sm text-gray-500">
            Belum ada riwayat keluhan. Yuk mulai konsultasi pertama kamu!
          </p>
        )}
        <div className="space-y-4">
          {!loadingHistory &&
            !error &&
            historyGroups.map((group) => (
              <HistoryGroup
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
