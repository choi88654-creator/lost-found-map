import { useState } from 'react'

function PlaceSearch({ onSelect }) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = (e) => {
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
    const ps = new services.Places()
    ps.keywordSearch(q, (data, status) => {
      setLoading(false)
      if (status === services.Status.OK) {
        setResults(data.slice(0, 5))
      } else if (status === services.Status.ZERO_RESULT) {
        setResults([])
        setMessage('검색 결과가 없어요. 다른 키워드로 찾아보세요.')
      } else {
        setResults([])
        setMessage('검색 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.')
      }
    })
  }

  const handleSelect = (place) => {
    // 카카오 결과에서 x가 경도, y가 위도이고 둘 다 문자열이라 숫자로 바꿔야 함
    onSelect({ lat: Number(place.y), lng: Number(place.x) })
    setResults([])
    setMessage(
      `"${place.place_name}" 근처로 이동했어요. 지도에서 정확한 위치를 눌러주세요.`
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-2">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="장소·주소 검색 (예: 학생회관)"
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

      {message && <p className="text-xs text-gray-500 mt-2 px-1">{message}</p>}

      {results.length > 0 && (
        <ul className="mt-2 max-h-48 overflow-y-auto divide-y">
          {results.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full text-left px-2 py-2 hover:bg-gray-50"
              >
                <div className="text-sm font-medium">{place.place_name}</div>
                <div className="text-xs text-gray-500">
                  {place.road_address_name || place.address_name}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PlaceSearch