// pgPool.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ysbuaeqdyzbqmkicugzv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYnVhZXFkeXpicW1raWN1Z3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTM0NTEsImV4cCI6MjA1OTYyOTQ1MX0.2F2eNJ9oH97edpnGtv9-l8dqBwY4HUCa890hut9UsO8";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
