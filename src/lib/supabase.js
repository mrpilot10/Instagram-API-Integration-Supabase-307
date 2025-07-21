import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cshhunwykhbgbrnxdvkk.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzaGh1bnd5a2hiZ2JybnhkdmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzQyODIsImV4cCI6MjA2ODY1MDI4Mn0.6Do17omoFMVV5Frpo4Iga4TlFL4j3mW7lU7_FD_tc5c'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase