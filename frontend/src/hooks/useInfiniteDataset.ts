import { useEffect, useRef, useState } from "react";
import { getDataset } from "../services/datasetService";
import type {
  Dataset,
  DatasetGroupData,
} from "../types/datasetType";
import { groupByDate } from "../utils/groupByDate";

const LIMIT = 10;

export function useInfiniteDataset(
  accessToken: string | null,
  authLoading: boolean
) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const datasetGroups: DatasetGroupData[] = groupByDate(
    datasets,
    (item) => item.created_at
  );

  useEffect(() => {
    if (authLoading || !accessToken) return;

    const fetchData = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      setError(null);

      try {
        const res = await getDataset(page, LIMIT);

        setDatasets((prev) =>
          page === 1 ? res.items : [...prev, ...res.items]
        );

        if (res.items.length < LIMIT) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Gagal memuat dataset", err);
        setError("Gagal memuat dataset.");
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
    setDatasets((prev) => prev.filter((d) => d.id !== id));
  };

  const activateItem = (id: number) => {
  setDatasets((prev) =>
    prev.map((item) => ({
      ...item,
      is_active: item.id === id,
    }))
  );
};

  return {
    datasetGroups,
    loading,
    loadingMore,
    error,
    loadMoreRef,
    removeItem,
    activateItem
  };
}