import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createSuperAdmin() {
  const userId = '559eb3f1-de5c-4c68-9eae-9934b356d66b';

  try {
    // Call the set_claim function we created in the migration
    const { error } = await supabase.rpc('set_claim', {
      uid: userId,
      claim: 'role',
      value: 'superadmin'
    });

    if (error) throw error;

    console.log('Superadmin role assigned successfully');

  } catch (error) {
    console.error('Error updating superadmin:', error);
  }
}

createSuperAdmin(); 