import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { authTokenStore } from "./authTokenStore";
import { refreshAccessToken } from "../services/authService";

export function setupApiInterceptors(api: AxiosInstance) {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = authTokenStore.get();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalConfig = error.config;

      if (!error.response || error.response.status !== 401) {
        return Promise.reject(error);
      }

      const url: string = originalConfig?.url || "";
      if (url.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (originalConfig._retry) {
        return Promise.reject(error);
      }

      originalConfig._retry = true;

      try {
        const data = await refreshAccessToken();
        const newAccessToken = data.access_token;

        authTokenStore.set(newAccessToken);

        originalConfig.headers = originalConfig.headers ?? {};
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalConfig);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }
  );
}
