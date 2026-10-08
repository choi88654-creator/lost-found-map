import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

function KakaoMap({ onMapClick, selectedLocation }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const onMapClickRef = useRef(onMapClick)
  const selectedOverlayRef = useRef(null)

  // 최신 클릭 핸들러를 항상 ref에 보관
  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])

  // 1. 지도 초기화
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 SDK를 불러오지 못했습니다.')
      return
    }

    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 4,
      }
      const kakaoMap = new window.kakao.maps.Map(mapRef.current, options)
      setMap(kakaoMap)

      window.kakao.maps.event.addListener(kakaoMap, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng
        const loc = { lat: latlng.getLat(), lng: latlng.getLng() }
        console.log('클릭한 위치 - lat:', loc.lat, 'lng:', loc.lng)
        if (onMapClickRef.current) onMapClickRef.current(loc)
      })
    })
  }, [])

  // 2. DB 데이터로 마커 표시
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

  // 3. 선택한 위치에 파란 점 표시
  useEffect(() => {
    if (!map) return

    if (!selectedLocation) {
      if (selectedOverlayRef.current) {
        selectedOverlayRef.current.setMap(null)
        selectedOverlayRef.current = null
      }
      return
    }

    const position = new window.kakao.maps.LatLng(
      selectedLocation.lat,
      selectedLocation.lng
    )

    if (!selectedOverlayRef.current) {
      selectedOverlayRef.current = new window.kakao.maps.CustomOverlay({
        position,
        xAnchor: 0.5,
        yAnchor: 0.5,
        content:
          '<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 6px rgba(0,0,0,0.5);"></div>',
      })
    } else {
      selectedOverlayRef.current.setPosition(position)
    }
    selectedOverlayRef.current.setMap(map)
  }, [map, selectedLocation])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}

export default KakaoMap