import { useMemo } from 'react'
import { useWizard } from '../../hooks/useWizardState'
import { validateDevfile } from '../../utils/devfileGenerator'
import Alert from '../common/Alert'

/** Keeps the messages produced by `validateDevfile` that belong to one step. */
export function filterIssues(messages, prefixes) {
  return messages.filter((message) => prefixes.some((prefix) => message.startsWith(prefix)))
}

/**
 * Live validation feedback for a single wizard step.
 *
 * The whole devfile is validated on every render, and each step only shows the
 * messages it is responsible for, so the same rules back the step hints and the
 * final review.
 */
export default function StepIssues({ prefixes, showWarnings = true }) {
  const { state } = useWizard()

  const { errors, warnings } = useMemo(() => {
    const result = validateDevfile(state.devfileData)
    return {
      errors: filterIssues(result.errors, prefixes),
      warnings: showWarnings ? filterIssues(result.warnings, prefixes) : []
    }
  }, [state.devfileData, prefixes, showWarnings])

  if (errors.length === 0 && warnings.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {errors.length > 0 && (
        <Alert type="error" title={errors.length === 1 ? '1 issue to fix' : `${errors.length} issues to fix`}>
          <ul className="list-disc list-inside space-y-1" data-testid="step-errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert type="warning" title="Suggestions">
          <ul className="list-disc list-inside space-y-1" data-testid="step-warnings">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}
    </div>
  )
}
