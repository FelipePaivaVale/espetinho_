import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://duvtbhotcncsrjgiorao.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dnRiaG90Y25jc3JqZ2lvcmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxODYwMTAsImV4cCI6MjA1NDc2MjAxMH0.IGcuoH4cQKiXpuJRvVm4tPJPsCttcuqY2hmP5BfxYhs";

export const supabase = createClient(supabaseUrl, supabaseKey);