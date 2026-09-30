import KakaoMap from './components/KakaoMap'

function App() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="h-14 flex items-center px-4 bg-white shadow">
        <h1 className="font-bold">분실물 지도</h1>
      </header>
      <main className="flex-1">
        <KakaoMap />
      </main>
    </div>
  )
}

export default App