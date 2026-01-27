import { WizardProvider } from './hooks/useWizardState'
import WizardContainer from './components/wizard/WizardContainer'
import YamlPreview from './components/preview/YamlPreview'

function App() {
  return (
    <WizardProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Devfile Wizard
            </h1>
            <p className="mt-2 text-gray-600">
              Create devfile 2.3.0 configuration files step-by-step
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <WizardContainer />
            </div>
            <div className="hidden lg:block mt-8 lg:mt-0">
              <YamlPreview inSidebar={true} />
            </div>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
            Learn more about devfiles at{' '}
              <a
                href="https://devfile.io/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500"
              >
                devfile.io/docs
              </a>
            </p>
            <p className="text-center text-sm text-gray-500">
            Copyright © Devfile a Series of LF Projects, LLC For website terms of use, trademark policy and other project policies please see{' '}
              <a
                href="https://lfprojects.org/policies/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500"
              >
                lfprojects.org/policies/.
              </a>
            </p>
          </div>
        </footer>
      </div>
    </WizardProvider>
  )
}

export default App
