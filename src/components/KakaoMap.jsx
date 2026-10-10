import { useEffect, useRef, useState } from 'react'

function KakaoMap({ items, isPicking, pickedPosition, onPick, onItemClick }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)

  const isPickingRef = useRef(isPicking)
  const onPickRef = useRef(onPick)
  const onItemClickRef = useRef(onItemClick)
  const pickedMarkerRef = useRef(null)
  const itemMarkersRef = useRef([])

  useEffect(() => {
    isPickingRef.current = isPicking
  }, [isPicking])

  useEffect(() => {
    onPickRef.current = onPick
  }, [onPick])

  useEffect(() => {
    onItemClickRef.current = onItemClick
  }, [onItemClick])

  // 1. 지도 초기화 + 클릭 이벤트
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 SDK를 불러오지 못했습니다.')
      return
    }

    window.kakao.maps.load(() => {
      const kakaoMap = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 4,
      })
      setMap(kakaoMap)

      window.kakao.maps.event.addListener(kakaoMap, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng
        if (isPickingRef.current) {
          onPickRef.current(latlng.getLat(), latlng.getLng())
        }
      })
    })
  }, [])

  // 2. items가 바뀔 때마다 마커 다시 그리기 + 마커 클릭 이벤트
  useEffect(() => {
    if (!map) return

    itemMarkersRef.current.forEach((marker) => marker.setMap(null))
    itemMarkersRef.current = []

    items.forEach((item) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(item.lat, item.lng),
        map: map,
        title: item.title,
      })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 위치 선택 중에는 상세 모달을 띄우지 않음
        if (isPickingRef.current) return
        onItemClickRef.current(item)
      })

      itemMarkersRef.current.push(marker)
    })
  }, [map, items])

  // 3. 위치 선택 중 커서 모양
  useEffect(() => {
    if (!map) return
    map.setCursor(isPicking ? 'crosshair' : '')
  }, [map, isPicking])

  // 4. 선택한 위치의 임시 별 마커
  useEffect(() => {
    if (!map) return

    if (pickedMarkerRef.current) {
      pickedMarkerRef.current.setMap(null)
      pickedMarkerRef.current = null
    }
    if (!pickedPosition) return

    const markerImage = new window.kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
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