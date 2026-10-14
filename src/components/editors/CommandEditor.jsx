import { COMMAND_GROUPS, COMMAND_TYPES } from '../../utils/constants'
import { applyCommandType, getCommandType } from '../../utils/factories'
import AttributesEditor from '../forms/AttributesEditor'
import CollapsibleSection from '../forms/CollapsibleSection'
import EnvVarManager from '../forms/EnvVarManager'
import FormCheckbox from '../forms/FormCheckbox'
import FormInput from '../forms/FormInput'
import FormSelect from '../forms/FormSelect'
import StringListManager from '../forms/StringListManager'
import TriStateSelect from '../forms/TriStateSelect'

/** Checkbox for top-level commands, tri-state inside parent overrides. */
function BoolField({ partial, name, label, value, onChange, helpText }) {
  if (partial) {
    return <TriStateSelect name={name} label={label} value={value} onChange={onChange} helpText={helpText} />
  }

  return (
    <FormCheckbox
      name={name}
      label={label}
      checked={value === true}
      onChange={(event) => onChange(event.target.checked)}
      helpText={helpText}
    />
  )
}

/** `group` is shared by the three command types. */
function GroupEditor({ prefix, index, group = {}, onChange, partial }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormSelect
        name={`${prefix}-group-kind-${index}`}
        label="Command Group"
        value={group.kind || ''}
        onChange={(event) => onChange({ ...group, kind: event.target.value })}
        options={COMMAND_GROUPS}
        placeholder="No group"
        helpText="Groups drive the build/run/test/debug actions of the IDE"
      />

      {group.kind ? (
        <BoolField
          partial={partial}
          name={`${prefix}-group-isDefault-${index}`}
          label="Default command of the group"
          value={group.isDefault}
          onChange={(value) => onChange({ ...group, isDefault: value })}
          helpText="Only one command per group can be the default one"
        />
      ) : null}
    </div>
  )
}

/**
 * Editor for a single devfile command.
 *
 * `partial` is used for `parent.commands` overrides, where no field is required
 * and booleans keep a distinct "not set" state.
 */
export default function CommandEditor({
  index,
  value,
  onChange,
  partial = false,
  prefix = 'command',
  componentNames = [],
  containerNames = [],
  commandIds = []
}) {
  const type = getCommandType(value)
  const body = value[type] || {}
  const updateBody = (patch) => onChange({ ...value, [type]: { ...body, ...patch } })

  const otherCommandIds = commandIds.filter((id) => id && id !== value.id)

  return (
    <div className="space-y-2">
      <FormInput
        name={`${prefix}-id-${index}`}
        label="Command ID"
        value={value.id}
        onChange={(event) => onChange({ ...value, id: event.target.value })}
        required
        maxLength={63}
        placeholder="build"
        helpText="Lowercase alphanumeric with dashes, unique across commands"
      />

      <FormSelect
        name={`${prefix}-type-${index}`}
        label="Command Type"
        value={type}
        onChange={(event) => onChange(applyCommandType(value, event.target.value, partial))}
        options={COMMAND_TYPES}
      />

      {type === 'exec' && (
        <>
          <FormInput
            name={`${prefix}-component-${index}`}
            label="Component"
            value={body.component || ''}
            onChange={(event) => updateBody({ component: event.target.value })}
            required={!partial}
            placeholder="dev-container"
            suggestions={containerNames}
            helpText="Container component the command runs in"
          />

          <FormInput
            name={`${prefix}-commandLine-${index}`}
            label="Command Line"
            value={body.commandLine || ''}
            onChange={(event) => updateBody({ commandLine: event.target.value })}
            required={!partial}
            placeholder="npm install"
          />

          <FormInput
            name={`${prefix}-workingDir-${index}`}
            label="Working Directory"
            value={body.workingDir || ''}
            onChange={(event) => updateBody({ workingDir: event.target.value })}
            placeholder="${PROJECT_SOURCE}"
            helpText="Defaults to the container working directory"
          />

          <FormInput
            name={`${prefix}-label-${index}`}
            label="Label"
            value={body.label || ''}
            onChange={(event) => updateBody({ label: event.target.value })}
            placeholder="Install dependencies"
            helpText="Human readable name shown by the IDE"
          />

          <GroupEditor
            prefix={prefix}
            index={index}
            group={body.group}
            onChange={(group) => updateBody({ group })}
            partial={partial}
          />

          <BoolField
            partial={partial}
            name={`${prefix}-hotReloadCapable-${index}`}
            label="Hot reload capable"
            value={body.hotReloadCapable}
            onChange={(value) => updateBody({ hotReloadCapable: value })}
            helpText="The command does not need to be restarted when the sources change"
          />

          <CollapsibleSection title="Environment variables" badge={body.env?.length || undefined}>
            <EnvVarManager
              name={`${prefix}-env-${index}`}
              label={null}
              items={body.env || []}
              onChange={(items) => updateBody({ env: items })}
            />
          </CollapsibleSection>
        </>
      )}

      {type === 'apply' && (
        <>
          <FormInput
            name={`${prefix}-component-${index}`}
            label="Component"
            value={body.component || ''}
            onChange={(event) => updateBody({ component: event.target.value })}
            required={!partial}
            placeholder="my-deployment"
            suggestions={componentNames}
            helpText="Component applied by the command, usually a kubernetes, openshift or image component"
          />

          <FormInput
            name={`${prefix}-label-${index}`}
            label="Label"
            value={body.label || ''}
            onChange={(event) => updateBody({ label: event.target.value })}
            placeholder="Deploy the application"
          />

          <GroupEditor
            prefix={prefix}
            index={index}
            group={body.group}
            onChange={(group) => updateBody({ group })}
            partial={partial}
          />
        </>
      )}

      {type === 'composite' && (
        <>
          <StringListManager
            name={`${prefix}-subcommand-${index}`}
            label="Commands"
            items={body.commands || []}
            onChange={(items) => updateBody({ commands: items })}
            placeholder="build"
            suggestions={otherCommandIds}
            addButtonText="Add Sub-command"
            emptyMessage="No sub-commands referenced yet."
            helpText="Ids of the commands run by this composite command, in order"
          />

          <BoolField
            partial={partial}
            name={`${prefix}-parallel-${index}`}
            label="Run sub-commands in parallel"
            value={body.parallel}
            onChange={(value) => updateBody({ parallel: value })}
          />

          <FormInput
            name={`${prefix}-label-${index}`}
            label="Label"
            value={body.label || ''}
            onChange={(event) => updateBody({ label: event.target.value })}
            placeholder="Build and deploy"
          />

          <GroupEditor
            prefix={prefix}
            index={index}
            group={body.group}
            onChange={(group) => updateBody({ group })}
            partial={partial}
          />
        </>
      )}

      <CollapsibleSection title="Command attributes">
        <AttributesEditor
          name={`${prefix}-attributes-${index}`}
          value={value.attributes || ''}
          onChange={(text) => onChange({ ...value, attributes: text })}
          rows={3}
        />
      </CollapsibleSection>
    </div>
  )
}
