import { supabase } from './supabase'

// 전체 분실물 목록 불러오기
export async function fetchItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 분실물 1건 등록
export async function createItem(item) {
  const { data, error } = await supabase
    .from('items')
    .insert([item])
    .select()
    .single()

  if (error) throw error
  return data
}