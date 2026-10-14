import { PROJECT_SOURCE_TYPES } from '../../utils/constants'
import { applyProjectSourceType, getProjectSourceType } from '../../utils/factories'
import AttributesEditor from '../forms/AttributesEditor'
import CollapsibleSection from '../forms/CollapsibleSection'
import FormInput from '../forms/FormInput'
import FormSelect from '../forms/FormSelect'
import GitSourceEditor from './GitSourceEditor'

/**
 * Editor for one entry of `projects`, `starterProjects` or `dependentProjects`.
 *
 * Starter projects carry `description`/`subDir` instead of `clonePath` and only
 * accept a single git remote, everything else is shared between the three lists.
 */
export default function ProjectEditor({ index, value, onChange, kind = 'projects', prefix = 'project' }) {
  const sourceType = getProjectSourceType(value)
  const isStarter = kind === 'starterProjects'
  const update = (patch) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-2">
      <FormInput
        name={`${prefix}-name-${index}`}
        label="Project Name"
        value={value.name}
        onChange={(event) => update({ name: event.target.value })}
        required
        maxLength={63}
        placeholder="my-project"
        helpText="Lowercase alphanumeric with dashes, unique across the list"
      />

      {isStarter ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            name={`${prefix}-description-${index}`}
            label="Description"
            value={value.description || ''}
            onChange={(event) => update({ description: event.target.value })}
            placeholder="A starter project for ..."
          />
          <FormInput
            name={`${prefix}-subDir-${index}`}
            label="Sub Directory"
            value={value.subDir || ''}
            onChange={(event) => update({ subDir: event.target.value })}
            placeholder="examples/rest-api"
            helpText="Sub-directory of the source to use as the starter project"
          />
        </div>
      ) : (
        <FormInput
          name={`${prefix}-clonePath-${index}`}
          label="Clone Path"
          value={value.clonePath || ''}
          onChange={(event) => update({ clonePath: event.target.value })}
          placeholder="relative/path"
          helpText="Path relative to the projects root the source is cloned into"
        />
      )}

      <FormSelect
        name={`${prefix}-source-${index}`}
        label="Source Type"
        value={sourceType}
        onChange={(event) => onChange(applyProjectSourceType(value, event.target.value))}
        options={PROJECT_SOURCE_TYPES}
      />

      {sourceType === 'git' ? (
        <GitSourceEditor
          name={`${prefix}-git-${index}`}
          value={value.git}
          onChange={(git) => update({ git })}
          singleRemote={isStarter}
        />
      ) : (
        <FormInput
          name={`${prefix}-zip-location-${index}`}
          label="Zip Location"
          value={value.zip?.location || ''}
          onChange={(event) => update({ zip: { ...value.zip, location: event.target.value } })}
          placeholder="https://example.com/archive.zip"
          required
          helpText="URL of the zip archive to download"
        />
      )}

      <CollapsibleSection title="Project attributes">
        <AttributesEditor
          name={`${prefix}-attributes-${index}`}
          value={value.attributes || ''}
          onChange={(text) => update({ attributes: text })}
          rows={3}
        />
      </CollapsibleSection>
    </div>
  )
}
