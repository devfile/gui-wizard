import { useSectionList } from '../../hooks/useWizardState'
import { createComponent, getComponentType } from '../../utils/factories'
import ComponentEditor from '../editors/ComponentEditor'
import ArrayFieldManager from '../forms/ArrayFieldManager'
import StepIssues from '../wizard/StepIssues'
import WizardNavigation from '../wizard/WizardNavigation'

const ISSUE_PREFIXES = ['Component']

export default function ComponentsStep() {
  const { items: components, add, update, remove, move } = useSectionList('components')

  const volumeNames = components
    .filter((component) => getComponentType(component) === 'volume')
    .map((component) => component.name)
    .filter(Boolean)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Components</h2>
      <p className="text-gray-600 mb-6">
        The containers, volumes, Kubernetes or OpenShift resources and image builds that make up the development
        environment.
      </p>

      <StepIssues prefixes={ISSUE_PREFIXES} />

      <ArrayFieldManager
        items={components}
        onAdd={() => add(createComponent('container'))}
        onRemove={remove}
        onChangeItem={update}
        onMove={move}
        renderItem={(component, index, setComponent) => (
          <ComponentEditor index={index} value={component} onChange={setComponent} volumeNames={volumeNames} />
        )}
        itemLabel={(component, index) =>
          `${component.name || `Component ${index + 1}`} (${getComponentType(component)})`
        }
        testId="component"
        addButtonText="Add Component"
        emptyMessage="No components added. A workspace usually needs at least one container component."
      />

      <WizardNavigation />
    </div>
  )
}
