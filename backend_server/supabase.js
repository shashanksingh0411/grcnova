// supabase.js

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log(
  "Supabase Key:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "Not loaded"
);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Enhanced error messages
if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Initialize Supabase client (server-side, Service Role key)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Optional: Test connection on startup (helpful for debugging)
supabase.auth.getSession()
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error testing Supabase connection:', error);
  });