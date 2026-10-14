import { useState } from 'react'

export default function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-200 rounded-md mb-4 bg-gray-50">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span>
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {badge ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              {badge}
            </span>
          ) : null}
          {description && <span className="block text-xs text-gray-500 mt-0.5">{description}</span>}
        </span>
        <span className="text-gray-500 text-xs ml-4">{open ? '▲ Hide' : '▼ Show'}</span>
      </button>
      {open && <div className="px-4 pb-4 pt-1 bg-white border-t border-gray-200">{children}</div>}
    </div>
  )
}
