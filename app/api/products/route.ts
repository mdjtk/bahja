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

export async function GET() {
  const { data, error } = await supabase
    .from('bahja_products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(mapProduct));
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || '';
  const hasAdmin = cookie.split(';').some((c) => c.trim().startsWith('bahja_admin='));
  if (!hasAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('bahja_products')
      .insert({
        id: body.id,
        name: body.name,
        type: body.type,
        slug: body.slug,
        image: body.image,
        rating: body.rating || 5.0,
        description: body.description,
        variant_order: body.variantOrder,
        variants: body.variants,
        active: body.active !== undefined ? body.active : true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(mapProduct(data), { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
