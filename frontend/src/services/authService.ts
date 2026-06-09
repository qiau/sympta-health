import { api } from "../lib/api";
import type { LoginPayload, LoginResponse, LogoutResponse, RefreshResponse, RegisterPayload } from "../types/authType";
import type { User } from "../types/userType";

export async function register(
  payload: RegisterPayload
): Promise<User> {
  const res = await api.post<User>("/auth/register", payload);
  return res.data;
}

export async function login(
  payload: LoginPayload
): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/auth/login", payload);
  return res.data;
}

export async function refreshAccessToken(): Promise<RefreshResponse> {
  const res = await api.post<RefreshResponse>("/auth/refresh");
  return res.data;
}

export async function logout(): Promise<LogoutResponse> {
  const res = await api.post<LogoutResponse>("/auth/logout");
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get<User>("/auth/me");
  return res.data;
}