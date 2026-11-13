import { WIZARD_STEPS } from '../../utils/constants'
import Badge from '../common/Badge'

const STEP_BY_ID = Object.fromEntries(WIZARD_STEPS.map((step) => [step.id, step]))

/**
 * Title row shared by every wizard step, so the heading, the `Optional` badge and the
 * per-step actions are laid out the same way everywhere. Whether a step is optional comes
 * from `WIZARD_STEPS`, the same place the progress bar reads it from.
 *
 * @param {string} stepId - id declared in `WIZARD_STEPS`.
 * @param {React.ReactNode} [children] - heading text, defaults to the step heading.
 * @param {React.ReactNode} [actions] - controls rendered on the right of the row.
 */
export default function StepHeading({ stepId, children, actions, className = 'mb-2' }) {
  const step = STEP_BY_ID[stepId]

  return (
    <div className={`flex justify-between items-start gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-gray-900">{children || step?.heading}</h2>
        {step && !step.required && <Badge variant="default">Optional</Badge>}
      </div>
      {actions}
    </div>
  )
}
