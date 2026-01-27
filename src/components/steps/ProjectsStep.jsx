import { useState } from 'react'
import { useWizard } from '../../hooks/useWizardState'
import FormInput from '../forms/FormInput'
import FormSelect from '../forms/FormSelect'
import FormCheckbox from '../forms/FormCheckbox'
import ArrayFieldManager from '../forms/ArrayFieldManager'
import WizardNavigation from '../wizard/WizardNavigation'
import Alert from '../common/Alert'

export default function ProjectsStep() {
  const { state, dispatch, actions } = useWizard()
  const projects = state.devfileData.projects

  const createNewProject = () => ({
    name: '',
    clonePath: '',
    sourceType: 'git',
    git: {
      remotes: { origin: '' },
      checkoutFrom: { revision: '' }
    },
    zip: {
      location: ''
    }
  })

  const handleAddProject = () => {
    dispatch({
      type: actions.ADD_PROJECT,
      payload: createNewProject()
    })
  }

  const handleRemoveProject = (index) => {
    dispatch({
      type: actions.REMOVE_PROJECT,
      payload: index
    })
  }

  const handleUpdateProject = (index, field, value) => {
    const project = projects[index]
    let updates = {}

    if (field === 'sourceType') {
      updates = { sourceType: value }
    } else if (field === 'name' || field === 'clonePath') {
      updates = { [field]: value }
    } else if (field === 'git.url') {
      updates = {
        git: {
          ...project.git,
          remotes: { origin: value }
        }
      }
    } else if (field === 'git.revision') {
      updates = {
        git: {
          ...project.git,
          checkoutFrom: { revision: value }
        }
      }
    } else if (field === 'zip.location') {
      updates = {
        zip: { location: value }
      }
    }

    dispatch({
      type: actions.UPDATE_PROJECT,
      payload: { index, data: updates }
    })
  }

  const renderProjectItem = (project, index, updateField) => {
    return (
      <div className="space-y-4">
        <FormInput
          name={`project-name-${index}`}
          label="Project Name"
          value={project.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          required
          placeholder="my-project"
        />

        <FormInput
          name={`project-clonePath-${index}`}
          label="Clone Path (Optional)"
          value={project.clonePath || ''}
          onChange={(e) => updateField('clonePath', e.target.value)}
          placeholder="relative/path"
          helpText="Relative path within /projects/ directory"
        />

        <FormSelect
          name={`project-sourceType-${index}`}
          label="Source Type"
          value={project.sourceType || 'git'}
          onChange={(e) => updateField('sourceType', e.target.value)}
          options={[
            { value: 'git', label: 'Git Repository' },
            { value: 'zip', label: 'Zip Archive' }
          ]}
        />

        {project.sourceType === 'git' && (
          <>
            <FormInput
              name={`project-git-url-${index}`}
              label="Git Repository URL"
              value={project.git?.remotes?.origin || ''}
              onChange={(e) => updateField('git.url', e.target.value)}
              placeholder="https://github.com/org/repo.git"
              required
            />

            <FormInput
              name={`project-git-revision-${index}`}
              label="Branch/Tag/Commit (Optional)"
              value={project.git?.checkoutFrom?.revision || ''}
              onChange={(e) => updateField('git.revision', e.target.value)}
              placeholder="main"
            />
          </>
        )}

        {project.sourceType === 'zip' && (
          <FormInput
            name={`project-zip-location-${index}`}
            label="Zip Archive URL"
            value={project.zip?.location || ''}
            onChange={(e) => updateField('zip.location', e.target.value)}
            placeholder="https://example.com/archive.zip"
            required
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
      <p className="text-gray-600 mb-4">
        Add source code repositories (Git or Zip) to clone into your workspace.
      </p>
      
      <Alert type="info" className="mb-6">
        <strong>Note:</strong> Project definition is optional. If the devfile is located in the root of the repository, it is recommended to omit the 'projects' section and skip this step.
      </Alert>

      <ArrayFieldManager
        items={projects}
        onAdd={handleAddProject}
        onRemove={handleRemoveProject}
        onUpdate={handleUpdateProject}
        renderItem={renderProjectItem}
        addButtonText="Add Project"
        emptyMessage="No projects added. Click below to add your first project."
      />

      <WizardNavigation />
    </div>
  )
}
