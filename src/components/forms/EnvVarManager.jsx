import { RESERVED_ENV_NAMES } from '../../utils/constants'
import Button from '../common/Button'

/** Editor for devfile `env` lists (`[{ name, value }]`). */
export default function EnvVarManager({
  name,
  label = 'Environment Variables',
  items = [],
  onChange,
  emptyMessage = 'No environment variables defined.'
}) {
  const handleAdd = () => onChange([...items, { name: '', value: '' }])
  const handleRemove = (index) => onChange(items.filter((_, position) => position !== index))
  const handleUpdate = (index, field, value) =>
    onChange(items.map((item, position) => (position === index ? { ...item, [field]: value } : item)))

  const reserved = items.map((item) => item.name.trim()).filter((item) => RESERVED_ENV_NAMES.includes(item))

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
                name={`${name}-name-${index}`}
                aria-label={`Environment variable name ${index + 1}`}
                value={item.name}
                onChange={(event) => handleUpdate(index, 'name', event.target.value)}
                placeholder="NAME"
                className="flex-1 rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                name={`${name}-value-${index}`}
                aria-label={`Environment variable value ${index + 1}`}
                value={item.value}
                onChange={(event) => handleUpdate(index, 'value', event.target.value)}
                placeholder="value"
                className="flex-[2] rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <Button variant="danger" onClick={() => handleRemove(index)} className="text-xs px-2 py-1">
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      {reserved.length > 0 && (
        <p className="mt-1 text-sm text-red-600">
          {[...new Set(reserved)].join(', ')} {reserved.length > 1 ? 'are' : 'is'} reserved by the platform and
          cannot be redefined.
        </p>
      )}
      <Button variant="outline" onClick={handleAdd} className="w-full text-sm mt-2">
        Add Environment Variable
      </Button>
    </div>
  )
}
