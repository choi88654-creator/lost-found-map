import { useEffect, useRef } from 'react'

function KakaoMap() {
  const mapRef = useRef(null)

  useEffect(() => {
    // 카카오맵 SDK가 정상적으로 로드됐는지 먼저 확인
    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 SDK 로드 실패. index.html의 script 태그와 appkey를 확인하세요.')
      return
    }

    // autoload=false로 설정했기 때문에, load 콜백 안에서 지도를 생성해야 함
    window.kakao.maps.load(() => {
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청 좌표 (초기 중심점)
        level: 4, // 숫자가 작을수록 지도가 확대됨 (1~14 정도 범위)
      }

      const map = new window.kakao.maps.Map(mapRef.current, options)

      // 지도를 클릭하면 해당 좌표를 콘솔에 출력하는 이벤트 리스너
      window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
        const latlng = mouseEvent.latLng
        console.log('클릭한 위치 → lat:', latlng.getLat(), ' lng:', latlng.getLng())
      })
    })
  }, [])

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default KakaoMap