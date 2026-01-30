export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required'
    }
    return null
  },

  devfileName: (value) => {
    if (!value) {
      return 'Name is required'
    }

    const pattern = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
    if (!pattern.test(value)) {
      return 'Name must be lowercase alphanumeric with hyphens only'
    }

    if (value.length > 63) {
      return 'Name must be 63 characters or less'
    }

    return null
  },

  url: (value) => {
    if (!value) return null // URL is optional

    try {
      new URL(value)
      return null
    } catch {
      return 'Must be a valid URL (e.g., https://example.com)'
    }
  },

  uniqueId: (value, existingIds = []) => {
    if (!value) {
      return 'ID is required'
    }

    if (existingIds.includes(value)) {
      return 'ID must be unique'
    }

    return null
  },

  alphanumeric: (value) => {
    if (!value) return null

    const pattern = /^[a-zA-Z0-9_-]+$/
    if (!pattern.test(value)) {
      return 'Must contain only letters, numbers, underscores, and hyphens'
    }

    return null
  }
}

export function validateMetadata(metadata) {
  const errors = {}

  const nameError = validators.devfileName(metadata.name)
  if (nameError) errors.name = nameError

  if (metadata.website) {
    const websiteError = validators.url(metadata.website)
    if (websiteError) errors.website = websiteError
  }

  if (metadata.supportUrl) {
    const supportUrlError = validators.url(metadata.supportUrl)
    if (supportUrlError) errors.supportUrl = supportUrlError
  }

  return errors
}

export function validateProject(project, existingNames = []) {
  const errors = {}

  if (!project.name) {
    errors.name = 'Project name is required'
  } else if (existingNames.includes(project.name)) {
    errors.name = 'Project name must be unique'
  }

  const hasGit = project.git && project.git.remotes && project.git.remotes.origin
  const hasZip = project.zip && project.zip.location

  if (!hasGit && !hasZip) {
    errors.source = 'Either Git or Zip source is required'
  }

  if (hasGit) {
    const urlError = validators.url(project.git.remotes.origin)
    if (urlError) errors.gitUrl = urlError
  }

  if (hasZip) {
    const urlError = validators.url(project.zip.location)
    if (urlError) errors.zipLocation = urlError
  }

  return errors
}

export function validateComponent(component, existingNames = []) {
  const errors = {}

  if (!component.name) {
    errors.name = 'Component name is required'
  } else if (existingNames.includes(component.name)) {
    errors.name = 'Component name must be unique'
  }

  if (component.container && !component.container.image) {
    errors.image = 'Container image is required'
  }

  if (component.volume && !component.volume.size) {
    errors.size = 'Volume size is required'
  }

  return errors
}

export function validateCommand(command, existingIds = []) {
  const errors = {}

  if (!command.id) {
    errors.id = 'Command ID is required'
  } else if (existingIds.includes(command.id)) {
    errors.id = 'Command ID must be unique'
  }

  if (command.exec) {
    if (!command.exec.commandLine) {
      errors.commandLine = 'Command line is required'
    }
    if (!command.exec.component) {
      errors.component = 'Component reference is required'
    }
  }

  if (command.composite && (!command.composite.commands || command.composite.commands.length === 0)) {
    errors.commands = 'At least one command reference is required'
  }

  return errors
}
