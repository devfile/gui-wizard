import { useWizard } from '../../hooks/useWizardState'
import { PARENT_SOURCE_TYPES } from '../../utils/constants'
import {
  applyParentSourceType,
  createCommand,
  createComponent,
  createParent,
  createProject,
  getCommandType,
  getComponentType,
  getParentSourceType
} from '../../utils/factories'
import CommandEditor from '../editors/CommandEditor'
import ComponentEditor from '../editors/ComponentEditor'
import ProjectEditor from '../editors/ProjectEditor'
import ArrayFieldManager from '../forms/ArrayFieldManager'
import AttributesEditor from '../forms/AttributesEditor'
import CollapsibleSection from '../forms/CollapsibleSection'
import FormInput from '../forms/FormInput'
import FormSelect from '../forms/FormSelect'
import MapFieldManager from '../forms/MapFieldManager'
import Alert from '../common/Alert'
import Button from '../common/Button'
import StepIssues from '../wizard/StepIssues'
import WizardNavigation from '../wizard/WizardNavigation'

const ISSUE_PREFIXES = ['Parent']

const PROJECT_LISTS = [
  { kind: 'projects', title: 'Project overrides', prefix: 'parent-project', addButtonText: 'Add Project Override' },
  {
    kind: 'starterProjects',
    title: 'Starter project overrides',
    prefix: 'parent-starter-project',
    addButtonText: 'Add Starter Project Override'
  },
  {
    kind: 'dependentProjects',
    title: 'Dependent project overrides',
    prefix: 'parent-dependent-project',
    addButtonText: 'Add Dependent Project Override'
  }
]

