/**
 * Three-way boolean control used for devfile flags where "not set" is
 * semantically different from `false` (for example `autoBuild`,
 * `deployByDefault` and any flag inside a parent override).
 */
export default function TriStateSelect({
  name,
  label,
  value,
  onChange,
  helpText,
  unsetLabel = 'Not set (use the default)'
}) {
  const handleChange = (event) => {
    const raw = event.target.value
    onChange(raw === '' ? undefined : raw === 'true')
  }

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value === true ? 'true' : value === false ? 'false' : ''}
        onChange={handleChange}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="">{unsetLabel}</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      {helpText && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  )
}
