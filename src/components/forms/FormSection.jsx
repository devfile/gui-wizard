export default function FormSection({ title, description, children }) {
  return (
    <div className="mb-6">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
