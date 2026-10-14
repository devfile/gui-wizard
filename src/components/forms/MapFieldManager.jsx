import Button from '../common/Button'

/**
 * Editor for the devfile's `map[string]string` fields (git remotes, variables,
 * deployment/service annotations).
 *
 * Entries are kept as an ordered `[{ key, value }]` array so that a key stays
 * editable while it is being typed.
 */
export default function MapFieldManager({
  name,
  label,
  items = [],
  onChange,
  keyLabel = 'Key',
  valueLabel = 'Value',
  keyPlaceholder = 'key',
  valuePlaceholder = 'value',
  addButtonText = 'Add entry',
  emptyMessage = 'No entries yet.',
  helpText
}) {
  const handleAdd = () => onChange([...items, { key: '', value: '' }])
  const handleRemove = (index) => onChange(items.filter((_, position) => position !== index))
  const handleUpdate = (index, field, value) =>
    onChange(items.map((item, position) => (position === index ? { ...item, [field]: value } : item)))

  const duplicateKeys = items
    .map((item) => item.key.trim())
    .filter((key, index, keys) => key !== '' && keys.indexOf(key) !== index)

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
                name={`${name}-key-${index}`}
                aria-label={`${keyLabel} ${index + 1}`}
                value={item.key}
                onChange={(event) => handleUpdate(index, 'key', event.target.value)}
                placeholder={keyPlaceholder}
                className="flex-1 rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                name={`${name}-value-${index}`}
                aria-label={`${valueLabel} ${index + 1}`}
                value={item.value}
                onChange={(event) => handleUpdate(index, 'value', event.target.value)}
                placeholder={valuePlaceholder}
                className="flex-[2] rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <Button variant="danger" onClick={() => handleRemove(index)} className="text-xs px-2 py-1">
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      {duplicateKeys.length > 0 && (
        <p className="mt-1 text-sm text-red-600">
          Duplicate keys are overwritten: {[...new Set(duplicateKeys)].join(', ')}
        </p>
      )}
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
      <Button variant="outline" onClick={handleAdd} className="w-full text-sm mt-2">
        {addButtonText}
      </Button>
    </div>
  )
}
