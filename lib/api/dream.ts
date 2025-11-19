// lib/api/dream.ts
import { api } from "../api";

/* ---------------------- TYPES ---------------------- */

export interface DreamAnalysisResponse {
  message: string;
  dream_id: string;
  title: string;
  summary: string;
  is_lucid: boolean;
  tags: string[];
  mood: string | null;
}

export interface DreamListItem {
  id: string;
  title: string;
  dream_text: string;
  summary: string;
  submitted_at: string | null;
  is_lucid: boolean;
  tags: string[];
  mood: string | null;
}

export interface DreamCreateResponse {
  message: string;
  dream_id: string;
  title: string;
  is_lucid: boolean;
  tags: string[];
  mood: string | null;
}

export interface DreamDetailResponse extends DreamListItem {}

/* ---------------------- ANALYZE DREAM ---------------------- */
// POST /dream/analyze (GPT)
export function analyzeDream(dreamText: string, token: string) {
  return api<DreamAnalysisResponse>("/dream/analyze", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dreamText }),
  });
}

/* ---------------------- CREATE DREAM ------------------------ */
// POST /dream/dreams
export function createDream(
  data: {
    dreamText: string;
    title?: string;
    is_lucid?: boolean;
    tags?: string[];
    mood?: string;
  },
  token: string
) {
  return api<DreamCreateResponse>("/dream/dreams", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/* ---------------------- GET DREAMS --------------------------- */
// GET /dream/dreams
export function getDreams(token: string) {
  return api<DreamListItem[]>("/dream/dreams", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ---------------------- GET SINGLE DREAM --------------------- */
// GET /dream/dreams/<id>
export function getDream(dreamId: string, token: string) {
  return api<DreamDetailResponse>(`/dream/dreams/${dreamId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/* ---------------------- UPDATE DREAM ------------------------- */
// PUT /dream/dreams/<id>
export function updateDream(
  dreamId: string,
  data: {
    title?: string;
    dreamText?: string;
    is_lucid?: boolean;
    tags?: string[];
    mood?: string;
  },
  token: string
) {
  return api<DreamCreateResponse>(`/dream/dreams/${dreamId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

/* ---------------------- DELETE DREAM ------------------------- */
// DELETE /dream/dreams/<id>
export function deleteDream(dreamId: string, token: string) {
  return api<{ message: string }>(`/dream/dreams/${dreamId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
