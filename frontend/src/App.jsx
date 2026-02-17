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
  const [formData, setFormData] = useState({
    access_key: '',
    secret_key: '',
    region: 'ap-southeast-1',
    output_format: 'json',
    session_token: '',
    endpoint_type: '',
    vpc_id: '',
    service_name: '',
    tag_prefix: '',
    tag_suffix: '',
    subnets: [],
    security_groups: [],
    private_dns_enabled: true,
    route_tables: [],
    select_all_route_tables: false,
  })

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  const handleConfigureNext = (config) => {
    setFormData(prev => ({ ...prev, ...config }))
    setCurrentStep('select')
  }

  const handleSelectNext = (endpointType) => {
    setFormData(prev => ({ ...prev, endpoint_type: endpointType }))
    setCurrentStep('params')
  }

  const handleParamsNext = (params) => {
    setFormData(prev => ({ ...prev, ...params }))
    setCurrentStep('review')
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id)
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
      vpc_id: '',
      service_name: '',
      tag_prefix: '',
      tag_suffix: '',
      subnets: [],
      security_groups: [],
      private_dns_enabled: true,
      route_tables: [],
      select_all_route_tables: false,
    })
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
          {/* Progress Stepper */}
          <div className="stepper">
            {steps.map((step, index) => (
              <div key={step.id} className="step-wrapper">
                <div className={`step-indicator ${currentStepIndex === index ? 'active' : ''} ${currentStepIndex > index ? 'completed' : ''}`}>
                  {currentStepIndex > index ? '✓' : index + 1}
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
              <ConfigureForm onNext={handleConfigureNext} />
            )}

            {currentStep === 'select' && (
              <EndpointSelector onNext={handleSelectNext} />
            )}

            {currentStep === 'params' && (
              <ParameterForm
                endpointType={formData.endpoint_type}
                onNext={handleParamsNext}
                initialData={formData}
              />
            )}

            {currentStep === 'review' && (
              <ReviewPage
                formData={formData}
                onSubmit={() => {}}
                onReset={handleReset}
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
