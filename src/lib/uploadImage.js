import { supabase } from './supabase'

const BUCKET = 'item-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// 저장된 파일 경로 → 공개 URL 변환
export function getPublicUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

// 파일 업로드 후 공개 URL 반환
export async function uploadImage(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 올릴 수 있어요.')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('5MB 이하 이미지만 올릴 수 있어요.')
  }

  const ext = file.name.split('.').pop().toLowerCase()
  const fileName = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  return getPublicUrl(fileName)
}