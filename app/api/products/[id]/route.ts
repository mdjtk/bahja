import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function mapProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    slug: p.slug,
    image: p.image,
    rating: p.rating,
    description: p.description,
    variantOrder: p.variant_order,
    variants: p.variants,
    active: p.active,
    created_at: p.created_at,
  };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookie = req.headers.get('cookie') || '';
  const hasAdmin = cookie.split(';').some((c) => c.trim().startsWith('bahja_admin='));
  if (!hasAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { data, error } = await supabase
      .from('bahja_products')
      .update({
        name: body.name,
        type: body.type,
        slug: body.slug,
        image: body.image,
        rating: body.rating,
        description: body.description,
        variant_order: body.variantOrder,
        variants: body.variants,
        active: body.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapProduct(data));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookie = req.headers.get('cookie') || '';
  const hasAdmin = cookie.split(';').some((c) => c.trim().startsWith('bahja_admin='));
  if (!hasAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('bahja_products')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapProduct(data));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
