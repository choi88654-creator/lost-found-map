import { supabase } from './supabase'

export async function uploadItemImage(file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('item-images')
    .upload(fileName, file)

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from('item-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}