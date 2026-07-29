import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!supabaseUrl || !/^https?:\/\//.test(supabaseUrl)) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida en .env.local",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.local",
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
);
