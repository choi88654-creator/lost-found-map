import { useState, useRef } from 'react'
import { uploadImage } from '../lib/uploadImage'

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

// location: 지도에서 선택한 좌표 { lat, lng } 또는 null
// onPickLocation: "지도에서 위치 선택" 버튼을 눌렀을 때 실행
function RegisterModal({ isOpen, onClose, location, onPickLocation }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  const [imageUrl, setImageUrl] = useState('')
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadError('')
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const url = await uploadImage(file)
      setImageUrl(url)
      console.log('업로드 성공, URL:', url)
    } catch (err) {
      console.error('업로드 실패:', err)
      setUploadError(err.message)
      setPreview('')
      setImageUrl('')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('제출된 값:', {
      title,
      category,
      description,
      imageUrl,
      lat: location?.lat,
      lng: location?.lng,
    })
    // 내일(금) 여기에 supabase insert 로직 추가 예정
  }

  const locationText = location
    ? `위도 ${location.lat.toFixed(5)}, 경도 ${location.lng.toFixed(5)}`
    : '아직 선택하지 않았어요'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">분실물 등록</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 cursor-pointer overflow-hidden"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
              ) : (
                '+'
              )}
            </div>
            {uploading && (
              <p className="text-sm text-gray-500 mt-1">업로드 중...</p>
            )}
            {uploadError && (
              <p className="text-sm text-red-500 mt-1">{uploadError}</p>
            )}
          </div>

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

          <div>
            <label className="block text-sm font-medium mb-1">상세 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="물건의 특징을 간단히 적어주세요"
              className="w-full border rounded px-3 py-2 h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">발견 위치</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 border rounded px-3 py-2 bg-gray-50 text-sm text-gray-500">
                {locationText}
              </div>
              <button
                type="button"
                onClick={onPickLocation}
                className="border border-blue-500 text-blue-500 rounded px-3 py-2 text-sm font-medium hover:bg-blue-50 whitespace-nowrap"
              >
                지도에서 선택
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-500 text-white rounded py-2 font-medium hover:bg-blue-600 disabled:bg-gray-300"
          >
            {uploading ? '업로드 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal