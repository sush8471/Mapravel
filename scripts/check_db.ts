
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbvudkxkxpowwuqpxbhy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhidnVka3FreHBvd3d1cXB4Ymh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyODM4NTcsImV4cCI6MjA4Njg1OTg1N30.MmzhXAi2iylxyd6qLX8syHFZ8mBsFmZBBqKA2dQH_DM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('clients').select('*');
  console.log('Clients:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
}

check();
