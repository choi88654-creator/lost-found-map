import { supabase } from './supabase'

// 알림 실패가 등록 성공을 망치면 안 되므로 에러는 콘솔에만 남김
export async function notifyDiscord(itemId) {
  try {
    const { error } = await supabase.functions.invoke('notify-discord', {
      body: { itemId },
    })
    if (error) console.error('디스코드 알림 실패:', error)
  } catch (err) {
    console.error('디스코드 알림 실패:', err)
  }
}