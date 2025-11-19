// lib/api/auth.ts

import { api } from "../api";

// RESPONSE TYPES FROM BACKEND
export interface AuthResponse {
  token: string;
}

export interface UserMe {
  id: string;
  email: string;
  created_at: string | null;
}

/* ---------------------- REGISTER ---------------------- */
// POST /auth/register
export async function registerUser(
  email: string,
  password: string,
  username?: string
) {
  return api<{ message?: string; error?: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password, username }),
    }
  );
}

/* ---------------------- LOGIN ------------------------- */
// POST /auth/login
export async function loginUser(email: string, password: string) {
  return api<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
}

/* ---------------------- VERIFY TOKEN ------------------ */
// GET /auth/verify
export async function verifyToken(token: string) {
  return api<{ valid: boolean; error?: string }>(
    "/auth/verify",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/* ---------------------- GET ME ------------------------ */
// GET /auth/me  (protected)
export async function getMe(token: string) {
  return api<UserMe>(
    "/auth/me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
