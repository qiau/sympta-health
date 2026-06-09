import { useState } from "react";
import { createAnalysis } from "../../services/historyService";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

type LocationState = {
  initialText?: string;
};

export default function InputSymptomPage() {
  const { accessToken } = useAuth();
  const location = useLocation();
  const state = (location.state as LocationState) || {};
  const [keluhan, setKeluhan] = useState(state.initialText ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keluhan.trim()) {
      setError("Keluhan tidak boleh kosong.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!accessToken) return;
      const res = await createAnalysis(keluhan);
      if (!res) {
        throw new Error("Gagal mengirim keluhan, coba lagi.");
      }
      navigate(`/history/${res.id}`);
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan saat mengirim keluhan.");
    } finally {
      setLoading(false);
    }
  };
  return (
      <div className="space-y-4">
        <div className="flex flex-row items-center space-x-10">
          <div className="flex-3 space-y-1">
            <h1 className="text-lg font-bold text-primary-500">
              Keluhan Medis
            </h1>
            <p className="text-sm text-gray-600">Coba ceritakan keluhanmu!</p>
            <p className="text-xs text-grey-400">
              Contoh: "Saya berusia 19 tahun, sudah 2 hari ini kepala saya
              pusing sebelah dan biasanya muncul sore hari"
            </p>
          </div>
          <div className="flex-1">
            <img
              src="/input-illustration.svg"
              alt="input illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <form className="space-y-2" onSubmit={handleSubmit}>
          <textarea
            placeholder="Tulis keluhan kamu di sini..."
            className="w-full h-60 p-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={keluhan}
            onChange={(e) => setKeluhan(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={loading}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            className="p-2 w-full bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600"
            disabled={loading}
          >
            {loading ? "Menganalisis keluhan..." : "Kirim"}
          </button>
        </form>
      </div>
  );
}
