import { useState } from 'react'
import KakaoMap from './components/KakaoMap'
import RegisterModal from './components/RegisterModal'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPicking, setIsPicking] = useState(false)
  const [position, setPosition] = useState(null) // { lat, lng } 또는 null

  // 모달에서 "지도에서 위치 선택" 버튼을 눌렀을 때
  const handleStartPick = () => {
    setIsPicking(true)
  }

  // 지도에서 위치를 클릭했을 때 (KakaoMap이 호출)
  const handlePick = (lat, lng) => {
    setPosition({ lat, lng })
    setIsPicking(false)
  }

  // 위치 선택 취소 (모달로 돌아감)
  const handleCancelPick = () => {
    setIsPicking(false)
  }

  // 모달 닫기 (선택했던 위치도 초기화)
  const handleClose = () => {
    setIsModalOpen(false)
    setIsPicking(false)
    setPosition(null)
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="h-14 flex items-center justify-between px-4 bg-white shadow z-10">
        <h1 className="font-bold">분실물 지도</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-600"
        >
          + 등록
        </button>
      </header>

      <main className="flex-1 relative">
        <KakaoMap
          isPicking={isPicking}
          pickedPosition={position}
          onPick={handlePick}
        />

        {/* 위치 선택 중일 때 지도 위에 뜨는 안내 */}
        {isPicking && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-3 text-sm">
            <span className="font-medium">📍 발견 위치를 지도에서 클릭하세요</span>
            <button
              onClick={handleCancelPick}
              className="text-gray-500 hover:text-gray-800 underline"
            >
              취소
            </button>
          </div>
        )}
      </main>

      <RegisterModal
        isOpen={isModalOpen}
        isHidden={isPicking}
        position={position}
        onClose={handleClose}
        onStartPick={handleStartPick}
      />
    </div>
  )
}

export default App