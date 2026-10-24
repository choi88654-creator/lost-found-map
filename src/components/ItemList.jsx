const STATUS_STYLE = {
  보관중: 'bg-green-100 text-green-700',
  수령완료: 'bg-gray-200 text-gray-600',
}

function formatDay(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })
}

function ItemList({ items, onSelect, onClose }) {
  return (
    <aside className="absolute z-20 bg-white shadow-xl flex flex-col bottom-0 left-0 right-0 max-h-[50%] rounded-t-xl md:top-28 md:right-3 md:bottom-3 md:left-auto md:w-80 md:max-h-none md:rounded-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <h2 className="font-bold text-sm">
          분실물 목록{' '}
          <span className="text-gray-400 font-normal">{items.length}건</span>
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800"
          aria-label="목록 닫기"
        >
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          조건에 맞는 분실물이 없어요
        </p>
      ) : (
        <ul className="overflow-y-auto divide-y">
          {items.map((item) => {
            const status = item.status || '보관중'
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="w-full flex gap-3 p-3 text-left hover:bg-gray-50"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      loading="lazy"
                      className="w-14 h-14 rounded object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded bg-gray-100 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          STATUS_STYLE[status] || STATUS_STYLE['보관중']
                        }`}
                      >
                        {status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDay(item.created_at)}
                      </span>
                    </div>
                    <p className="font-medium text-sm truncate mt-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.category}
                      {item.location_name ? ` · ${item.location_name}` : ''}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

export default ItemList