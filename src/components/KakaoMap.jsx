import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

function KakaoMap({ isPicking, pickedPosition, onPick }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)

  // 클릭 이벤트 안에서 "최신 값"을 읽기 위한 ref
  const isPickingRef = useRef(isPicking)
  const onPickRef = useRef(onPick)
  const pickedMarkerRef = useRef(null)

  useEffect(() => {
    isPickingRef.current = isPicking
  }, [isPicking])

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  // 1. 지도 초기화 + 클릭 이벤트
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
        const lat = latlng.getLat()
        const lng = latlng.getLng()
        console.log('클릭한 위치 - lat:', lat, 'lng:', lng)

        // 위치 선택 모드일 때만 부모(App)에게 좌표 전달
        if (isPickingRef.current) {
          onPickRef.current(lat, lng)
        }
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

  // 3. 위치 선택 모드일 때 커서를 십자 모양으로
  useEffect(() => {
    if (!map) return
    map.setCursor(isPicking ? 'crosshair' : '')
  }, [map, isPicking])

  // 4. 선택한 위치에 임시 마커(별 모양) 표시
  useEffect(() => {
    if (!map) return

    // 이전에 찍은 임시 마커가 있으면 제거
    if (pickedMarkerRef.current) {
      pickedMarkerRef.current.setMap(null)
      pickedMarkerRef.current = null
    }

    // 선택된 위치가 없으면(초기화 상태) 여기서 끝
    if (!pickedPosition) return

    const imageSrc =
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png'
    const markerImage = new window.kakao.maps.MarkerImage(
      imageSrc,
      new window.kakao.maps.Size(24, 35)
    )

    pickedMarkerRef.current = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(
        pickedPosition.lat,
        pickedPosition.lng
      ),
      map: map,
      image: markerImage,
    })
  }, [map, pickedPosition])

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}

export default KakaoMap