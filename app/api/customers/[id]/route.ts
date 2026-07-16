import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await request.json();

    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const { data: updatedCustomer, error } = await supabase
      .from('Customer')
      .update({
        name: data.name.trim(),
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        contactPerson: data.contactPerson || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    console.error('Customer PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update customer', details: error }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Check if the customer has any quotes
    const { data: quotes, error: checkError } = await supabase
      .from('Quote')
      .select('id')
      .eq('customerId', id)
      .limit(1);

    if (checkError) throw checkError;

    if (quotes && quotes.length > 0) {
      return NextResponse.json({ error: 'Cannot delete a customer that has existing quotes.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('Customer')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
