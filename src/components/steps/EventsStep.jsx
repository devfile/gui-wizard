import { useWizard } from '../../hooks/useWizardState'
import FormSection from '../forms/FormSection'
import WizardNavigation from '../wizard/WizardNavigation'

export default function EventsStep() {
  const { state, dispatch, actions } = useWizard()
  const events = state.devfileData.events
  const commands = state.devfileData.commands

  const commandIds = commands.map(c => c.id).filter(Boolean)

  const handleEventChange = (eventType, commandId, checked) => {
    const currentCommands = events[eventType] || []

    let updatedCommands
    if (checked) {
      updatedCommands = [...currentCommands, commandId]
    } else {
      updatedCommands = currentCommands.filter(id => id !== commandId)
    }

    dispatch({
      type: actions.UPDATE_EVENTS,
      payload: {
        [eventType]: updatedCommands
      }
    })
  }

  const renderEventSection = (eventType, title, description) => {
    const selectedCommands = events[eventType] || []

    return (
      <FormSection title={title} description={description}>
        {commandIds.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No commands available. Add commands in the previous step to bind them to events.
          </p>
        ) : (
          <div className="space-y-2">
            {commandIds.map(commandId => (
              <label key={commandId} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={selectedCommands.includes(commandId)}
                  onChange={(e) => handleEventChange(eventType, commandId, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{commandId}</span>
              </label>
            ))}
          </div>
        )}
      </FormSection>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Events</h2>
      <p className="text-gray-600 mb-6">
        Bind commands to lifecycle events. Commands will execute at specific points in the workspace lifecycle.
      </p>

      {renderEventSection(
        'preStart',
        'Pre Start',
        'Commands executed before the workspace starts'
      )}

      {renderEventSection(
        'postStart',
        'Post Start',
        'Commands executed after the workspace starts'
      )}

      {renderEventSection(
        'preStop',
        'Pre Stop',
        'Commands executed before the workspace stops'
      )}

      {renderEventSection(
        'postStop',
        'Post Stop',
        'Commands executed after the workspace stops'
      )}

      <WizardNavigation />
    </div>
  )
}
