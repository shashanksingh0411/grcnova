import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yudgxvmpbhnnqiublfpz.supabase.co";
const supabaseAnonKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZGd4dm1wYmhubnFpdWJsZnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNTEzMDcsImV4cCI6MjA2ODgyNzMwN30.S-nMBIcA5MShqhzigAD3dI046Vtka7cfpOl5BHhoC0Q";



export const supabase = createClient(supabaseUrl, supabaseAnonKey);