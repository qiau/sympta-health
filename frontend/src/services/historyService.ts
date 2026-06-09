import { api } from "../lib/api";
import type { AnalysisHistory, HistoryPageResponse } from "../types/historyType";

export async function createAnalysis(
  teks_keluhan: string
): Promise<AnalysisHistory> {
  const res = await api.post("/analysis-history", { teks_keluhan });
  return res.data;
}
 
export async function getAnalysisHistory(
  page: number,
  limit: number
): Promise<HistoryPageResponse> {
  const res = await api.get<HistoryPageResponse>("/analysis-history", {
    params: { page, limit}
  });
  return res.data;
}

export async function getAnalysisHistoryById(
  id: number
): Promise<AnalysisHistory> {
  const res = await api.get<AnalysisHistory>(`/analysis-history/${id}`);
  return res.data;
}

export async function deleteAnalysisHistory(id: number): Promise<void> {
  await api.delete(`/analysis-history/${id}`);
}