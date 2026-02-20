import { useState } from 'react'
import ConfigureForm from './components/ConfigureForm'
import EndpointSelector from './components/EndpointSelector'
import ParameterForm from './components/ParameterForm'
import ReviewPage from './components/ReviewPage'
import './App.css'
import './professional-components.css'

const steps = [
  { id: 'configure', name: 'Configure', description: 'AWS Credentials' },
  { id: 'select', name: 'Select', description: 'Endpoint Type' },
  { id: 'params', name: 'Parameters', description: 'Configuration' },
  { id: 'review', name: 'Review', description: 'Finalize' },
]

function App() {
  const [currentStep, setCurrentStep] = useState('configure')
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [showInputWarning, setShowInputWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [formData, setFormData] = useState({
    access_key: '',
    secret_key: '',
    region: 'ap-southeast-1',
    output_format: 'json',
    session_token: '',
    endpoint_type: '',
    endpoint_types: {},
    selected_services: { interface: [], gateway: [] },
    vpc_id: '',
    service_names: [], // Will hold multiple services
    tag_prefix: '',
    tag_suffix: '',
    subnets: [],
    security_groups: [],
    private_dns_enabled: true,
    route_tables: [],
    select_all_route_tables: false,
  })

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  // Check if current step is editable (either current or completed)
  const isCurrentStepEditable = completedSteps.has(currentStep) || currentStep === 'configure' || completedSteps.has(steps[currentStepIndex - 1]?.id)

  const handleConfigureNext = (config) => {
    setFormData(prev => ({ ...prev, ...config }))
    setCompletedSteps(prev => new Set([...prev, 'configure']))
    setCurrentStep('select')
  }

  const handleSelectNext = (data) => {
    setFormData(prev => ({
      ...prev,
      endpoint_type: data.endpointType,
      endpoint_types: data.endpoint_types,
      selected_services: data.selected_services,
      subnets: data.subnets || [],
      security_groups: data.security_groups || [],
      route_tables: data.route_tables || [],
      select_all_route_tables: data.select_all_route_tables || false,
    }))
    setCompletedSteps(prev => new Set([...prev, 'select']))
    setCurrentStep('params')
  }

  const handleParamsNext = (params) => {
    setFormData(prev => ({ ...prev, ...params }))
    setCompletedSteps(prev => new Set([...prev, 'params']))
    setCurrentStep('review')
  }

  const handleStepClick = (stepId, stepIndex) => {
    // Allow clicking any step to view it
    setCurrentStep(stepId)
    setShowInputWarning(false)
  }

  const handleInputAttempt = () => {
    const prevStep = steps[currentStepIndex - 1]
    if (prevStep && !completedSteps.has(prevStep.id)) {
      setWarningMessage(`Complete "${prevStep.name}" first to edit this page`)
      setShowInputWarning(true)
      setTimeout(() => setShowInputWarning(false), 4000)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id)
      setShowInputWarning(false)
    }
  }

  const handleReset = () => {
    setCurrentStep('configure')
    setFormData({
      access_key: '',
      secret_key: '',
      region: 'ap-southeast-1',
      output_format: 'json',
      session_token: '',
      endpoint_type: '',
      endpoint_types: {},
      selected_services: { interface: [], gateway: [] },
      vpc_id: '',
      service_names: [],
      tag_prefix: '',
      tag_suffix: '',
      subnets: [],
      security_groups: [],
      private_dns_enabled: true,
      route_tables: [],
      select_all_route_tables: false,
    })
    setCompletedSteps(new Set())
  }

  return (
    <div className="app-wrapper">
      {/* Header */}
      <div className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>AWS VPC Endpoint Generator</h1>
            <p>Create and manage VPC endpoints with ease</p>
          </div>
          <div className="header-icon-container">
            <div className="header-icon-ring"></div>
            <div className="header-icon-dot"></div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="app-container">
        <div className="form-wrapper">
          {/* Step Warning */}
          {showInputWarning && (
            <div className="input-warning">
              <div className="warning-icon">🔒</div>
              <div className="warning-content">
                <div className="warning-title">Editing Locked</div>
                <div className="warning-message">{warningMessage}</div>
              </div>
              <button 
                className="warning-close" 
                onClick={() => setShowInputWarning(false)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Progress Stepper */}
          <div className="stepper">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className="step-wrapper"
                onClick={() => handleStepClick(step.id, index)}
                style={{ cursor: 'pointer' }}
                title="Click to view this step"
              >
                <div 
                  className={`step-indicator ${currentStepIndex === index ? 'active' : ''} ${completedSteps.has(step.id) ? 'completed' : ''}`}
                >
                  {completedSteps.has(step.id) ? '✓' : index + 1}
                </div>
                <div className="step-info">
                  <div className="step-name">{step.name}</div>
                  <div className="step-desc">{step.description}</div>
                </div>
                {index < steps.length - 1 && <div className="step-line"></div>}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <div className="form-content">
            {currentStep === 'configure' && (
              <ConfigureForm 
                onNext={handleConfigureNext}
                isLocked={false}
              />
            )}

            {currentStep === 'select' && (
              <EndpointSelector 
                onNext={handleSelectNext}
                isLocked={!completedSteps.has('configure')}
                onInputAttempt={handleInputAttempt}
              />
            )}

            {currentStep === 'params' && (
              <ParameterForm
                endpointType={formData.endpoint_type}
                onNext={handleParamsNext}
                initialData={formData}
                isLocked={!completedSteps.has('select')}
                onInputAttempt={handleInputAttempt}
              />
            )}

            {currentStep === 'review' && (
              <ReviewPage
                formData={formData}
                onSubmit={() => {}}
                onReset={handleReset}
                isLocked={!completedSteps.has('params')}
              />
            )}
          </div>

          {/* Navigation */}
          {currentStep !== 'configure' && (
            <div className="form-navigation">
              <button onClick={handleBack} className="btn-back">
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
