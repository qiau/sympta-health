export type Dataset = {
  id: number;
  filename: string;
  row_count: number;
  file_size: number;
  status: "processing" | "success" | "failed";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DatasetGroupData = {
  date: string;
  items: Dataset[];
};

export type DatasetPageResponse = {
  items: Dataset[];
  total: number;
  page: number;
  size: number;
  pages: number;
};