import { createClient } from "@supabase/supabase-js";

export const supabaseUrl: string =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  "https://zxwfwtagcqwwevnuqber.supabase.co";

export const supabaseKey: string =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  "sb_publishable_Cee7KZOIemSQnwoJh6tW4A_jVB7X0PE";

export const supabase = createClient(supabaseUrl, supabaseKey);
