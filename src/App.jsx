import { useState } from 'react'
import KakaoMap from './components/KakaoMap'
import RegisterModal from './components/RegisterModal'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pickMode, setPickMode] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // 지도를 클릭했을 때
  const handleMapClick = (loc) => {
    setSelectedLocation(loc)
    if (pickMode) {
      setPickMode(false)
      setIsModalOpen(true) // 위치 선택 모드였으면 모달 다시 열기
    }
  }

  // 모달에서 "지도에서 위치 선택" 눌렀을 때
  const handlePickLocation = () => {
    setIsModalOpen(false)
    setPickMode(true)
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
          onMapClick={handleMapClick}
          selectedLocation={selectedLocation}
        />

        {pickMode && (
          <div
            style={{ zIndex: 1000 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-3"
          >
            <span>지도를 클릭해서 위치를 정해주세요</span>
            <button
              onClick={() => {
                setPickMode(false)
                setIsModalOpen(true)
              }}
              className="underline"
            >
              취소
            </button>
          </div>
        )}
      </main>

      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        location={selectedLocation}
        onPickLocation={handlePickLocation}
      />
    </div>
  )
}

export default App