export default function ParentStep() {
  const { state, dispatch, actions } = useWizard()
  const parent = state.devfileData.parent

  const setParent = (value) => dispatch({ type: actions.SET_SECTION, payload: { section: 'parent', value } })
  const update = (patch) => setParent({ ...parent, ...patch })

  /** Replaces one entry of a parent override list. */
  const listHandlers = (key) => ({
    add: (item) => update({ [key]: [...(parent[key] || []), item] }),
    remove: (index) => update({ [key]: parent[key].filter((_, position) => position !== index) }),
    change: (index, value) =>
      update({ [key]: parent[key].map((item, position) => (position === index ? value : item)) }),
    move: (index, offset) => {
      const items = parent[key]
      const target = index + offset
      if (target < 0 || target >= items.length) return
      const reordered = [...items]
      ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
      update({ [key]: reordered })
    }
  })

  if (!parent) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Parent</h2>
        <p className="text-gray-600 mb-6">
          A devfile can inherit from a parent devfile and override parts of it. Everything defined here is merged on
          top of the parent.
        </p>

        <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">This devfile does not inherit from a parent.</p>
          <Button variant="outline" onClick={() => setParent(createParent())}>
            Add Parent
          </Button>
        </div>

        <WizardNavigation />
      </div>
    )
  }

  const sourceType = getParentSourceType(parent)
  const hasSource = Boolean(parent.uri?.trim() || parent.id?.trim() || parent.kubernetes?.name?.trim())
  const componentNames = (parent.components || []).map((component) => component.name).filter(Boolean)
  const containerNames = (parent.components || [])
    .filter((component) => getComponentType(component) === 'container')
    .map((component) => component.name)
    .filter(Boolean)
  const volumeNames = (parent.components || [])
    .filter((component) => getComponentType(component) === 'volume')
    .map((component) => component.name)
    .filter(Boolean)
  const commandIds = (parent.commands || []).map((command) => command.id).filter(Boolean)

  const components = listHandlers('components')
  const commands = listHandlers('commands')

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Parent</h2>
        <Button variant="danger" onClick={() => setParent(null)} className="text-xs px-2 py-1">
          Remove Parent
        </Button>
      </div>
      <p className="text-gray-600 mb-6">
        The parent devfile this one inherits from. Overrides below are merged on top of the parent content, so no
        field is mandatory in them.
      </p>

      {/* A parent that was just added has no source yet, which the required
          field below already says. */}
      <StepIssues prefixes={ISSUE_PREFIXES} showWarnings={hasSource} />

      <FormSelect
        name="parent-source"
        label="Parent Source"
        value={sourceType}
        onChange={(event) => setParent(applyParentSourceType(parent, event.target.value))}
        options={PARENT_SOURCE_TYPES}
      />

      {sourceType === 'uri' && (
        <FormInput
          name="parent-uri"
          label="Parent URI"
          value={parent.uri || ''}
          onChange={(event) => update({ uri: event.target.value })}
          required
          placeholder="https://registry.devfile.io/devfiles/nodejs"
          helpText="URL or relative path of the parent devfile"
        />
      )}

      {sourceType === 'id' && (
        <>
          <FormInput
            name="parent-id"
            label="Stack Id"
            value={parent.id || ''}
            onChange={(event) => update({ id: event.target.value })}
            required
            placeholder="nodejs"
            helpText="Id of the stack in a devfile registry"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              name="parent-registryUrl"
              label="Registry URL"
              value={parent.registryUrl || ''}
              onChange={(event) => update({ registryUrl: event.target.value })}
              placeholder="https://registry.devfile.io"
            />

            <FormInput
              name="parent-version"
              label="Stack Version"
              value={parent.version || ''}
              onChange={(event) => update({ version: event.target.value })}
              placeholder="latest"
              helpText='"latest" or a semantic version such as 1.2.0'
            />
          </div>
        </>
      )}

      {sourceType === 'kubernetes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            name="parent-kubernetes-name"
            label="DevWorkspaceTemplate Name"
            value={parent.kubernetes?.name || ''}
            onChange={(event) => update({ kubernetes: { ...parent.kubernetes, name: event.target.value } })}
            required
            placeholder="my-template"
          />

          <FormInput
            name="parent-kubernetes-namespace"
            label="Namespace"
            value={parent.kubernetes?.namespace || ''}
            onChange={(event) => update({ kubernetes: { ...parent.kubernetes, namespace: event.target.value } })}
            placeholder="my-namespace"
            helpText="Defaults to the namespace of the workspace"
          />
        </div>
      )}

      <Alert type="info" className="mt-2 mb-6">
        Overrides are matched by component name, command id or project name. An entry that does not exist in the
        parent is added to the devfile.
      </Alert>

      <CollapsibleSection
        title="Component overrides"
        badge={(parent.components || []).length || undefined}
        description="Components added to, or overridden in, the parent"
      >
        <ArrayFieldManager
          items={parent.components || []}
          onAdd={() => components.add(createComponent('container', true))}
          onRemove={components.remove}
          onChangeItem={components.change}
          onMove={components.move}
          renderItem={(component, index, setComponent) => (
            <ComponentEditor
              index={index}
              value={component}
              onChange={setComponent}
              partial
              prefix="parent-component"
              volumeNames={volumeNames}
            />
          )}
          itemLabel={(component, index) =>
            `${component.name || `Component ${index + 1}`} (${getComponentType(component)})`
          }
          addButtonText="Add Component Override"
          emptyMessage="No component overrides."
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Command overrides"
        badge={(parent.commands || []).length || undefined}
        description="Commands added to, or overridden in, the parent"
      >
        <ArrayFieldManager
          items={parent.commands || []}
          onAdd={() => commands.add(createCommand('exec', true))}
          onRemove={commands.remove}
          onChangeItem={commands.change}
          onMove={commands.move}
          renderItem={(command, index, setCommand) => (
            <CommandEditor
              index={index}
              value={command}
              onChange={setCommand}
              partial
              prefix="parent-command"
              componentNames={componentNames}
              containerNames={containerNames}
              commandIds={commandIds}
            />
          )}
          itemLabel={(command, index) => `${command.id || `Command ${index + 1}`} (${getCommandType(command)})`}
          addButtonText="Add Command Override"
          emptyMessage="No command overrides."
        />
      </CollapsibleSection>

      {PROJECT_LISTS.map(({ kind, title, prefix, addButtonText }) => {
        const handlers = listHandlers(kind)
        const items = parent[kind] || []

        return (
          <CollapsibleSection key={kind} title={title} badge={items.length || undefined}>
            <ArrayFieldManager
              items={items}
              onAdd={() => handlers.add(createProject(kind))}
              onRemove={handlers.remove}
              onChangeItem={handlers.change}
              onMove={handlers.move}
              renderItem={(project, index, setProject) => (
                <ProjectEditor index={index} value={project} onChange={setProject} kind={kind} prefix={prefix} />
              )}
              itemLabel={(project, index) => project.name || `Project ${index + 1}`}
              addButtonText={addButtonText}
              emptyMessage="No overrides."
            />
          </CollapsibleSection>
        )
      })}

      <CollapsibleSection title="Parent variables" badge={(parent.variables || []).length || undefined}>
        <MapFieldManager
          name="parent-variable"
          label={null}
          items={parent.variables || []}
          onChange={(variables) => update({ variables })}
          keyLabel="Variable name"
          valueLabel="Variable value"
          addButtonText="Add Variable Override"
          emptyMessage="No variable overrides."
        />
      </CollapsibleSection>

      <CollapsibleSection title="Parent attributes">
        <AttributesEditor
          name="parent-attributes"
          value={parent.attributes || ''}
          onChange={(text) => update({ attributes: text })}
        />
      </CollapsibleSection>

      <WizardNavigation />
    </div>
  )
}
