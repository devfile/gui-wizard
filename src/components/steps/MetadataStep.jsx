import { useState, useEffect } from 'react'
import { useWizard } from '../../hooks/useWizardState'
import { validateMetadata } from '../../utils/validation'
import { LANGUAGES, PROJECT_TYPES } from '../../utils/constants'
import FormInput from '../forms/FormInput'
import FormTextarea from '../forms/FormTextarea'
import FormSelect from '../forms/FormSelect'
import FormSection from '../forms/FormSection'
import WizardNavigation from '../wizard/WizardNavigation'
import Alert from '../common/Alert'

export default function MetadataStep() {
  const { state, dispatch, actions } = useWizard()
  const [errors, setErrors] = useState({})
  const [tags, setTags] = useState(state.devfileData.metadata.tags?.join(', ') || '')

  const metadata = state.devfileData.metadata

  const handleChange = (e) => {
    const { name, value } = e.target
    dispatch({
      type: actions.UPDATE_METADATA,
      payload: { [name]: value }
    })
  }

  const handleTagsChange = (e) => {
    const value = e.target.value
    setTags(value)
    const tagsArray = value.split(',').map(t => t.trim()).filter(Boolean)
    dispatch({
      type: actions.UPDATE_METADATA,
      payload: { tags: tagsArray }
    })
  }

  const handleNext = () => {
    const validationErrors = validateMetadata(metadata)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return false
    }

    return true
  }

  const canProceed = metadata.name && metadata.name.trim() !== ''

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
      <p className="text-gray-600 mb-6">
        Enter the basic metadata for your devfile. The name field is required.
      </p>

      {Object.keys(errors).length > 0 && (
        <Alert type="error" title="Validation Errors">
          Please fix the errors below before continuing.
        </Alert>
      )}

      <FormSection title="Required Information">
        <FormInput
          name="name"
          label="Name"
          value={metadata.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="my-project"
          helpText="Lowercase alphanumeric with hyphens only (max 63 chars)"
        />

        <FormInput
          name="version"
          label="Version"
          value={metadata.version}
          onChange={handleChange}
          placeholder="1.0.0"
          helpText="Semantic version of your project"
        />
      </FormSection>

      <FormSection title="Optional Information">
        <FormInput
          name="displayName"
          label="Display Name"
          value={metadata.displayName}
          onChange={handleChange}
          placeholder="My Awesome Project"
          helpText="Human-readable name"
        />

        <FormTextarea
          name="description"
          label="Description"
          value={metadata.description}
          onChange={handleChange}
          placeholder="A brief description of your project"
          rows={3}
        />

        <FormSelect
          name="language"
          label="Primary Language"
          value={metadata.language}
          onChange={handleChange}
          options={LANGUAGES}
        />

        <FormSelect
          name="projectType"
          label="Project Type"
          value={metadata.projectType}
          onChange={handleChange}
          options={PROJECT_TYPES}
        />

        <FormInput
          name="provider"
          label="Provider"
          value={metadata.provider}
          onChange={handleChange}
          placeholder="Organization or Author"
          helpText="The organization or individual providing this devfile"
        />

        <FormInput
          name="tags"
          label="Tags"
          value={tags}
          onChange={handleTagsChange}
          placeholder="web, api, backend"
          helpText="Comma-separated tags for categorization"
        />

        <FormInput
          name="website"
          label="Website"
          type="url"
          value={metadata.website}
          onChange={handleChange}
          error={errors.website}
          placeholder="https://example.com"
        />

        <FormInput
          name="supportUrl"
          label="Support URL"
          type="url"
          value={metadata.supportUrl}
          onChange={handleChange}
          error={errors.supportUrl}
          placeholder="https://example.com/support"
        />
      </FormSection>

      <WizardNavigation onNext={handleNext} canProceed={canProceed} />
    </div>
  )
}
