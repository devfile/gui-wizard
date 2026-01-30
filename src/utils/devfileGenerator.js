function hasContent(obj) {
  if (!obj) return false
  if (typeof obj !== 'object') return !!obj
  if (Array.isArray(obj)) return obj.length > 0
  return Object.keys(obj).length > 0 && Object.values(obj).some(v => v !== '' && v !== null && v !== undefined)
}

function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') return obj

  if (Array.isArray(obj)) {
    const cleaned = obj.map(cleanObject).filter(item => item !== null && item !== undefined)
    return cleaned.length > 0 ? cleaned : undefined
  }

  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined || value === '') continue

    if (Array.isArray(value)) {
      if (value.length > 0) {
        result[key] = cleanObject(value)
      }
    } else if (typeof value === 'object') {
      const cleaned = cleanObject(value)
      if (cleaned && Object.keys(cleaned).length > 0) {
        result[key] = cleaned
      }
    } else {
      result[key] = value
    }
  }

  return Object.keys(result).length > 0 ? result : undefined
}

export function cleanDevfileData(data) {
  const result = {
    schemaVersion: data.schemaVersion
  }

  // Add metadata if any fields are populated
  if (hasContent(data.metadata)) {
    const metadata = cleanObject(data.metadata)
    if (metadata && Object.keys(metadata).length > 0) {
      result.metadata = metadata
    }
  }

  // Add projects if array not empty
  if (data.projects && data.projects.length > 0) {
    const projects = cleanObject(data.projects)
    if (projects && projects.length > 0) {
      result.projects = projects
    }
  }

  // Add starterProjects if array not empty
  if (data.starterProjects && data.starterProjects.length > 0) {
    const starterProjects = cleanObject(data.starterProjects)
    if (starterProjects && starterProjects.length > 0) {
      result.starterProjects = starterProjects
    }
  }

  // Add components if array not empty
  if (data.components && data.components.length > 0) {
    const components = cleanObject(data.components)
    if (components && components.length > 0) {
      result.components = components
    }
  }

  // Add commands if array not empty
  if (data.commands && data.commands.length > 0) {
    const commands = cleanObject(data.commands)
    if (commands && commands.length > 0) {
      result.commands = commands
    }
  }

  // Add events if any are defined
  if (hasContent(data.events)) {
    const events = {}
    if (data.events.preStart && data.events.preStart.length > 0) {
      events.preStart = data.events.preStart
    }
    if (data.events.postStart && data.events.postStart.length > 0) {
      events.postStart = data.events.postStart
    }
    if (data.events.preStop && data.events.preStop.length > 0) {
      events.preStop = data.events.preStop
    }
    if (data.events.postStop && data.events.postStop.length > 0) {
      events.postStop = data.events.postStop
    }
    if (Object.keys(events).length > 0) {
      result.events = events
    }
  }

  // Add variables if any are defined
  if (hasContent(data.variables)) {
    result.variables = data.variables
  }

  // Add attributes if any are defined
  if (hasContent(data.attributes)) {
    const attributes = cleanObject(data.attributes)
    if (attributes && Object.keys(attributes).length > 0) {
      result.attributes = attributes
    }
  }

  return result
}

export function validateDevfile(data) {
  const errors = []

  // Schema version is always required
  if (!data.schemaVersion) {
    errors.push('Schema version is required')
  }

  // Check for unique component names
  if (data.components && data.components.length > 0) {
    const names = data.components.map(c => c.name).filter(Boolean)
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
    if (duplicates.length > 0) {
      errors.push(`Duplicate component names: ${duplicates.join(', ')}`)
    }
  }

  // Check for unique command IDs
  if (data.commands && data.commands.length > 0) {
    const ids = data.commands.map(c => c.id).filter(Boolean)
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    if (duplicates.length > 0) {
      errors.push(`Duplicate command IDs: ${duplicates.join(', ')}`)
    }
  }

  // Check for unique project names
  if (data.projects && data.projects.length > 0) {
    const names = data.projects.map(p => p.name).filter(Boolean)
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
    if (duplicates.length > 0) {
      errors.push(`Duplicate project names: ${duplicates.join(', ')}`)
    }
  }

  // Check that event-referenced commands exist
  if (data.events) {
    const commandIds = (data.commands || []).map(c => c.id).filter(Boolean)
    const allEventCommands = [
      ...(data.events.preStart || []),
      ...(data.events.postStart || []),
      ...(data.events.preStop || []),
      ...(data.events.postStop || [])
    ]
    const invalidRefs = allEventCommands.filter(cmd => !commandIds.includes(cmd))
    if (invalidRefs.length > 0) {
      errors.push(`Event references non-existent commands: ${invalidRefs.join(', ')}`)
    }
  }

  return errors
}
