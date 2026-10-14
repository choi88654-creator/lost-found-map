import { useState } from 'react'

const STATUS_STYLE = {
  보관중: 'bg-green-100 text-green-700',
  수령완료: 'bg-gray-200 text-gray-600',
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ItemDetailModal({ item, userId, onClose, onStatusChange }) {
  const [changing, setChanging] = useState(false)
  const [error, setError] = useState('')

  if (!item) return null

  const currentStatus = item.status || '보관중'
  const statusClass = STATUS_STYLE[currentStatus] || STATUS_STYLE['보관중']
  const isOwner = userId && item.owner_id === userId
  const nextStatus = currentStatus === '보관중' ? '수령완료' : '보관중'

  const handleToggle = async () => {
    if (changing) return
    setChanging(true)
    setError('')
    try {
      await onStatusChange(item, nextStatus)
    } catch (err) {
      console.error('상태 변경 실패:', err)
      setError('상태 변경에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setChanging(false)
    }
  }

  return (
    <div
       className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
       onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="bg-white rounded-lg w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400">
            사진 없음
          </div>
        )}

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span
                className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${statusClass}`}
              >
                {currentStatus}
              </span>
              <h2 className="text-lg font-bold">{item.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          <dl className="text-sm flex flex-col gap-2">
            <div className="flex gap-3">
              <dt className="w-20 text-gray-500 shrink-0">카테고리</dt>
              <dd>{item.category}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 text-gray-500 shrink-0">보관 장소</dt>
              <dd>{item.location_name || '정보 없음'}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 text-gray-500 shrink-0">등록일시</dt>
              <dd>{formatDate(item.created_at)}</dd>
            </div>
            {item.description && (
              <div className="flex gap-3">
                <dt className="w-20 text-gray-500 shrink-0">상세 설명</dt>
                <dd className="whitespace-pre-wrap">{item.description}</dd>
              </div>
            )}
          </dl>

          {/* 작성자 본인에게만 보이는 상태 변경 버튼 */}
          {isOwner && (
            <div className="mt-5">
              <button
                onClick={handleToggle}
                disabled={changing}
                className="w-full border border-blue-500 text-blue-500 rounded py-2 text-sm font-medium hover:bg-blue-50 disabled:opacity-50"
              >
                {changing
                  ? '변경 중...'
                  : nextStatus === '수령완료'
                  ? '✅ 수령완료로 변경'
                  : '↩️ 보관중으로 되돌리기'}
              </button>
              {error && (
                <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  )
}

export default ItemDetailModal