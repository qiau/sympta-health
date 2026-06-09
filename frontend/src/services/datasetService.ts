import { api } from "../lib/api";
import type { Dataset, DatasetPageResponse } from "../types/datasetType";
import type { AxiosError } from "axios";

function handleError(err: unknown, fallback: string): never {
  const error = err as AxiosError<any>;
  throw new Error(error?.response?.data?.detail || fallback);
}

export async function uploadDataset(file: File): Promise<Dataset> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await api.post<Dataset>(
      "/admin/upload-dataset",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (err) {
    handleError(err, "Gagal upload dataset");
  }
}

export async function getDataset(
  page: number,
  limit: number
): Promise<DatasetPageResponse> {
  try {
    const res = await api.get<DatasetPageResponse>(
      "/admin/dataset",
      {
        params: { page, limit },
      }
    );
    return res.data;
  } catch (err) {
    handleError(err, "Gagal mengambil dataset");
  }
}

export async function getActiveDataset(): Promise<Dataset> {
  try {
    const res = await api.get<Dataset>(
      "/admin/dataset/active"
    );
    return res.data;
  } catch (err) {
    handleError(err, "Gagal mengambil dataset aktif");
  }
}

export async function deleteDataset(id: number): Promise<void> {
  try {
    await api.delete(`/admin/dataset/${id}`);
  } catch (err) {
    handleError(err, "Gagal menghapus dataset");
  }
}

export async function activateDataset(id: number): Promise<Dataset> {
  try {
    const res = await api.patch<Dataset>(
      `/admin/dataset/${id}/activate`
    );
    return res.data;
  } catch (err) {
    handleError(err, "Gagal mengaktifkan dataset");
  }
}

export async function downloadDataset(
  id: number
): Promise<{ blob: Blob; filename: string }> {
  try {
    const res = await api.get(
      `/admin/dataset/${id}/download`,
      {
        responseType: "blob", 
      }
    );

    const contentDisposition = res.headers["content-disposition"];
    let filename = `dataset-${id}.csv`;

    if (contentDisposition?.includes("filename")) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) {
        filename = match[1];
      }
    }

    return {
      blob: res.data,
      filename,
    };
  } catch (err) {
    handleError(err, "Gagal download dataset");
  }
}