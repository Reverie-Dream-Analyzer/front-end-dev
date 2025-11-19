import { api } from "../api";

/* ---------------------- TYPES ---------------------- */

// GET /streak
export interface StreakResponse {
  streak: number;
}

// GET /users/<id>
export interface UserProfile {
  user_id: string;
  birthdate: string | null;
  favorite_element: string | null;
  dream_goals: string[];
}

// PUT /users/<id>
export interface UserProfileUpdateResponse {
  message: string;
  updated_fields: {
    birthdate: string | null;
    favorite_element: string | null;
    dream_goals: string[];
  };
}

// GET /users/<id>/stats
export interface UserDreamStats {
  total_dreams: number;
  lucid_dreams: number;
  lucidity_rate: number; // e.g., 0.34
  unique_tags: string[];
}

// GET /users/<id>/tags/top
export interface TopTagsResponse {
  top_tags: { tag: string; count: number }[];
}

// GET /users/<id>/moods
export interface MoodDistributionResponse {
  moods: { mood: string; count: number }[];
}


/* ---------------------- ROUTES ---------------------- */

// GET /streak
export function getUserStreak() {
  return api<StreakResponse>("/user_bp/streak");
}


/* ----------- GET USER PROFILE ---------------- */
export function getUserProfile(userId: string) {
  return api<UserProfile>(
    `/user_bp/users/${userId}`,
    { method: "GET" }
  );
}

/* ----------- UPDATE USER PROFILE --------------- */
export function updateUserProfile(
  userId: string,
  data: {
    birthdate?: string;
    favorite_element?: string;
    dream_goals?: string[];
  }
) {
  return api<UserProfileUpdateResponse>(
    `/user_bp/users/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

/* ----------- USER DREAM STATS --------------- */
export function getUserDreamStats(userId: string) {
  return api<UserDreamStats>(
    `/user_bp/users/${userId}/stats`,
    { method: "GET" }
  );
}

/* ----------- TOP TAGS --------------- */
export function getUserTopTags(userId: string) {
  return api<TopTagsResponse>(
    `/user_bp/users/${userId}/tags/top`,
    { method: "GET" }
  );
}

/* ----------- MOOD DISTRIBUTION --------------- */
export function getUserMoodDistribution(userId: string) {
  return api<MoodDistributionResponse>(
    `/user_bp/users/${userId}/moods`,
    { method: "GET" }
  );
}

