import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const DashboardModal = ({ open, title, description, onClose, children, footer }) => {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="border-b border-gray-100 px-6 pb-4 pt-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export default DashboardModal
