import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We need the Service Role Key to delete users
// This key bypasses Row Level Security and has admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    if (!supabaseServiceKey) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables.");
      return NextResponse.json({ error: 'Server misconfiguration: Missing service role key' }, { status: 500 });
    }

    // Initialize Supabase with the SERVICE ROLE key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the user's token using the admin client
    const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
    
    if (verifyError || !user) {
      return NextResponse.json({ error: 'Invalid session token' }, { status: 401 });
    }

    // First, we must delete any orders associated with this user
    // Otherwise, PostgreSQL will block the user deletion due to foreign key constraints!
    const { error: deleteOrdersError } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('user_id', user.id);

    if (deleteOrdersError) {
      console.error("Error deleting user orders:", deleteOrdersError);
      return NextResponse.json({ error: 'Failed to delete user orders from database' }, { status: 500 });
    }

    // Now that the foreign key constraints are clear, we can delete the user account
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json({ error: 'Failed to delete user account from database' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Account permanently deleted' });

  } catch (error) {
    console.error("Unexpected error in delete route:", error);
    return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
  }
}
