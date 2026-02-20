import { useState } from 'react'

function ReviewPage({ formData, onSubmit, isLocked = false }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [psContent, setPsContent] = useState('')
  const [showCommand, setShowCommand] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    setPsContent('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle validation errors with detailed messages
        if (response.status === 422 && errorData.detail?.validation_errors) {
          const errors = errorData.detail.validation_errors
          const errorMessage = errors.join('\n')
          throw new Error(`Validation failed:\n${errorMessage}`)
        }
        
        // Handle other error responses
        if (errorData.detail) {
          throw new Error(typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
        }
        
        throw new Error('Failed to generate script')
      }

      const data = await response.json()
      setPsContent(data.ps1_content)
      setSuccess('Script generated successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!psContent) {
      setError('Generate script first')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ps1_content: psContent }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle detailed error responses
        let errorMessage = 'Execution failed'
        
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        } else if (typeof errorData.detail === 'object' && errorData.detail !== null) {
          // Extract error details from structured response
          if (errorData.detail.message) {
            errorMessage = errorData.detail.message
          }
          
          if (errorData.detail.error) {
            errorMessage += '\n\nDetails:\n' + errorData.detail.error
          }
          
          if (errorData.detail.output) {
            errorMessage += '\n\nOutput:\n' + errorData.detail.output
          }
          
          if (errorData.detail.exit_code !== undefined) {
            errorMessage += '\n\nExit Code: ' + errorData.detail.exit_code
          }
          
          if (errorData.detail.traceback) {
            errorMessage += '\n\nTraceback:\n' + errorData.detail.traceback
          }
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (data.success) {
        setSuccess('✓ Endpoint created successfully!')
      } else {
        throw new Error('Execution returned an error')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(psContent))
    element.setAttribute('download', 'vpc-endpoint-script.ps1')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 4: Review & Execute</h2>
        <p className="text-sm text-gray-600">Review your configuration before executing</p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Endpoint Type:</span>
            <span className="font-medium">{formData.endpoint_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">VPC ID:</span>
            <span className="font-medium">{formData.vpc_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Services:</span>
            <span className="font-medium">{formData.service_names?.length || 0} selected</span>
          </div>
          {formData.service_names && formData.service_names.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Service ARNs:</span>
              <div className="flex flex-wrap gap-2 justify-end">
                {formData.service_names.map((arn, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {arn.split('.').pop()}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Tag Prefix:</span>
            <span className="font-medium">{formData.tag_prefix}</span>
          </div>
          {formData.endpoint_type === 'Interface' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Subnets:</span>
                <span className="font-medium">{formData.subnets.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Security Groups:</span>
                <span className="font-medium">{formData.security_groups.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Private DNS:</span>
                <span className="font-medium">{formData.private_dns_enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </>
          )}
          {formData.endpoint_type === 'Gateway' && (
            <div className="flex justify-between">
              <span className="text-gray-600">Route Tables:</span>
              <span className="font-medium">
                {formData.select_all_route_tables ? 'All in VPC' : formData.route_tables.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-wrap overflow-y-auto max-h-96 font-mono">
          <div className="font-bold mb-2">❌ Error:</div>
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* PowerShell Script Display */}
      {psContent && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-64">
          <pre>{psContent}</pre>
        </div>
      )}

      {/* Toggle Command View */}
      <button
        onClick={() => setShowCommand(!showCommand)}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        {showCommand ? '▼' : '▶'} View AWS CLI Command
      </button>

      {showCommand && (
        <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-blue-500 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
          <div>
            {formData.service_names && formData.service_names.length > 0 ? (
              <>
                <p className="text-gray-700 mb-2">AWS CLI commands for {formData.service_names.length} services:</p>
                {formData.service_names.map((serviceName, idx) => (
                  <div key={idx} className="mb-2 pb-2 border-b border-gray-300 last:border-b-0">
                    <code>aws ec2 create-vpc-endpoint --vpc-id {formData.vpc_id} --vpc-endpoint-type {formData.endpoint_type} --service-name {serviceName}</code>
                  </div>
                ))}
              </>
            ) : (
              <code>aws ec2 create-vpc-endpoint --vpc-id {formData.vpc_id} --vpc-endpoint-type {formData.endpoint_type} --service-name [service-name]</code>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleGenerate}
          disabled={loading || psContent}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
        >
          {loading ? 'Generating...' : 'Generate Script'}
        </button>

        {psContent && (
          <>
            <button
              onClick={handleDownload}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              Download .ps1
            </button>

            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              {loading ? 'Executing...' : 'Execute Now'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default ReviewPage
