import { useState, useRef } from 'react'
import { uploadItemImage } from '../lib/uploadImage'
import { createItem } from '../lib/itemsApi'

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

function RegisterModal({
  isOpen,
  isHidden,
  position,
  onClose,
  onStartPick,
  onCreated,
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen || isHidden) return null

  const resetForm = () => {
    setTitle('')
    setCategory('')
    setDescription('')
    setImageFile(null)
    setImagePreview(null)
    setErrors({})
    setSubmitError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    if (submitting) return // 등록 중에는 닫지 못하게
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
    setErrors((prev) => ({ ...prev, image: undefined }))
  }

  // 필수 항목 검사: 통과하면 true
  const validate = () => {
    const newErrors = {}
    if (!imageFile) newErrors.image = '사진을 등록해주세요.'
    if (!title.trim()) newErrors.title = '제목을 입력해주세요.'
    if (!category) newErrors.category = '카테고리를 선택해주세요.'
    if (!position) newErrors.position = '발견 위치를 지도에서 지정해주세요.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return // 중복 클릭 방지
    if (!validate()) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const imageUrl = await uploadItemImage(imageFile)

      await createItem({
        title: title.trim(),
        category,
        description: description.trim() || null,
        lat: position.lat,
        lng: position.lng,
        image_url: imageUrl,
        found_at: new Date().toISOString(),
      })

      resetForm()
      onCreated()
    } catch (err) {
      console.error('등록 실패:', err)
      setSubmitError('등록에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 my-4">
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
          {/* 사진 */}
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
              className={`w-24 h-24 bg-gray-100 border-2 border-dashed rounded flex items-center justify-center text-gray-400 cursor-pointer overflow-hidden ${
                errors.image ? 'border-red-400' : 'border-gray-300'
              }`}
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
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 검정 우산"
              className={`w-full border rounded px-3 py-2 ${
                errors.title ? 'border-red-400' : ''
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium mb-1">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${
                errors.category ? 'border-red-400' : ''
              }`}
            >
              <option value="">선택하세요</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">{errors.category}</p>
            )}
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
                  : errors.position
                  ? 'bg-red-50 border-red-400 text-red-500'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              {position
                ? `위도 ${position.lat.toFixed(6)}, 경도 ${position.lng.toFixed(6)}`
                : errors.position || '아직 위치가 지정되지 않았어요'}
            </div>
            <button
              type="button"
              onClick={onStartPick}
              className="mt-2 w-full border border-blue-500 text-blue-500 rounded py-2 text-sm font-medium hover:bg-blue-50"
            >
              {position ? '📍 위치 다시 선택' : '📍 지도에서 위치 선택'}
            </button>
          </div>

          {/* 서버 오류 메시지 */}
          {submitError && (
            <p className="text-red-500 text-sm text-center">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white rounded py-2 font-medium hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterModal