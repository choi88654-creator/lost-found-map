import { useState, useEffect, useCallback, useMemo } from 'react'
import KakaoMap from './components/KakaoMap'
import RegisterModal from './components/RegisterModal'
import ItemDetailModal from './components/ItemDetailModal'
import FilterBar from './components/FilterBar'
import { fetchItems, updateItemStatus } from './lib/itemsApi'
import { ensureSession } from './lib/auth'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPicking, setIsPicking] = useState(false)
  const [position, setPosition] = useState(null)
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [userId, setUserId] = useState(null)

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchItems()
      setItems(data)
    } catch (err) {
      console.error('데이터 불러오기 실패:', err)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  // 접속 시 익명 로그인(또는 기존 세션 복원)해서 내 ID 확보
  useEffect(() => {
    ensureSession()
      .then((user) => setUserId(user.id))
      .catch((err) => console.error('익명 로그인 실패:', err))
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemStatus = item.status || '보관중'
      const categoryOk =
        categoryFilter === 'all' || item.category === categoryFilter
      const statusOk = statusFilter === 'all' || itemStatus === statusFilter
      return categoryOk && statusOk
    })
  }, [items, categoryFilter, statusFilter])

  const isFiltered = categoryFilter !== 'all' || statusFilter !== 'all'

  const resetFilters = () => {
    setCategoryFilter('all')
    setStatusFilter('all')
  }

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

  const handleCreated = async () => {
    handleClose()
    await loadItems()
  }

  // 상태 변경: 성공하면 목록과 열려 있는 상세 모달을 모두 갱신
  const handleStatusChange = async (item, newStatus) => {
    const updated = await updateItemStatus(item.id, newStatus)
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
    setSelectedItem(updated)
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
          items={filteredItems}
          isPicking={isPicking}
          pickedPosition={position}
          onPick={handlePick}
          onItemClick={setSelectedItem}
        />

        {!isPicking && (
          <FilterBar
            category={categoryFilter}
            status={statusFilter}
            onCategoryChange={setCategoryFilter}
            onStatusChange={setStatusFilter}
          />
        )}

        {!isPicking && isFiltered && filteredItems.length === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-3 text-sm">
            <span>조건에 맞는 분실물이 없어요</span>
            <button onClick={resetFilters} className="text-blue-500 underline">
              필터 초기화
            </button>
          </div>
        )}

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

      <ItemDetailModal
        item={selectedItem}
        userId={userId}
        onClose={() => setSelectedItem(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}

export default App