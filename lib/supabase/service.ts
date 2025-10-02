import { createClient } from "@supabase/supabase-js"

// Service role client for bypassing RLS during admin operations
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseSecretKey = process.env.SUPABASE_SECRET_API_KEY
  
  if (!supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_API_KEY environment variable is not set. Please add it to your .env.local file.")
  }
  
  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
