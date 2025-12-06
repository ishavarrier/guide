import { createClient } from "@supabase/supabase-js";

// In Expo/React Native, environment variables are accessed via process.env with EXPO_PUBLIC_ prefix
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://dvivoebvqlzrgqgvydwd.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aXZvZWJ2cWx6cmdxZ3Z5ZHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzgyOTUsImV4cCI6MjA3NjcxNDI5NX0.1wd9JOempH3NraT89CiYkdMubaUSXUHADWd_lzDMaLE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  location: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  date?: string;
  time?: string;
}

export interface EventInvitation {
  id: string;
  event_id: string;
  user_id: string;
  status: "pending" | "accepted" | "declined";
  invited_at: string;
  responded_at: string | null;
}

export interface PollVote {
  id: string;
  event_id: string;
  user_id: string;
  time_option: string;
  voted_at: string;
}
