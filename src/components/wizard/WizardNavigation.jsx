import { useWizard } from '../../hooks/useWizardState'
import { WIZARD_STEPS } from '../../utils/constants'
import Button from '../common/Button'

export default function WizardNavigation({ onNext, canProceed = true }) {
  const { state, dispatch, actions } = useWizard()

  const currentStepConfig = WIZARD_STEPS[state.currentStep]
  const isFirstStep = state.currentStep === 0
  const isLastStep = state.currentStep === WIZARD_STEPS.length - 1

  const handlePrevious = () => {
    dispatch({ type: actions.PREV_STEP })
  }

  const handleNext = () => {
    if (onNext) {
      const proceed = onNext()
      if (proceed !== false) {
        dispatch({ type: actions.MARK_STEP_COMPLETED, payload: state.currentStep })
        dispatch({ type: actions.NEXT_STEP })
      }
    } else {
      dispatch({ type: actions.MARK_STEP_COMPLETED, payload: state.currentStep })
      dispatch({ type: actions.NEXT_STEP })
    }
  }

  const handleSkip = () => {
    dispatch({ type: actions.MARK_STEP_COMPLETED, payload: state.currentStep })
    dispatch({ type: actions.NEXT_STEP })
  }

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <div>
        {!isFirstStep && (
          <Button
            variant="secondary"
            onClick={handlePrevious}
          >
            Previous
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        {!isLastStep && !currentStepConfig.required && (
          <Button
            variant="outline"
            onClick={handleSkip}
          >
            Skip
          </Button>
        )}

        {!isLastStep && (
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!canProceed}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
