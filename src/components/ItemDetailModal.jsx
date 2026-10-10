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

function ItemDetailModal({ item, onClose }) {
  if (!item) return null

  const statusClass = STATUS_STYLE[item.status] || STATUS_STYLE['보관중']

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md mx-4 my-4 overflow-hidden"
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
                {item.status || '보관중'}
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
        </div>
      </div>
    </div>
  )
}

export default ItemDetailModal