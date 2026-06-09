import { useEffect, useRef, useState } from "react";
import {getAnalysisHistory} from "../services/historyService";
import type {
  AnalysisHistory,
  HistoryGroupData,
} from "../types/historyType";
import { groupByDate } from "../utils/groupByDate";

const LIMIT = 10;

export function useInfiniteHistory(accessToken: string | null, authLoading: boolean) {
  const [histories, setHistories] = useState<AnalysisHistory[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const historyGroups: HistoryGroupData[] = groupByDate(histories, (item) => item.created_at);

  useEffect(() => {
    if (authLoading || !accessToken) return;

    const fetchData = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      setError(null);

      try {
        const res = await getAnalysisHistory(page, LIMIT);

        setHistories((prev) =>
          page === 1 ? res.items : [...prev, ...res.items]
        );

        if (res.items.length < LIMIT) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Gagal memuat history", err);
        setError("Gagal memuat riwayat keluhan.");
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    void fetchData();
  }, [page, accessToken, authLoading]);

  useEffect(() => {
    if (!hasMore) return;
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && !loadingMore && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  const removeItem = (id: number) => {
    setHistories((prev) => prev.filter((h) => h.id !== id));
  };

  return {
    historyGroups,
    loading,
    loadingMore,
    error,
    loadMoreRef,
    removeItem,
  };
}
