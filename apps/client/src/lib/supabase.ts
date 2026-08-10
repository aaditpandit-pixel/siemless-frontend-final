import { createClient } from "@supabase/supabase-js";

// The Supabase anon key is intentionally browser-public and remains constrained
// by the project's existing Row Level Security policies.
const SUPABASE_URL = "https://xvpmixfexcgulzucznmx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cG1peGZleGNndWx6dWN6bm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwOTg4NDYsImV4cCI6MjEwMTY3NDg0Nn0.B7L91twfw4EzNm8llD4RkY3w5FWpbWt-ShjvMd5_1RY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
