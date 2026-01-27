import { useWizard } from '../../hooks/useWizardState'
import { COMMAND_TYPES, COMMAND_GROUPS } from '../../utils/constants'
import FormInput from '../forms/FormInput'
import FormSelect from '../forms/FormSelect'
import ArrayFieldManager from '../forms/ArrayFieldManager'
import WizardNavigation from '../wizard/WizardNavigation'

export default function CommandsStep() {
  const { state, dispatch, actions } = useWizard()
  const commands = state.devfileData.commands
  const components = state.devfileData.components

  const componentOptions = components.map(c => ({
    value: c.name,
    label: c.name
  }))

  // Helper to determine command type from the property that exists
  const getCommandType = (command) => {
    if (command.exec) return 'exec'
    if (command.apply) return 'apply'
    if (command.composite) return 'composite'
    return 'exec' // default
  }

  const createNewCommand = (type = 'exec') => {
    const command = { id: '' }

    switch (type) {
      case 'exec':
        command.exec = {
          component: '',
          commandLine: '',
          workingDir: ''
        }
        break
      case 'apply':
        command.apply = {
          component: ''
        }
        break
      case 'composite':
        command.composite = {
          commands: [],
          parallel: false
        }
        break
      default:
        command.exec = {
          component: '',
          commandLine: ''
        }
    }

    return command
  }

  const handleAddCommand = () => {
    dispatch({
      type: actions.ADD_COMMAND,
      payload: createNewCommand()
    })
  }

  const handleRemoveCommand = (index) => {
    dispatch({
      type: actions.REMOVE_COMMAND,
      payload: index
    })
  }

  const handleUpdateCommand = (index, field, value) => {
    const command = commands[index]
    let updates = {}

    if (field === 'commandType') {
      // When changing type, replace the entire command structure
      const newCommand = createNewCommand(value)
      newCommand.id = command.id // preserve the id
      updates = newCommand
    } else if (field === 'id') {
      updates = { id: value }
    } else if (field.startsWith('exec.')) {
      const execField = field.split('.')[1]
      updates = {
        exec: {
          ...command.exec,
          [execField]: value
        }
      }
    } else if (field.startsWith('apply.')) {
      const applyField = field.split('.')[1]
      updates = {
        apply: {
          ...command.apply,
          [applyField]: value
        }
      }
    } else if (field.startsWith('composite.')) {
      const compositeField = field.split('.')[1]
      updates = {
        composite: {
          ...command.composite,
          [compositeField]: value
        }
      }
    }

    dispatch({
      type: actions.UPDATE_COMMAND,
      payload: { index, data: updates }
    })
  }

  const renderCommandItem = (command, index, updateField) => {
    const commandType = getCommandType(command)

    return (
      <div className="space-y-4">
        <FormInput
          name={`command-id-${index}`}
          label="Command ID"
          value={command.id || ''}
          onChange={(e) => updateField('id', e.target.value)}
          required
          placeholder="build-project"
          helpText="Unique identifier for this command"
        />

        <FormSelect
          name={`command-type-${index}`}
          label="Command Type"
          value={commandType}
          onChange={(e) => updateField('commandType', e.target.value)}
          options={COMMAND_TYPES}
        />

        {commandType === 'exec' && (
          <>
            <FormSelect
              name={`command-component-${index}`}
              label="Component"
              value={command.exec?.component || ''}
              onChange={(e) => updateField('exec.component', e.target.value)}
              options={componentOptions}
              placeholder="Select a component"
              required
              helpText="The component to execute this command in"
            />

            <FormInput
              name={`command-commandLine-${index}`}
              label="Command Line"
              value={command.exec?.commandLine || ''}
              onChange={(e) => updateField('exec.commandLine', e.target.value)}
              placeholder="npm install"
              required
              helpText="The command to execute"
            />

            <FormInput
              name={`command-workingDir-${index}`}
              label="Working Directory (Optional)"
              value={command.exec?.workingDir || ''}
              onChange={(e) => updateField('exec.workingDir', e.target.value)}
              placeholder="/projects"
              helpText="Working directory for the command"
            />
          </>
        )}

        {commandType === 'apply' && (
          <FormSelect
            name={`command-apply-component-${index}`}
            label="Component"
            value={command.apply?.component || ''}
            onChange={(e) => updateField('apply.component', e.target.value)}
            options={componentOptions}
            placeholder="Select a component"
            required
            helpText="The component to apply"
          />
        )}

        {commandType === 'composite' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              Composite commands allow you to execute multiple commands sequentially or in parallel.
              This feature requires additional implementation.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Commands</h2>
      <p className="text-gray-600 mb-6">
        Define commands to build, run, test, or debug your project.
      </p>

      {componentOptions.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-sm text-yellow-800">
            You haven't defined any components yet. Commands need components to run in.
            Consider going back to add components first.
          </p>
        </div>
      )}

      <ArrayFieldManager
        items={commands}
        onAdd={handleAddCommand}
        onRemove={handleRemoveCommand}
        onUpdate={handleUpdateCommand}
        renderItem={renderCommandItem}
        addButtonText="Add Command"
        emptyMessage="No commands added. Click below to add your first command."
      />

      <WizardNavigation />
    </div>
  )
}
