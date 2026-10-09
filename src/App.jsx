import { useState, useEffect, useCallback } from 'react'
import KakaoMap from './components/KakaoMap'
import RegisterModal from './components/RegisterModal'
import { fetchItems } from './lib/itemsApi'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPicking, setIsPicking] = useState(false)
  const [position, setPosition] = useState(null)
  const [items, setItems] = useState([])

  // DB에서 목록 불러오기
  const loadItems = useCallback(async () => {
    try {
      const data = await fetchItems()
      console.log('불러온 데이터:', data)
      setItems(data)
    } catch (err) {
      console.error('데이터 불러오기 실패:', err)
    }
  }, [])

  // 처음 접속했을 때 한 번 불러오기
  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleStartPick = () => setIsPicking(true)

  const handlePick = (lat, lng) => {
    setPosition({ lat, lng })
    setIsPicking(false)
  }

  const handleCancelPick = () => setIsPicking(false)

  const handleClose = () => {
    setIsModalOpen(false)
    setIsPicking(false)
    setPosition(null)
  }

  // 등록 성공 시: 모달 닫기 + 목록 다시 불러오기
  const handleCreated = async () => {
    handleClose()
    await loadItems()
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
          items={items}
          isPicking={isPicking}
          pickedPosition={position}
          onPick={handlePick}
        />

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
        onCreated={handleCreated}
      />
    </div>
  )
}

export default App