import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAnalysisHistoryById } from "../../services/historyService";
import { Edit2 } from "iconsax-reactjs";
import type { PredictionItem } from "../../types/historyType";

export default function HistoryDetailPage() {
  const { historyId } = useParams();
  const navigate = useNavigate();

  const [keluhan, setKeluhan] = useState("");
  const [diagnosa, setDiagnosa] = useState("");
  const [topPredictions, setTopPredictions] = useState<PredictionItem[]>([]);
  const [rekomendasi, setRekomendasi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!historyId) {
      setError("ID riwayat tidak ditemukan.");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getAnalysisHistoryById(Number(historyId));

        if (!res) {
          throw new Error("Gagal mengambil detail analisis.");
        }

        setKeluhan(res.teks_keluhan);
        setDiagnosa(res.prediksi_penyakit ?? "");
        setTopPredictions(res.top_predictions ?? []);
        setRekomendasi(res.rekomendasi_tindakan ?? "");

        const createdDate = new Date(res.created_at);
        const formatted = createdDate.toLocaleString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        setTanggal(formatted);
      } catch (err: any) {
        setError(err.message ?? "Terjadi kesalahan saat memuat hasil.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [historyId]);

  const handleEditComplaint = () => {
    navigate("/input-symptom", {
      state: { initialText: keluhan },
    });
  };

  return (
    <div className="space-y-4">
      {loading && (
        <p className="text-xs text-gray-500">
          Sedang memuat hasil analisis, mohon tunggu...
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
        <h1 className="text-xs font-normal text-gray-400">KELUHAN</h1>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {keluhan || (loading ? "Memuat keluhan..." : "-")}
        </p>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
        <h2 className="text-xs font-normal text-gray-400">DIAGNOSA PENYAKIT</h2>
        <p className="text-sm text-gray-700 whitespace-pre-line">
          {diagnosa ||
            (loading
              ? "Sedang diproses oleh sistem..."
              : "Belum ada diagnosa yang tersedia.")}
        </p>
      </section>
      {topPredictions?.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="text-xs font-normal text-gray-400">
            PROBABILITAS PENYAKIT
          </h2>

          <div className="space-y-3">
            {topPredictions.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{item.label}</span>
                  <span className="text-gray-500">
                    {(item.score * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary-500 transition-all"
                    style={{ width: `${item.score * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
        <h2 className="text-xs font-normal text-gray-400">
          REKOMENDASI TINDAKAN
        </h2>

        <p className="text-sm text-gray-700 whitespace-pre-line">
          {rekomendasi ||
            (loading
              ? "Sistem sedang menyiapkan rekomendasi tindakan..."
              : "Belum ada rekomendasi yang tersedia.")}
        </p>

        <p className="mt-2 text-xs text-gray-400 text-justify">
          Catatan: Rekomendasi ini bersifat informasi umum dan tidak
          menggantikan konsultasi langsung dengan tenaga medis.
        </p>
      </section>
      {tanggal && <p className="text-sm text-gray-400 text-right">{tanggal}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleEditComplaint}
          className="flex items-center justify-center h-10 w-10 rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-100"
          title="Edit Keluhan"
        >
          <Edit2 size={24} />
        </button>
        <Link
          to="/home"
          className="w-full py-2 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 flex items-center justify-center text-center"
        >
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}
