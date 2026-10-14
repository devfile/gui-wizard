import { useWizard } from '../../hooks/useWizardState'
import { EVENT_TYPES } from '../../utils/constants'
import { getCommandType } from '../../utils/factories'
import Button from '../common/Button'
import FormSection from '../forms/FormSection'
import StepIssues from '../wizard/StepIssues'
import WizardNavigation from '../wizard/WizardNavigation'

const ISSUE_PREFIXES = ['Event']

/** A command can be bound to an event when it is of the expected type, or a composite of those. */
function isAllowed(command, expected, commandsById) {
  const type = getCommandType(command)
  if (type === expected) return true
  if (type !== 'composite') return false

  const subCommands = (command.composite.commands || []).map((id) => commandsById.get(id)).filter(Boolean)
  return subCommands.length > 0 && subCommands.every((sub) => getCommandType(sub) === expected)
}

function EventTypeSection({ eventType, selected, commands, commandsById, onChange }) {
  const toggle = (id, checked) =>
    onChange(checked ? [...selected, id] : selected.filter((entry) => entry !== id))

  const move = (index, offset) => {
    const target = index + offset
    if (target < 0 || target >= selected.length) return
    const reordered = [...selected]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    onChange(reordered)
  }

  return (
    <FormSection title={eventType.label} description={eventType.description}>
      {commands.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No commands available. Add commands in the previous step to bind them to events.
        </p>
      ) : (
        <div className="space-y-1">
          {commands.map((command) => {
            const allowed = isAllowed(command, eventType.allowed, commandsById)
            return (
              <label
                key={command.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                title={allowed ? undefined : `Only ${eventType.allowed} commands can be bound to ${eventType.label}`}
              >
                <input
                  type="checkbox"
                  name={`${eventType.value}-${command.id}`}
                  checked={selected.includes(command.id)}
                  onChange={(event) => toggle(command.id, event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm font-medium ${allowed ? 'text-gray-700' : 'text-gray-400'}`}>
                  {command.id}
                </span>
                <span className="text-xs text-gray-400">{getCommandType(command)}</span>
              </label>
            )
          })}
        </div>
      )}

      {selected.length > 1 && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <span className="block text-xs font-medium text-gray-500 mb-2">Execution order</span>
          <ol className="space-y-1">
            {selected.map((id, index) => (
              <li key={`${id}-${index}`} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-5 text-gray-400">{index + 1}.</span>
                <span className="flex-1">{id}</span>
                <Button
                  variant="outline"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="text-xs px-2 py-0.5"
                  title={`Move ${id} up`}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  onClick={() => move(index, 1)}
                  disabled={index === selected.length - 1}
                  className="text-xs px-2 py-0.5"
                  title={`Move ${id} down`}
                >
                  ↓
                </Button>
              </li>
            ))}
          </ol>
        </div>
      )}
    </FormSection>
  )
}

export default function EventsStep() {
  const { state, dispatch, actions } = useWizard()
  const events = state.devfileData.events
  const commands = state.devfileData.commands.filter((command) => command.id)

  const commandsById = new Map(commands.map((command) => [command.id, command]))

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Events</h2>
      <p className="text-gray-600 mb-6">
        Bind commands to the workspace lifecycle. Commands bound to an event run in the order listed below.
      </p>

      <StepIssues prefixes={ISSUE_PREFIXES} />

      {EVENT_TYPES.map((eventType) => (
        <EventTypeSection
          key={eventType.value}
          eventType={eventType}
          selected={events[eventType.value] || []}
          commands={commands}
          commandsById={commandsById}
          onChange={(value) => dispatch({ type: actions.UPDATE_EVENTS, payload: { [eventType.value]: value } })}
        />
      ))}

      <WizardNavigation />
    </div>
  )
}
