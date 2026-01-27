import { useWizard } from '../../hooks/useWizardState'
import FormInput from '../forms/FormInput'
import Button from '../common/Button'
import WizardNavigation from '../wizard/WizardNavigation'
import Alert from '../common/Alert'

export default function VariablesStep() {
  const { state, dispatch, actions } = useWizard()
  const variables = state.devfileData.variables || {}

  const variableEntries = Object.entries(variables)

  const handleAddVariable = () => {
    const newVars = { ...variables, [`VAR_${Object.keys(variables).length + 1}`]: '' }
    dispatch({
      type: actions.UPDATE_VARIABLES,
      payload: newVars
    })
  }

  const handleRemoveVariable = (key) => {
    const newVars = { ...variables }
    delete newVars[key]
    dispatch({
      type: actions.UPDATE_VARIABLES,
      payload: newVars
    })
  }

  const handleUpdateKey = (oldKey, newKey) => {
    if (oldKey === newKey) return

    const newVars = {}
    for (const [k, v] of Object.entries(variables)) {
      if (k === oldKey) {
        newVars[newKey] = v
      } else {
        newVars[k] = v
      }
    }

    dispatch({
      type: actions.UPDATE_VARIABLES,
      payload: newVars
    })
  }

  const handleUpdateValue = (key, value) => {
    dispatch({
      type: actions.UPDATE_VARIABLES,
      payload: {
        ...variables,
        [key]: value
      }
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Variables</h2>
      <p className="text-gray-600 mb-4">
        Define variables that can be referenced throughout your devfile using the syntax: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{'{{variable-name}}'}</code>
      </p>

      <Alert type="info" title="Variable Substitution">
        Variables are replaced in string fields throughout the devfile. Use them to avoid repetition and make your devfile more maintainable.
      </Alert>

      <div className="mt-6 space-y-4">
        {variableEntries.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No variables defined yet.</p>
          </div>
        ) : (
          variableEntries.map(([key, value], index) => (
            <div key={index} className="flex gap-3 items-start p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1">
                <FormInput
                  name={`var-key-${index}`}
                  label="Variable Name"
                  value={key}
                  onChange={(e) => handleUpdateKey(key, e.target.value)}
                  placeholder="VARIABLE_NAME"
                />
              </div>
              <div className="flex-1">
                <FormInput
                  name={`var-value-${index}`}
                  label="Value"
                  value={value}
                  onChange={(e) => handleUpdateValue(key, e.target.value)}
                  placeholder="variable value"
                />
              </div>
              <div className="pt-7">
                <Button
                  variant="danger"
                  onClick={() => handleRemoveVariable(key)}
                  className="text-xs px-2 py-1"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        )}

        <Button
          variant="outline"
          onClick={handleAddVariable}
          className="w-full"
        >
          Add Variable
        </Button>
      </div>

      <WizardNavigation />
    </div>
  )
}
