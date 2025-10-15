import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⚠️  Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database initialization function
export async function initializeDatabase() {
  try {
    console.log('🔄 Checking database tables...');
    
    // Check if tables exist by querying them
    const tables = ['users', 'volunteers', 'tasks', 'events', 'content', 'urgent_needs', 'gallery', 'volunteer_hours', 'messages'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === '42P01') {
        console.log(`⚠️  Table '${table}' does not exist. Please run the SQL schema provided.`);
      }
    }
    
    console.log('✅ Database connection verified');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    return false;
  }
}
