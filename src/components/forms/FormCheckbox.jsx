export default function FormCheckbox({
  name,
  label,
  checked,
  onChange,
  helpText
}) {
  return (
    <div className="mb-4">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={name} className="font-medium text-gray-700">
            {label}
          </label>
          {helpText && (
            <p className="text-gray-500">{helpText}</p>
          )}
        </div>
      </div>
    </div>
  )
}
