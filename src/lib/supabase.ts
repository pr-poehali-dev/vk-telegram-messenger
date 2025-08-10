import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jkweekjdlunootfzttda.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprd2Vla2pkbHVub290Znp0dGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MTg2NDEsImV4cCI6MjA3MDM5NDY0MX0.oskTNejNjEzMg8Xkdru9DPjhcBHf0JPNhlyYsOazi1Q'

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface UserProfile {
  id: string
  username: string
  phone: string
  avatar_url?: string
  theme: 'light' | 'dark'
  created_at: string
  updated_at: string
}

export interface Chat {
  id: string
  name?: string
  is_group: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'voice'
  file_url?: string
  created_at: string
}

export interface ChatParticipant {
  id: string
  chat_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
}