import { useState } from 'react'

function ConfigureForm({ onNext, isLocked = false }) {
  const [formData, setFormData] = useState({
    access_key: '',
    secret_key: '',
    region: 'ap-southeast-1',
    output_format: 'json',
    session_token: '',
  })
  const [showKeys, setShowKeys] = useState({
    access_key: false,
    secret_key: false,
    session_token: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const toggleKeyVisibility = (field) => {
    setShowKeys(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Sending request to /api/configure with data:', formData)
      const response = await fetch('/api/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { detail: response.statusText }
        }
        console.error('Error response:', errorData)
        throw new Error(errorData.detail || 'Configuration failed')
      }

      const successData = await response.json()
      console.log('Success response:', successData)
      onNext(formData)
    } catch (err) {
      console.error('Request error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">{error}</div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="access_key" className="form-label">
          AWS Access Key ID <span>*</span>
        </label>
        <div className="input-wrapper">
          <input
            type={showKeys.access_key ? 'text' : 'password'}
            id="access_key"
            name="access_key"
            value={formData.access_key}
            onChange={handleChange}
            placeholder="AKIA..."
            required
            className="form-input"
          />
          <button
            type="button"
            onClick={() => toggleKeyVisibility('access_key')}
            className="input-toggle"
            title={showKeys.access_key ? 'Hide' : 'Show'}
          >
            {showKeys.access_key ? '👁️‍🗨️' : '🔒'}
          </button>
        </div>
        <div className="form-description">20 alphanumeric characters</div>
      </div>

      <div className="form-group">
        <label htmlFor="secret_key" className="form-label">
          AWS Secret Access Key <span>*</span>
        </label>
        <div className="input-wrapper">
          <input
            type={showKeys.secret_key ? 'text' : 'password'}
            id="secret_key"
            name="secret_key"
            value={formData.secret_key}
            onChange={handleChange}
            placeholder="wJalrX..."
            required
            className="form-input"
          />
          <button
            type="button"
            onClick={() => toggleKeyVisibility('secret_key')}
            className="input-toggle"
            title={showKeys.secret_key ? 'Hide' : 'Show'}
          >
            {showKeys.secret_key ? '👁️‍🗨️' : '🔒'}
          </button>
        </div>
        <div className="form-description">40 base64-like characters</div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="region" className="form-label">
            Default Region <span>*</span>
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="form-select"
          >
            <option value="us-east-1">us-east-1 (N. Virginia)</option>
            <option value="us-west-2">us-west-2 (N. California)</option>
            <option value="eu-west-1">eu-west-1 (Ireland)</option>
            <option value="eu-central-1">eu-central-1 (Frankfurt)</option>
            <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
            <option value="ap-northeast-1">ap-northeast-1 (Tokyo)</option>
            <option value="ap-southeast-2">ap-southeast-2 (Sydney)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="output_format" className="form-label">
            Output Format
          </label>
          <select
            id="output_format"
            name="output_format"
            value={formData.output_format}
            onChange={handleChange}
            className="form-select"
          >
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="text">Text</option>
            <option value="table">Table</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="session_token" className="form-label">
          Session Token <span>(Optional)</span>
        </label>
        <div className="input-wrapper">
          <input
            type={showKeys.session_token ? 'text' : 'password'}
            id="session_token"
            name="session_token"
            value={formData.session_token}
            onChange={handleChange}
            placeholder="AQoDYXDz... (for temporary credentials)"
            className="form-input"
          />
          {formData.session_token && (
            <button
              type="button"
              onClick={() => toggleKeyVisibility('session_token')}
              className="input-toggle"
              title={showKeys.session_token ? 'Hide' : 'Show'}
            >
              {showKeys.session_token ? '👁️‍🗨️' : '🔒'}
            </button>
          )}
        </div>
        <div className="form-description">Use for temporary credentials (STS tokens)</div>
      </div>

      <div className="alert alert-info">
        <div className="alert-icon">ℹ️</div>
        <div className="alert-content">
          Your credentials are used only to configure AWS CLI locally and are never stored or transmitted.
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary btn-block"
      >
        {loading ? (
          <>
            <span className="loading">⏳</span> Configuring...
          </>
        ) : (
          <>Continue <span style={{ marginLeft: '0.4rem' }}>→</span></>
        )}
      </button>
    </form>
  )
}

export default ConfigureForm
