import { CATEGORIES, STATUSES } from '../constants'

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-sm border shadow-sm ${
        active
          ? 'bg-blue-500 text-white border-blue-500'
          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

function FilterBar({ category, status, onCategoryChange, onStatusChange }) {
  return (
    <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-1 pointer-events-none">
      {/* 상태 필터 */}
      <div className="flex gap-2 overflow-x-auto py-1 pointer-events-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={status === 'all'} onClick={() => onStatusChange('all')}>
          전체 상태
        </Chip>
        {STATUSES.map((s) => (
          <Chip key={s} active={status === s} onClick={() => onStatusChange(s)}>
            {s}
          </Chip>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto py-1 pointer-events-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip
          active={category === 'all'}
          onClick={() => onCategoryChange('all')}
        >
          전체
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            active={category === c}
            onClick={() => onCategoryChange(c)}
          >
            {c}
          </Chip>
        ))}
      </div>
    </div>
  )
}

export default FilterBar