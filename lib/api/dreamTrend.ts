import { api } from "../api";

/* ---------------------- TYPES ---------------------- */

// /trends/summary
export interface TrendSummaryResponse {
  total_dreams: number;
  avg_per_week: number;
  common_tags: [string, number][]; // [["nightmare", 4], ...]
  message?: string;
}

// /trends/timeline
export interface TrendTimelineEntry {
  date: string;        // "2025-01-03"
  dream_count: number;
}

// /trends/streaks
export interface TrendStreaksResponse {
  current_streak: number;
  longest_streak: number;
}

// /trends/tags
export interface TrendTagFrequency {
  tags: [string, number][]; // [["lucid", 3], ...]
  message?: string;
}

// /trends/monthly
export interface TrendMonthlyEntry {
  month: string;       // "2025-01"
  dream_count: number;
}

// /trends/weekday
export interface TrendWeekdayEntry {
  weekday: number;     // 0 = Monday ... 6 = Sunday
  dream_count: number;
}

/* ---------------------- API FUNCTIONS ---------------------- */

// GET /trends/summary
export function getTrendSummary(token: string) {
  return api<TrendSummaryResponse>(
    "/trend/trends/summary",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// GET /trends/timeline
export function getTrendTimeline(token: string) {
  return api<TrendTimelineEntry[]>(
    "/trend/trends/timeline",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// GET /trends/streaks
export function getDreamStreaks(token: string) {
  return api<TrendStreaksResponse>(
    "/trend/trends/streaks",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// GET /trends/tags
export function getTagFrequencies(token: string) {
  return api<TrendTagFrequency>(
    "/trend/trends/tags",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// GET /trends/monthly
export function getMonthlyActivity(token: string) {
  return api<TrendMonthlyEntry[]>(
    "/trend/trends/monthly",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

// GET /trends/weekday
export function getWeekdayStats(token: string) {
  return api<TrendWeekdayEntry[]>(
    "/trend/trends/weekday",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
