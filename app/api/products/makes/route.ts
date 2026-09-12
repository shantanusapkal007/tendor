import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: makes, error } = await supabase
      .from('Make')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json(makes || []);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch makes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Make name is required' }, { status: 400 });
    }

    const normalizedName = name.trim().toUpperCase();

    // Check for duplicates
    const { data: existing } = await supabase
      .from('Make')
      .select('id')
      .eq('name', normalizedName)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Make already exists' }, { status: 409 });
    }

    const { data: make, error } = await supabase
      .from('Make')
      .insert({ name: normalizedName })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(make);
  } catch (error: any) {
    // Handle unique constraint from Supabase
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'Make already exists' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create make' }, { status: 500 });
  }
}
