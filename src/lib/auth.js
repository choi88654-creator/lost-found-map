import { supabase } from './supabase'

// 세션이 없으면 익명 로그인. 브라우저에 세션이 저장되어 다음에도 같은 사용자로 인식됨
export async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.user

  const { data: signIn, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return signIn.user
}