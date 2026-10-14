/** Multi-select rendered as checkboxes, used for `metadata.architectures`. */
export default function CheckboxGroup({ name, label, options, selected = [], onChange, helpText }) {
  const toggle = (option, checked) => {
    if (checked) {
      onChange([...selected, option].filter((value, index, values) => values.indexOf(value) === index))
    } else {
      onChange(selected.filter((value) => value !== option))
    }
  }

  return (
    <div className="mb-4">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <div className="flex flex-wrap gap-4 mt-2">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name={`${name}-${option}`}
              checked={selected.includes(option)}
              onChange={(event) => toggle(option, event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  )
}
