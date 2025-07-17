import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isClientEnabled = import.meta.env.VITE_SUPABASE_ENABLED;

function createClient_() {
  if (isClientEnabled) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Anon Key are required.");
    }

    return createClient(supabaseUrl, supabaseAnonKey);
  }
}

export const supabase = createClient_();
