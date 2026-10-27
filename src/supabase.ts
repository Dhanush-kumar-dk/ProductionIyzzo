import { createClient } from "@supabase/supabase-js";

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://zxwfwtagcqwwevnuqber.supabase.co";

export const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_Cee7KZOIemSQnwoJh6tW4A_jVB7X0PE";

export const supabase = createClient(supabaseUrl, supabaseKey);
