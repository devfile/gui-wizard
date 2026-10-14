import { useWizard } from '../../hooks/useWizardState'
import { WIZARD_STEPS } from '../../utils/constants'
import WizardProgressBar from './WizardProgressBar'
import Card from '../common/Card'

import MetadataStep from '../steps/MetadataStep'
import ParentStep from '../steps/ParentStep'
import ProjectsStep from '../steps/ProjectsStep'
import ComponentsStep from '../steps/ComponentsStep'
import CommandsStep from '../steps/CommandsStep'
import EventsStep from '../steps/EventsStep'
import VariablesStep from '../steps/VariablesStep'
import ReviewStep from '../steps/ReviewStep'

/** Keyed by the step ids declared in `WIZARD_STEPS`. */
const STEP_COMPONENTS = {
  metadata: MetadataStep,
  parent: ParentStep,
  projects: ProjectsStep,
  components: ComponentsStep,
  commands: CommandsStep,
  events: EventsStep,
  variables: VariablesStep,
  review: ReviewStep
}

export default function WizardContainer() {
  const { state } = useWizard()

  const step = WIZARD_STEPS[state.currentStep] || WIZARD_STEPS[0]
  const StepComponent = STEP_COMPONENTS[step.id]

  return (
    <div>
      <WizardProgressBar />
      <Card className="wizard-step">
        <StepComponent />
      </Card>
    </div>
  )
}
