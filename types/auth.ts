export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const Roles = ['USER'] as const;
export type Role = (typeof Roles)[number];

export interface User {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
}