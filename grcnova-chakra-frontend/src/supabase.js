// src/supabase.js
import { createClient } from '@supabase/supabase-js'

// Vite uses import.meta.env, not process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yerruxekpynafcedvuzw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllcnJ1eGVrcHluYWZjZWR2dXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MzAxOTUsImV4cCI6MjA3MDQwNjE5NX0.p-LgYI_b_cQCVtur79FZWXIE23mSd6RTk93197HVyWc';

// Log for debugging (remove in production)
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not properly set. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);