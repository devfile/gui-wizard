import { parseAttributes } from '../../utils/devfileGenerator'
import FormTextarea from './FormTextarea'

const PLACEHOLDER = `controller.devfile.io/storage-type: ephemeral
pod-overrides:
  spec:
    runtimeClassName: kata`

/**
 * Free-form `attributes` map editor.
 *
 * The devfile schema allows arbitrary YAML here, so the value is kept as raw
 * text in the wizard state and parsed when the devfile is serialized.
 */
export default function AttributesEditor({
  name,
  label = 'Attributes',
  value = '',
  onChange,
  rows = 4,
  helpText = 'Free-form YAML map of implementation specific attributes.'
}) {
  const { error } = parseAttributes(value)

  return (
    <FormTextarea
      name={name}
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      monospace
      placeholder={PLACEHOLDER}
      helpText={helpText}
      error={error ? `Not applied until valid: ${error}` : undefined}
    />
  )
}
