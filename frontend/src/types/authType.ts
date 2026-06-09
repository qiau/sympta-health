import type { User } from "./userType";

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginTokens = {
  access_token: string;
  access_expires_in: number;  
  refresh_expires_in: number; 
};

export type LoginResponse = {
  user: User;
  tokens: LoginTokens;
};

export type RefreshResponse = {
  access_token: string;
  access_expires_in: number;
};

export type LogoutResponse = {
  detail: string;
};

