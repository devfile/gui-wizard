import { useSectionList } from '../../hooks/useWizardState'
import { createCommand, getCommandType, getComponentType } from '../../utils/factories'
import CommandEditor from '../editors/CommandEditor'
import ArrayFieldManager from '../forms/ArrayFieldManager'
import Alert from '../common/Alert'
import StepIssues from '../wizard/StepIssues'
import WizardNavigation from '../wizard/WizardNavigation'

const ISSUE_PREFIXES = ['Command']

export default function CommandsStep() {
  const { items: commands, add, update, remove, move } = useSectionList('commands')
  const { items: components } = useSectionList('components')

  const componentNames = components.map((component) => component.name).filter(Boolean)
  const containerNames = components
    .filter((component) => getComponentType(component) === 'container')
    .map((component) => component.name)
    .filter(Boolean)
  const commandIds = commands.map((command) => command.id).filter(Boolean)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Commands</h2>
      <p className="text-gray-600 mb-6">
        Commands run inside the workspace: <strong>exec</strong> runs a command line in a container,{' '}
        <strong>apply</strong> deploys a component, and <strong>composite</strong> chains other commands.
      </p>

      {componentNames.length === 0 && (
        <Alert type="warning" className="mb-6">
          No components defined yet. Exec commands need a container component to run in.
        </Alert>
      )}

      <StepIssues prefixes={ISSUE_PREFIXES} />

      <ArrayFieldManager
        items={commands}
        onAdd={() => add(createCommand('exec'))}
        onRemove={remove}
        onChangeItem={update}
        onMove={move}
        renderItem={(command, index, setCommand) => (
          <CommandEditor
            index={index}
            value={command}
            onChange={setCommand}
            componentNames={componentNames}
            containerNames={containerNames}
            commandIds={commandIds}
          />
        )}
        itemLabel={(command, index) => `${command.id || `Command ${index + 1}`} (${getCommandType(command)})`}
        testId="command"
        addButtonText="Add Command"
        emptyMessage="No commands added."
      />

      <WizardNavigation />
    </div>
  )
}
