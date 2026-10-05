import { useState } from 'react'
import KakaoMap from './components/KakaoMap'
import RegisterModal from './components/RegisterModal'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        <KakaoMap />
      </main>

      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default App