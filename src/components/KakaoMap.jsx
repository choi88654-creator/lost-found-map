import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

function KakaoMap() {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)

  // 1. 지도 초기화 (기존 코드와 동일)
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 SDK를 불러오지 못했습니다.')
      return
    }

    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 4,
      }
      const kakaoMap = new window.kakao.maps.Map(mapRef.current, options)
      setMap(kakaoMap)

      window.kakao.maps.event.addListener(kakaoMap, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng
        console.log('클릭한 위치 - lat:', latlng.getLat(), 'lng:', latlng.getLng())
      })
    })
  }, [])

  // 2. 지도가 준비되면 DB에서 데이터 불러와 마커 표시
  useEffect(() => {
    if (!map) return

    async function loadMarkers() {
      const { data, error } = await supabase.from('items').select('*')

      if (error) {
        console.error('데이터 불러오기 실패:', error)
        return
      }

      console.log('불러온 데이터:', data)

      data.forEach((item) => {
        const markerPosition = new window.kakao.maps.LatLng(item.lat, item.lng)
        new window.kakao.maps.Marker({
          position: markerPosition,
          map: map,
        })
      })
    }

    loadMarkers()
  }, [map])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}

export default KakaoMap