import { useWizard } from '../../hooks/useWizardState'
import MapFieldManager from '../forms/MapFieldManager'
import Alert from '../common/Alert'
import WizardNavigation from '../wizard/WizardNavigation'

export default function VariablesStep() {
  const { state, dispatch, actions } = useWizard()
  const variables = state.devfileData.variables || []

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Variables</h2>
      <p className="text-gray-600 mb-4">
        Values referenced elsewhere in the devfile with the{' '}
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{'{{variable-name}}'}</code> syntax.
      </p>

      <Alert type="info" title="Variable Substitution" className="mb-6">
        Variables are substituted in the string fields of components, commands, projects and events. Keys may only
        contain alphanumeric characters, dashes and underscores.
      </Alert>

      <MapFieldManager
        name="variable"
        label="Variables"
        items={variables}
        onChange={(value) => dispatch({ type: actions.SET_SECTION, payload: { section: 'variables', value } })}
        keyLabel="Variable name"
        valueLabel="Variable value"
        keyPlaceholder="VERSION"
        valuePlaceholder="1.0.0"
        addButtonText="Add Variable"
        emptyMessage="No variables defined yet."
      />

      <WizardNavigation />
    </div>
  )
}
