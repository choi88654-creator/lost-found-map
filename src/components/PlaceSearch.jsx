import { useState } from 'react'

function toResult(services, query, kind) {
  return new Promise((resolve) => {
    const callback = (data, status) => {
      if (status === services.Status.OK) resolve({ ok: true, list: data })
      else if (status === services.Status.ZERO_RESULT)
        resolve({ ok: true, list: [] })
      else resolve({ ok: false, list: [] })
    }
    if (kind === 'address') {
      new services.Geocoder().addressSearch(query, callback)
    } else {
      new services.Places().keywordSearch(query, callback)
    }
  })
}

function PlaceSearch({ onSelect }) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    const q = keyword.trim()
    if (!q) return

    const services = window.kakao?.maps?.services
    if (!services) {
      setMessage('검색 기능을 불러오지 못했어요. 새로고침 후 다시 시도해주세요.')
      return
    }

    setLoading(true)
    setMessage('')

    const [addr, place] = await Promise.all([
      toResult(services, q, 'address'),
      toResult(services, q, 'place'),
    ])
    setLoading(false)

    if (!addr.ok && !place.ok) {
      setResults([])
      setMessage('검색 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.')
      return
    }

    const merged = [
      ...addr.list.slice(0, 3).map((a) => ({
        key: `a-${a.x}-${a.y}-${a.address_name}`,
        type: '주소',
        name: a.road_address?.address_name || a.address_name,
        sub: a.road_address ? a.address?.address_name || '' : '',
        lat: Number(a.y),
        lng: Number(a.x),
      })),
      ...place.list.slice(0, 4).map((p) => ({
        key: `p-${p.id}`,
        type: '장소',
        name: p.place_name,
        sub: p.road_address_name || p.address_name,
        lat: Number(p.y),
        lng: Number(p.x),
      })),
    ]

    setResults(merged)
    if (merged.length === 0) {
      setMessage('검색 결과가 없어요. 번지까지 입력하면 더 정확해요. (예: 합정동 123-4)')
    }
  }

  const handleSelect = (item) => {
    // 카카오 결과에서 x가 경도, y가 위도
    onSelect({ lat: item.lat, lng: item.lng })
    setResults([])
    setMessage(`"${item.name}" 근처로 이동했어요. 지도에서 정확한 위치를 눌러주세요.`)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="장소·주소 검색 (예: 합정동 123-4)"
          className="flex-1 min-w-0 border rounded px-3 py-2 text-base"
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 bg-blue-500 text-white rounded px-4 text-sm font-medium disabled:bg-blue-300"
        >
          {loading ? '검색 중' : '검색'}
        </button>
      </form>

      <p className="text-xs text-gray-400 mt-2 px-1">
        집 안쪽처럼 사적인 위치는 피하고, 근처 길이나 입구로 지정해주세요.
      </p>

      {message && <p className="text-xs text-gray-500 mt-1 px-1">{message}</p>}

      {results.length > 0 && (
        <ul className="mt-2 max-h-48 overflow-y-auto divide-y">
          {results.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-2 py-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      item.type === '주소'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-sm font-medium truncate">{item.name}</span>
                </div>
                {item.sub && (
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {item.sub}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PlaceSearch