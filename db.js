import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yhvzahgsoammozhrcerk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlodnphaGdzb2FtbW96aHJjZXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDkwMDYsImV4cCI6MjA3NzU4NTAwNn0.sKvxBXpZ5Jcm2JPqqkHVzen2St68hWV7-0bAJbs4zu4";
const sql = createClient(supabaseUrl, supabaseKey);

export default sql;
