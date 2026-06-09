export type PredictionItem = {
  label: string;   
  score: number; 
}

export type AnalysisHistory = {
  id: number;
  user_id: number;
  teks_keluhan: string;
  hasil_ekstraksi: string | null;
  prediksi_penyakit: string | null;
  top_predictions: PredictionItem[] | null;
  confidence_score: number | null;
  rekomendasi_tindakan: string | null;
  created_at: string;
  updated_at: string;
};

export type HistoryGroupData = {
  date: string;
  items: AnalysisHistory[];
};

export type HistoryPageResponse = {
  items: AnalysisHistory[];
  total: number;
  page: number;
  size: number;
  pages: number;
};