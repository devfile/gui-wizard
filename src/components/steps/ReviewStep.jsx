import { useMemo } from 'react'
import { useWizard } from '../../hooks/useWizardState'
import { buildDevfile, generateYaml, validateDevfile } from '../../utils/devfileGenerator'
import { WIZARD_STEPS } from '../../utils/constants'
import { getCommandType, getComponentType } from '../../utils/factories'
import { downloadYamlFile } from '../../utils/downloadFile'
import Alert from '../common/Alert'
import Badge from '../common/Badge'
import Button from '../common/Button'
import Card from '../common/Card'
import YamlPreview from '../preview/YamlPreview'

const STEP_INDEX = Object.fromEntries(WIZARD_STEPS.map((step, index) => [step.id, index]))

function countBy(items, resolve) {
  const counts = new Map()
  for (const item of items) {
    const key = resolve(item)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()].map(([key, count]) => `${count} ${key}`).join(', ')
}

function SummaryCard({ title, stepId, configured, notConfiguredLabel = 'Not configured', onEdit, children }) {
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Badge variant={configured ? 'success' : 'default'} className="mt-1">
            {configured ? 'Configured' : notConfiguredLabel}
          </Badge>
        </div>
        <Button variant="outline" onClick={() => onEdit(STEP_INDEX[stepId])} className="text-xs px-2 py-1">
          Edit
        </Button>
      </div>
      <div className="text-sm text-gray-700 space-y-1">{children}</div>
    </Card>
  )
}

export default function ReviewStep() {
  const { state, dispatch, actions } = useWizard()
  const data = state.devfileData

  const { errors, warnings, devfile } = useMemo(
    () => ({ ...validateDevfile(data), devfile: buildDevfile(data) }),
    [data]
  )

  const metadata = devfile.metadata || {}
  const events = devfile.events || {}
  const eventCount = Object.values(events).reduce((total, list) => total + list.length, 0)
  const projectCount =
    (devfile.projects?.length || 0) +
    (devfile.starterProjects?.length || 0) +
    (devfile.dependentProjects?.length || 0)

  const handleDownload = () => {
    const filename = metadata.name ? `${metadata.name}-devfile.yaml` : 'devfile.yaml'
    downloadYamlFile(generateYaml(data), filename)
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the wizard? All data will be lost.')) {
      dispatch({ type: actions.RESET_WIZARD })
    }
  }

  const handleEdit = (stepIndex) => dispatch({ type: actions.GOTO_STEP, payload: stepIndex })

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Review &amp; Download</h2>
      <p className="text-gray-600 mb-6">
        Review the devfile and download it. Errors must be fixed before downloading, warnings are advisory.
      </p>

      <div className="space-y-3 mb-6">
        {errors.length === 0 && warnings.length === 0 && (
          <Alert type="success" title="Valid devfile">
            The devfile matches the devfile 2.3.0 schema and the devfile validation rules.
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert type="error" title={`${errors.length} error${errors.length === 1 ? '' : 's'}`}>
            <ul className="list-disc list-inside space-y-1" data-testid="review-errors">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {warnings.length > 0 && (
          <Alert type="warning" title={`${warnings.length} warning${warnings.length === 1 ? '' : 's'}`}>
            <ul className="list-disc list-inside space-y-1" data-testid="review-warnings">
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
        <div>
          <SummaryCard
            title="Basic Information"
            stepId="metadata"
            configured={Boolean(metadata.name || metadata.generateName)}
            onEdit={handleEdit}
          >
            {metadata.name && (
              <p>
                <strong>Name:</strong> {metadata.name}
              </p>
            )}
            {metadata.generateName && (
              <p>
                <strong>Generate name:</strong> {metadata.generateName}
              </p>
            )}
            {metadata.version && (
              <p>
                <strong>Version:</strong> {metadata.version}
              </p>
            )}
            {metadata.language && (
              <p>
                <strong>Language:</strong> {metadata.language}
              </p>
            )}
            {metadata.projectType && (
              <p>
                <strong>Project type:</strong> {metadata.projectType}
              </p>
            )}
            {!metadata.name && !metadata.generateName && <p className="text-gray-500">No name set</p>}
          </SummaryCard>

          <SummaryCard
            title="Parent"
            stepId="parent"
            configured={devfile.parent !== undefined}
            notConfiguredLabel="Not used (optional)"
            onEdit={handleEdit}
          >
            {devfile.parent ? (
              <p>
                <strong>Inherits from:</strong>{' '}
                {devfile.parent.uri || devfile.parent.id || devfile.parent.kubernetes?.name}
              </p>
            ) : (
              <p className="text-gray-500">No parent devfile, the section is left out</p>
            )}
          </SummaryCard>

          <SummaryCard title="Projects" stepId="projects" configured={projectCount > 0} onEdit={handleEdit}>
            {projectCount === 0 ? (
              <p className="text-gray-500">No projects added</p>
            ) : (
              <>
                {devfile.projects && <p>{devfile.projects.length} project(s)</p>}
                {devfile.starterProjects && <p>{devfile.starterProjects.length} starter project(s)</p>}
                {devfile.dependentProjects && <p>{devfile.dependentProjects.length} dependent project(s)</p>}
              </>
            )}
          </SummaryCard>
        </div>

        <div>
          <SummaryCard
            title="Components"
            stepId="components"
            configured={Boolean(devfile.components)}
            onEdit={handleEdit}
          >
            {devfile.components ? (
              <p>{countBy(data.components, getComponentType)}</p>
            ) : (
              <p className="text-gray-500">No components added</p>
            )}
          </SummaryCard>

          <SummaryCard title="Commands" stepId="commands" configured={Boolean(devfile.commands)} onEdit={handleEdit}>
            {devfile.commands ? (
              <p>{countBy(data.commands, getCommandType)}</p>
            ) : (
              <p className="text-gray-500">No commands added</p>
            )}
          </SummaryCard>

          <SummaryCard title="Events" stepId="events" configured={eventCount > 0} onEdit={handleEdit}>
            {eventCount === 0 ? (
              <p className="text-gray-500">No events configured</p>
            ) : (
              Object.entries(events).map(([eventType, commandIds]) => (
                <p key={eventType}>
                  <strong>{eventType}:</strong> {commandIds.join(', ')}
                </p>
              ))
            )}
          </SummaryCard>

          <SummaryCard
            title="Variables"
            stepId="variables"
            configured={Boolean(devfile.variables)}
            onEdit={handleEdit}
          >
            {devfile.variables ? (
              <p>{Object.keys(devfile.variables).join(', ')}</p>
            ) : (
              <p className="text-gray-500">No variables defined</p>
            )}
          </SummaryCard>
        </div>
      </div>

      <YamlPreview />

      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={handleReset}>
          Reset Wizard
        </Button>

        <Button variant="success" onClick={handleDownload} disabled={errors.length > 0} className="px-6">
          Download devfile.yaml
        </Button>
      </div>
    </div>
  )
}
