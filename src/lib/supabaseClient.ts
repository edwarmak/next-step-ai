import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL. Add it to the project root .env file and restart Vite.',
  )
}

if (!supabasePublishableKey) {
  throw new Error(
    'Missing VITE_SUPABASE_PUBLISHABLE_KEY. Add it to the project root .env file and restart Vite.',
  )
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
