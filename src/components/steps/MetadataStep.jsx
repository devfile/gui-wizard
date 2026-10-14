import { useWizard } from '../../hooks/useWizardState'
import {
  ARCHITECTURES,
  DEVFILE_SCHEMA_VERSION,
  LANGUAGE_SUGGESTIONS,
  PROJECT_TYPE_SUGGESTIONS
} from '../../utils/constants'
import AttributesEditor from '../forms/AttributesEditor'
import CheckboxGroup from '../forms/CheckboxGroup'
import CollapsibleSection from '../forms/CollapsibleSection'
import FormInput from '../forms/FormInput'
import FormSection from '../forms/FormSection'
import FormTextarea from '../forms/FormTextarea'
import StringListManager from '../forms/StringListManager'
import StepIssues from '../wizard/StepIssues'
import WizardNavigation from '../wizard/WizardNavigation'

const ISSUE_PREFIXES = ['Metadata', 'Schema version', 'Devfile attributes']

export default function MetadataStep() {
  const { state, dispatch, actions } = useWizard()
  const metadata = state.devfileData.metadata

  const updateMetadata = (payload) => dispatch({ type: actions.UPDATE_METADATA, payload })
  const handleChange = (event) => updateMetadata({ [event.target.name]: event.target.value })

  const canProceed = Boolean(metadata.name?.trim() || metadata.generateName?.trim())

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
      <p className="text-gray-600 mb-6">
        Metadata describing the devfile. Everything is optional for the schema, but a name is needed to identify the
        workspace.
      </p>

      {/* The missing name is already shown by the field itself, so warnings
          only start once the devfile is named. */}
      <StepIssues prefixes={ISSUE_PREFIXES} showWarnings={canProceed} />

      <FormSection title="Identity">
        <p className="text-sm text-gray-500 mb-4">
          Schema version <code className="bg-gray-100 px-1.5 py-0.5 rounded">{DEVFILE_SCHEMA_VERSION}</code>
        </p>

        <FormInput
          name="name"
          label="Name"
          value={metadata.name}
          onChange={handleChange}
          required
          maxLength={63}
          placeholder="my-project"
          helpText="Lowercase alphanumeric with dashes, max 63 characters"
        />

        <FormInput
          name="generateName"
          label="Generate Name"
          value={metadata.generateName}
          onChange={handleChange}
          placeholder="my-project-"
          helpText="Prefix used to generate a unique workspace name. Mutually exclusive with the name above."
        />

        <FormInput
          name="version"
          label="Version"
          value={metadata.version}
          onChange={handleChange}
          placeholder="1.0.0"
          helpText="Semantic version of the devfile stack"
        />
      </FormSection>

      <FormSection title="Description">
        <FormInput
          name="displayName"
          label="Display Name"
          value={metadata.displayName}
          onChange={handleChange}
          placeholder="My Awesome Project"
          helpText="Human readable name shown in the IDE and registries"
        />

        <FormTextarea
          name="description"
          label="Description"
          value={metadata.description}
          onChange={handleChange}
          placeholder="A brief description of the stack"
          rows={3}
        />

        <FormInput
          name="icon"
          label="Icon"
          value={metadata.icon}
          onChange={handleChange}
          placeholder="https://example.com/icon.png"
          helpText="URL of the icon shown in registries"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            name="language"
            label="Language"
            value={metadata.language}
            onChange={handleChange}
            placeholder="Java"
            suggestions={LANGUAGE_SUGGESTIONS}
            helpText="Primary language of the project"
          />

          <FormInput
            name="projectType"
            label="Project Type"
            value={metadata.projectType}
            onChange={handleChange}
            placeholder="quarkus"
            suggestions={PROJECT_TYPE_SUGGESTIONS}
            helpText="Framework or runtime of the project"
          />
        </div>

        <FormInput
          name="provider"
          label="Provider"
          value={metadata.provider}
          onChange={handleChange}
          placeholder="Red Hat"
          helpText="Organization or individual providing the devfile"
        />

        <StringListManager
          name="metadata-tags"
          label="Tags"
          items={metadata.tags || []}
          onChange={(tags) => updateMetadata({ tags })}
          placeholder="Java"
          addButtonText="Add Tag"
          emptyMessage="No tags added."
          helpText="Keywords used to find the stack in a registry"
        />

        <CheckboxGroup
          name="metadata-architectures"
          label="Architectures"
          options={ARCHITECTURES}
          selected={metadata.architectures || []}
          onChange={(architectures) => updateMetadata({ architectures })}
          helpText="CPU architectures the stack supports. All of them when left empty."
        />
      </FormSection>

      <FormSection title="Links and limits">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            name="website"
            label="Website"
            value={metadata.website}
            onChange={handleChange}
            placeholder="https://example.com"
          />

          <FormInput
            name="supportUrl"
            label="Support URL"
            value={metadata.supportUrl}
            onChange={handleChange}
            placeholder="https://example.com/support"
          />
        </div>

        <FormInput
          name="globalMemoryLimit"
          label="Global Memory Limit"
          value={metadata.globalMemoryLimit}
          onChange={handleChange}
          placeholder="2674Mi"
          helpText="Memory limit applied to the whole workspace"
        />
      </FormSection>

      <CollapsibleSection title="Metadata attributes" description="Free-form attributes attached to the metadata">
        <AttributesEditor
          name="metadata-attributes"
          value={metadata.attributes || ''}
          onChange={(text) => updateMetadata({ attributes: text })}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Devfile attributes" description="Free-form attributes attached to the devfile itself">
        <AttributesEditor
          name="devfile-attributes"
          value={state.devfileData.attributes || ''}
          onChange={(text) =>
            dispatch({ type: actions.SET_SECTION, payload: { section: 'attributes', value: text } })
          }
          helpText="For example controller.devfile.io/storage-type or che-theia plugin settings."
        />
      </CollapsibleSection>

      <WizardNavigation canProceed={canProceed} />
    </div>
  )
}
