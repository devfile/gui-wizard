import { useSectionList } from '../../hooks/useWizardState'
import { createProject } from '../../utils/factories'
import ProjectEditor from '../editors/ProjectEditor'
import ArrayFieldManager from '../forms/ArrayFieldManager'
import CollapsibleSection from '../forms/CollapsibleSection'
import Alert from '../common/Alert'
import StepIssues from '../wizard/StepIssues'
import WizardNavigation from '../wizard/WizardNavigation'

const ISSUE_PREFIXES = ['Project', 'Starter project', 'Dependent project', 'projects[', 'starterProjects[', 'dependentProjects[']

function ProjectList({ kind, prefix, addButtonText, emptyMessage }) {
  const { items, add, update, remove, move } = useSectionList(kind)

  return (
    <ArrayFieldManager
      items={items}
      onAdd={() => add(createProject(kind))}
      onRemove={remove}
      onChangeItem={update}
      onMove={move}
      renderItem={(project, index, setProject) => (
        <ProjectEditor index={index} value={project} onChange={setProject} kind={kind} prefix={prefix} />
      )}
      itemLabel={(project, index) => project.name || `Project ${index + 1}`}
      addButtonText={addButtonText}
      emptyMessage={emptyMessage}
    />
  )
}

export default function ProjectsStep() {
  const { items: projects } = useSectionList('projects')
  const { items: starterProjects } = useSectionList('starterProjects')
  const { items: dependentProjects } = useSectionList('dependentProjects')

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
      <p className="text-gray-600 mb-4">
        Source code cloned into the workspace. A devfile can declare the projects it works on, the starter projects a
        new workspace can be bootstrapped from, and the dependent projects cloned alongside them.
      </p>

      <Alert type="info" className="mb-6">
        <strong>Note:</strong> Project definition is optional. If the devfile is located in the root of the repository,
        it is recommended to omit the &apos;projects&apos; section and skip this step.
      </Alert>

      <StepIssues prefixes={ISSUE_PREFIXES} />

      <CollapsibleSection
        title="Projects"
        description="Repositories cloned into the workspace"
        badge={projects.length || undefined}
        defaultOpen
      >
        <ProjectList
          kind="projects"
          prefix="project"
          addButtonText="Add Project"
          emptyMessage="No projects added."
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Starter Projects"
        description="Templates a new workspace can be created from"
        badge={starterProjects.length || undefined}
      >
        <ProjectList
          kind="starterProjects"
          prefix="starter-project"
          addButtonText="Add Starter Project"
          emptyMessage="No starter projects added."
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Dependent Projects"
        description="Additional repositories cloned next to the main projects"
        badge={dependentProjects.length || undefined}
      >
        <ProjectList
          kind="dependentProjects"
          prefix="dependent-project"
          addButtonText="Add Dependent Project"
          emptyMessage="No dependent projects added."
        />
      </CollapsibleSection>

      <WizardNavigation />
    </div>
  )
}
