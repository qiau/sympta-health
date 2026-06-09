import axios from "axios";
import { setupApiInterceptors } from "./apiInterceptors";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

setupApiInterceptors(api);