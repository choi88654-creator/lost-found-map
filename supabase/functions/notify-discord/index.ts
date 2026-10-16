import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

const cut = (text: string, max: number) =>
  text.length > max ? text.slice(0, max - 1) + '…' : text

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL')
  const siteUrl = Deno.env.get('SITE_URL')
  if (!webhookUrl) return reply({ error: 'webhook not configured' }, 500)

  let itemId: unknown
  try {
    const body = await req.json()
    itemId = body.itemId
  } catch {
    return reply({ error: 'invalid body' }, 400)
  }
  if (typeof itemId !== 'string' || itemId.length === 0) {
    return reply({ error: 'itemId required' }, 400)
  }

  // 서비스 키는 함수 실행 환경에 자동으로 들어있음 (직접 등록 불필요)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // "알림 보낼 권리"를 먼저 선점: 아직 알림 안 보냈고 + 5분 이내 글만 통과
  // 업데이트와 조회가 한 번에 일어나므로 동시에 두 번 호출돼도 한 번만 통과함
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data: item, error: claimError } = await supabase
    .from('items')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', itemId)
    .is('notified_at', null)
    .gte('created_at', since)
    .select(
      'id, title, category, location_name, description, lat, lng, image_url, created_at',
    )
    .maybeSingle()

  if (claimError) {
    console.error('db error', claimError)
    return reply({ error: 'db error' }, 500)
  }
  if (!item) return reply({ skipped: true })

  const fields = [{ name: '카테고리', value: item.category, inline: true }]
  if (item.location_name) {
    fields.push({
      name: '보관 장소',
      value: cut(item.location_name, 1000),
      inline: true,
    })
  }
  fields.push({
    name: '위치',
    value: `[카카오맵에서 보기](https://map.kakao.com/link/map/발견위치,${item.lat},${item.lng})`,
    inline: false,
  })

  const embed: Record<string, unknown> = {
    title: cut(`🔎 새 분실물: ${item.title}`, 250),
    color: 3447003,
    fields,
    footer: { text: '분실물 지도' },
    timestamp: item.created_at,
  }
  if (siteUrl) embed.url = siteUrl
  if (item.description) embed.description = cut(item.description, 500)
  if (item.image_url) embed.image = { url: item.image_url }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: '분실물 알림봇',
      // 사용자가 쓴 글에 @everyone이 있어도 멘션이 발동하지 않게 막음
      allowed_mentions: { parse: [] },
      embeds: [embed],
    }),
  })

  if (!res.ok) {
    console.error('discord failed', res.status, await res.text())
    // 전송 실패 시 선점을 되돌려서 재시도할 수 있게 함
    await supabase.from('items').update({ notified_at: null }).eq('id', item.id)
    return reply({ error: 'discord failed' }, 502)
  }

  return reply({ ok: true })
})