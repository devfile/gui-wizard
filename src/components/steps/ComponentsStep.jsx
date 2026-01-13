import { useWizard } from '../../hooks/useWizardState'
import { COMPONENT_TYPES, ENDPOINT_PROTOCOLS } from '../../utils/constants'
import FormInput from '../forms/FormInput'
import FormSelect from '../forms/FormSelect'
import FormCheckbox from '../forms/FormCheckbox'
import FormTextarea from '../forms/FormTextarea'
import FormSection from '../forms/FormSection'
import ArrayFieldManager from '../forms/ArrayFieldManager'
import KeyValueArrayManager from '../forms/KeyValueArrayManager'
import WizardNavigation from '../wizard/WizardNavigation'

export default function ComponentsStep() {
  const { state, dispatch, actions } = useWizard()
  const components = state.devfileData.components

  const createNewComponent = () => ({
    name: '',
    type: 'container',
    container: {
      image: '',
      mountSources: true,
      memoryLimit: '',
      cpuLimit: ''
    },
    volume: {
      size: ''
    }
  })

  const handleAddComponent = () => {
    dispatch({
      type: actions.ADD_COMPONENT,
      payload: createNewComponent()
    })
  }

  const handleRemoveComponent = (index) => {
    dispatch({
      type: actions.REMOVE_COMPONENT,
      payload: index
    })
  }

  const handleUpdateComponent = (index, field, value) => {
    const component = components[index]
    let updates = {}

    if (field === 'type') {
      updates = { type: value }
    } else if (field === 'name') {
      updates = { name: value }
    } else if (field.startsWith('container.')) {
      const containerField = field.split('.')[1]
      updates = {
        container: {
          ...component.container,
          [containerField]: containerField === 'mountSources' ? value : value
        }
      }
    } else if (field.startsWith('volume.')) {
      const volumeField = field.split('.')[1]
      updates = {
        volume: {
          ...component.volume,
          [volumeField]: value
        }
      }
    }

    dispatch({
      type: actions.UPDATE_COMPONENT,
      payload: { index, data: updates }
    })
  }

  const renderComponentItem = (component, index, updateField) => {
    return (
      <div className="space-y-4">
        <FormInput
          name={`component-name-${index}`}
          label="Component Name"
          value={component.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          required
          placeholder="dev-container"
        />

        <FormSelect
          name={`component-type-${index}`}
          label="Component Type"
          value={component.type || 'container'}
          onChange={(e) => updateField('type', e.target.value)}
          options={COMPONENT_TYPES}
        />

        {component.type === 'container' && (
          <>
            <FormInput
              name={`component-image-${index}`}
              label="Container Image"
              value={component.container?.image || ''}
              onChange={(e) => updateField('container.image', e.target.value)}
              placeholder="docker.io/library/node:18"
              required
              helpText="Full container image reference"
            />

            <FormCheckbox
              name={`component-mountSources-${index}`}
              label="Mount project sources"
              checked={component.container?.mountSources ?? true}
              onChange={(e) => updateField('container.mountSources', e.target.checked)}
              helpText="Mount project sources at /projects"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name={`component-memoryLimit-${index}`}
                label="Memory Limit (Optional)"
                value={component.container?.memoryLimit || ''}
                onChange={(e) => updateField('container.memoryLimit', e.target.value)}
                placeholder="1Gi"
              />

              <FormInput
                name={`component-cpuLimit-${index}`}
                label="CPU Limit (Optional)"
                value={component.container?.cpuLimit || ''}
                onChange={(e) => updateField('container.cpuLimit', e.target.value)}
                placeholder="1000m"
              />
            </div>
          </>
        )}

        {component.type === 'volume' && (
          <FormInput
            name={`component-size-${index}`}
            label="Volume Size"
            value={component.volume?.size || ''}
            onChange={(e) => updateField('volume.size', e.target.value)}
            placeholder="2Gi"
            required
            helpText="Storage size (e.g., 1Gi, 500Mi)"
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Components</h2>
      <p className="text-gray-600 mb-6">
        Define containers, volumes, and other components for your development environment.
      </p>

      <ArrayFieldManager
        items={components}
        onAdd={handleAddComponent}
        onRemove={handleRemoveComponent}
        onUpdate={handleUpdateComponent}
        renderItem={renderComponentItem}
        addButtonText="Add Component"
        emptyMessage="No components added. Click below to add your first component."
      />

      <WizardNavigation />
    </div>
  )
}
