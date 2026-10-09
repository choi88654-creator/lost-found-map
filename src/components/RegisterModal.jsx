import { useState, useRef } from 'react'
import { uploadItemImage } from '../lib/uploadImage'

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

function RegisterModal({ isOpen, isHidden, position, onClose, onStartPick }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  if (!isOpen || isHidden) return null

  const resetForm = () => {
    setTitle('')
    setCategory('')
    setDescription('')
    setImageFile(null)
    setImagePreview(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택할 수 있어요.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 용량은 5MB 이하만 가능해요.')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!position) {
      alert('발견 위치를 지도에서 지정해주세요.')
      return
    }

    setUploading(true)
    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadItemImage(imageFile)
      }

      console.log('제출된 값:', {
        title,
        category,
        description,
        lat: position.lat,
        lng: position.lng,
        imageUrl,
      })
      // 실제 DB insert는 다음주 수요일(10/15)에 연결 예정
    } catch (err) {
      console.error('이미지 업로드 실패:', err)
      alert('이미지 업로드에 실패했어요. 다시 시도해주세요.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">분실물 등록</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 사진 업로드 영역 */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 cursor-pointer overflow-hidden"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
              ) : (
                '+'
              )}
            </div>
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

          {/* 발견 위치 */}
          <div>
            <label className="block text-sm font-medium mb-1">발견 위치</label>
            <div
              className={`w-full border rounded px-3 py-2 text-sm ${
                position
                  ? 'bg-green-50 border-green-300 text-gray-800'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              {position
                ? `위도 ${position.lat.toFixed(6)}, 경도 ${position.lng.toFixed(6)}`
                : '아직 위치가 지정되지 않았어요'}
            </div>
            <button
              type="button"
              onClick={onStartPick}
              className="mt-2 w-full border border-blue-500 text-blue-500 rounded py-2 text-sm font-medium hover:bg-blue-50"
            >
              {position ? '📍 위치 다시 선택' : '📍 지도에서 위치 선택'}
            </button>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-500 text-white rounded py-2 font-medium hover:bg-blue-600 disabled:bg-blue-300"
          >
            {uploading ? '업로드 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal