import { useState } from 'react'

const CATEGORIES = [
  '지갑/카드',
  '전자기기',
  '가방',
  '의류/잡화',
  '도서/문서',
  '열쇠',
  '우산',
  '액세서리',
  '기타',
]

function RegisterModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('제출된 값:', { title, category, description })
    // 다음 주(수요일)에 실제 좌표 연동, 등록 로직 추가 예정
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">분실물 등록</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 사진 업로드 영역 (다음주 수요일에 실제 기능 연결 예정) */}
          <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 cursor-pointer">
            +
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 검정 우산"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium mb-1">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">선택하세요</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="block text-sm font-medium mb-1">상세 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="물건의 특징을 간단히 적어주세요"
              className="w-full border rounded px-3 py-2 h-20 resize-none"
            />
          </div>

          {/* 발견 위치 (다음주 수요일에 지도 클릭 연동 예정) */}
          <div>
            <label className="block text-sm font-medium mb-1">발견 위치</label>
            <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-400 text-sm">
              지도를 클릭해서 위치를 지정하세요
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white rounded py-2 font-medium hover:bg-blue-600"
          >
            등록하기
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal