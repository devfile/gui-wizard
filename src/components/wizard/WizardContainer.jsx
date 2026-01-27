import { useWizard } from '../../hooks/useWizardState'
import WizardProgressBar from './WizardProgressBar'
import Card from '../common/Card'

// Import step components (will be created next)
import MetadataStep from '../steps/MetadataStep'
import ProjectsStep from '../steps/ProjectsStep'
import ComponentsStep from '../steps/ComponentsStep'
import CommandsStep from '../steps/CommandsStep'
import EventsStep from '../steps/EventsStep'
import VariablesStep from '../steps/VariablesStep'
import ReviewStep from '../steps/ReviewStep'

export default function WizardContainer() {
  const { state } = useWizard()

  const renderStep = () => {
    switch (state.currentStep) {
      case 0:
        return <MetadataStep />
      case 1:
        return <ProjectsStep />
      case 2:
        return <ComponentsStep />
      case 3:
        return <CommandsStep />
      case 4:
        return <EventsStep />
      case 5:
        return <VariablesStep />
      case 6:
        return <ReviewStep />
      default:
        return <MetadataStep />
    }
  }

  return (
    <div>
      <WizardProgressBar />
      <Card className="wizard-step">
        {renderStep()}
      </Card>
    </div>
  )
}
