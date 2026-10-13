import { supabase } from './supabase'
import { ensureSession } from './auth'

export async function fetchItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createItem(item) {
  await ensureSession()

  const { data, error } = await supabase
    .from('items')
    .insert([item])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateItemStatus(id, status) {
  await ensureSession()

  const { data, error } = await supabase
    .from('items')
    .update({ status })
    .eq('id', id)
    .select()

  if (error) throw error
  // RLS가 막으면 에러 없이 0행이 돌아오므로 따로 검사해야 함
  if (!data || data.length === 0) {
    throw new Error('수정 권한이 없거나 존재하지 않는 글입니다.')
  }
  return data[0]
}