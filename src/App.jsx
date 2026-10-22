import { useState, useEffect, useCallback, useMemo } from 'react'
import KakaoMap from './components/KakaoMap'
import RegisterModal from './components/RegisterModal'
import ItemDetailModal from './components/ItemDetailModal'
import FilterBar from './components/FilterBar'
import PlaceSearch from './components/PlaceSearch'
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
  const [focusTarget, setFocusTarget] = useState(null)

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

  // 검색 결과 선택: 지도만 이동 (위치 확정은 지도 클릭으로)
  const handleSearchSelect = ({ lat, lng }) => {
    setFocusTarget({ lat, lng })
  }

  // 현재 위치로 바로 지정
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 정보를 지원하지 않아요.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        if (accuracy > 100) {
          const ok = window.confirm(
            `위치 정확도가 낮아요 (오차 약 ${Math.round(accuracy)}m). 그래도 사용할까요?`
          )
          if (!ok) return
        }
        setPosition({ lat: latitude, lng: longitude })
        setFocusTarget({ lat: latitude, lng: longitude })
      },
      () =>
        alert(
          '현재 위치를 가져오지 못했어요. 위치 권한을 확인하거나 지도에서 직접 선택해주세요.'
        ),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleClose = () => {
    setIsModalOpen(false)
    setIsPicking(false)
    setPosition(null)
  }

  const handleCreated = async () => {
    handleClose()
    await loadItems()
  }

  const handleStatusChange = async (item, newStatus) => {
    const updated = await updateItemStatus(item.id, newStatus)
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
    setSelectedItem(updated)
  }

  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden">
      <header className="h-14 flex items-center justify-between px-4 bg-white shadow z-10">
        <h1 className="font-bold">분실물 지도</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600"
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
          focusTarget={focusTarget}
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
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 max-w-[90%] bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-3 text-sm">
            <span>조건에 맞는 분실물이 없어요</span>
            <button onClick={resetFilters} className="text-blue-500 underline">
              필터 초기화
            </button>
          </div>
        )}

        {isPicking && (
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-col items-center gap-2 pointer-events-none">
            <div className="pointer-events-auto max-w-full bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-3 text-sm">
              <span className="font-medium">
                📍 지도를 눌러 위치를 지정하세요
              </span>
              <button
                onClick={handleCancelPick}
                className="text-gray-500 hover:text-gray-800 underline"
              >
                취소
              </button>
            </div>
            <div className="pointer-events-auto w-full max-w-md">
              <PlaceSearch onSelect={handleSearchSelect} />
            </div>
          </div>
        )}
      </main>

      <RegisterModal
        isOpen={isModalOpen}
        isHidden={isPicking}
        position={position}
        onClose={handleClose}
        onStartPick={handleStartPick}
        onUseCurrentLocation={handleUseCurrentLocation}
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