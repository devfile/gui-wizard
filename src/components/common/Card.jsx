export default function Card({ children, title, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
