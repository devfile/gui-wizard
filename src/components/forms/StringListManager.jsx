import Button from '../common/Button'

/** Editor for the devfile's plain `string[]` fields (container command, args, ...). */
export default function StringListManager({
  name,
  label,
  items = [],
  onChange,
  placeholder = '',
  addButtonText = 'Add entry',
  emptyMessage = 'No entries yet.',
  helpText,
  suggestions
}) {
  const listId = suggestions && suggestions.length > 0 ? `${name}-suggestions` : undefined
  const handleAdd = () => onChange([...items, ''])
  const handleRemove = (index) => onChange(items.filter((_, position) => position !== index))
  const handleUpdate = (index, value) =>
    onChange(items.map((item, position) => (position === index ? value : item)))

  return (
    <div className="mb-4">
      {label && <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>}
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 italic py-2">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                name={`${name}-${index}`}
                aria-label={`${label || name} ${index + 1}`}
                value={item}
                onChange={(event) => handleUpdate(index, event.target.value)}
                placeholder={placeholder}
                list={listId}
                className="flex-1 rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <Button variant="danger" onClick={() => handleRemove(index)} className="text-xs px-2 py-1">
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      {listId && (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
      <Button variant="outline" onClick={handleAdd} className="w-full text-sm mt-2">
        {addButtonText}
      </Button>
    </div>
  )
}
