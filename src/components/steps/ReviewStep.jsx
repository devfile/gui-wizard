import { useWizard } from '../../hooks/useWizardState'
import { useYamlGenerator } from '../../hooks/useYamlGenerator'
import { downloadYamlFile } from '../../utils/downloadFile'
import { validateDevfile } from '../../utils/devfileGenerator'
import { WIZARD_STEPS } from '../../utils/constants'
import Button from '../common/Button'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Alert from '../common/Alert'
import YamlPreview from '../preview/YamlPreview'

export default function ReviewStep() {
  const { state, dispatch, actions } = useWizard()
  const { generateYaml } = useYamlGenerator()

  const metadata = state.devfileData.metadata
  const projects = state.devfileData.projects
  const components = state.devfileData.components
  const commands = state.devfileData.commands
  const events = state.devfileData.events
  const variables = state.devfileData.variables

  const validationErrors = validateDevfile(state.devfileData)

  const handleDownload = () => {
    const yamlContent = generateYaml(state.devfileData)
    downloadYamlFile(yamlContent, 'devfile.yaml')
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the wizard? All data will be lost.')) {
      dispatch({ type: actions.RESET_WIZARD })
    }
  }

  const handleEdit = (stepIndex) => {
    dispatch({ type: actions.GOTO_STEP, payload: stepIndex })
  }

  const renderSummarySection = (title, stepIndex, hasContent, children) => {
    return (
      <Card className="mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {hasContent ? (
              <Badge variant="success" className="mt-1">Configured</Badge>
            ) : (
              <Badge variant="default" className="mt-1">Not configured</Badge>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => handleEdit(stepIndex)}
            className="text-xs px-2 py-1"
          >
            Edit
          </Button>
        </div>
        {children}
      </Card>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Download</h2>
      <p className="text-gray-600 mb-6">
        Review your devfile configuration and download the YAML file.
      </p>

      {validationErrors.length > 0 && (
        <Alert type="error" title="Validation Errors">
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          {renderSummarySection(
            'Basic Information',
            0,
            metadata.name !== '',
            <div className="text-sm space-y-1">
              {metadata.name && <p><strong>Name:</strong> {metadata.name}</p>}
              {metadata.version && <p><strong>Version:</strong> {metadata.version}</p>}
              {metadata.displayName && <p><strong>Display Name:</strong> {metadata.displayName}</p>}
              {metadata.language && <p><strong>Language:</strong> {metadata.language}</p>}
            </div>
          )}

          {renderSummarySection(
            'Projects',
            1,
            projects.length > 0,
            <div className="text-sm">
              {projects.length > 0 ? (
                <p>{projects.length} project(s) configured</p>
              ) : (
                <p className="text-gray-500">No projects added</p>
              )}
            </div>
          )}

          {renderSummarySection(
            'Components',
            2,
            components.length > 0,
            <div className="text-sm">
              {components.length > 0 ? (
                <p>{components.length} component(s) configured</p>
              ) : (
                <p className="text-gray-500">No components added</p>
              )}
            </div>
          )}
        </div>

        <div>
          {renderSummarySection(
            'Commands',
            3,
            commands.length > 0,
            <div className="text-sm">
              {commands.length > 0 ? (
                <p>{commands.length} command(s) configured</p>
              ) : (
                <p className="text-gray-500">No commands added</p>
              )}
            </div>
          )}

          {renderSummarySection(
            'Events',
            4,
            Object.values(events).some(arr => arr.length > 0),
            <div className="text-sm space-y-1">
              {events.preStart?.length > 0 && <p><strong>Pre Start:</strong> {events.preStart.length} command(s)</p>}
              {events.postStart?.length > 0 && <p><strong>Post Start:</strong> {events.postStart.length} command(s)</p>}
              {events.preStop?.length > 0 && <p><strong>Pre Stop:</strong> {events.preStop.length} command(s)</p>}
              {events.postStop?.length > 0 && <p><strong>Post Stop:</strong> {events.postStop.length} command(s)</p>}
              {!Object.values(events).some(arr => arr.length > 0) && (
                <p className="text-gray-500">No events configured</p>
              )}
            </div>
          )}

          {renderSummarySection(
            'Variables',
            5,
            Object.keys(variables).length > 0,
            <div className="text-sm">
              {Object.keys(variables).length > 0 ? (
                <p>{Object.keys(variables).length} variable(s) defined</p>
              ) : (
                <p className="text-gray-500">No variables defined</p>
              )}
            </div>
          )}
        </div>
      </div>

      <YamlPreview />

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={handleReset}
        >
          Reset Wizard
        </Button>

        <Button
          variant="success"
          onClick={handleDownload}
          disabled={validationErrors.length > 0}
          className="px-6"
        >
          Download devfile.yaml
        </Button>
      </div>
    </div>
  )
}
