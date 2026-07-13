
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log('Connecting to:', supabaseUrl);
  const { data: clients, error: clientsError } = await supabase.from('clients').select('*');
  if (clientsError) {
    console.error('Clients Error:', clientsError);
  } else {
    console.log('Total Clients:', clients.length);
    console.log('Clients:', JSON.stringify(clients, null, 2));
  }

  const { data: locations, error: locationsError } = await supabase.from('locations').select('*');
  if (locationsError) {
    console.error('Locations Error:', locationsError);
  } else {
    console.log('Total Locations:', locations.length);
  }
}

check();
