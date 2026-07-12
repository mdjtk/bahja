import { supabaseAdmin } from './supabase'

export async function deductStock(items: Array<{ id: string; variant: string; qty: number }>): Promise<void> {
  for (const item of items) {
    const { error } = await supabaseAdmin.rpc('decrement_inventory', {
      p_product_id: item.id,
      p_variant_key: item.variant,
      p_qty: item.qty,
    })
    if (error) {
      console.error('Failed to deduct stock for', item.id, item.variant, error)
    }
  }
}