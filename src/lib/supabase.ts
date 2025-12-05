import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://dvivoebvqlzrgqgvydwd.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2aXZvZWJ2cWx6cmdxZ3Z5ZHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzgyOTUsImV4cCI6MjA3NjcxNDI5NX0.1wd9JOempH3NraT89CiYkdMubaUSXUHADWd_lzDMaLE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  username: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  created_at: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  password: string
  address?: string
}
