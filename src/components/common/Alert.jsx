export default function Alert({ type = 'info', title, children, onClose }) {
  const styles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      text: 'text-red-700'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      text: 'text-yellow-700'
    },
    success: {
      container: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      text: 'text-green-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      text: 'text-blue-700'
    }
  }

  const currentStyle = styles[type]

  return (
    <div className={`border rounded-md p-4 ${currentStyle.container}`}>
      <div className="flex">
        <div className="flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${currentStyle.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${currentStyle.text} ${title ? 'mt-2' : ''}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${currentStyle.icon} hover:opacity-75`}
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        )}
      </div>
    </div>
  )
}
