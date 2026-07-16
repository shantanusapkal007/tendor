import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    let query = supabase.from('Customer').select('*').order('createdAt', { ascending: false });
    
    if (q) {
      query = query.ilike('name', `%${q}%`);
    }

    const { data: customers, error } = await query;

    if (error) throw error;

    return NextResponse.json(customers || []);
  } catch (error) {
    console.error('Customers GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('Customer')
      .select('id')
      .ilike('name', data.name.trim())
      .maybeSingle();

    if (existingCustomer) {
      return NextResponse.json({ error: `Customer with name "${data.name}" already exists.` }, { status: 400 });
    }

    const { data: newCustomer, error } = await supabase
      .from('Customer')
      .insert({
        name: data.name.trim(),
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        contactPerson: data.contactPerson || null
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error('Customer POST error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
