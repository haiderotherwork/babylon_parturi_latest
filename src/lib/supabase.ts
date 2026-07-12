import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are not set. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export type Service = {
  id: string
  name: string
  discerption: string
  price: number
  duration_minutes: number
  category: string
  is_active: boolean
  add_on_type: 'hair_add_on' | 'beard_add_on' | 'general_add_on' | 'kid_add_on'
}

export type Booking = {
  id?: string
  service_id: string
  user_name: string
  user_phone: string
  user_email: string
  booking_date: string
  booking_time: string
  end_at_time?: string
  total_duration_minutes?: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  created_at?: string
}