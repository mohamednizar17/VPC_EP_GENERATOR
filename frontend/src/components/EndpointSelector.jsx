import { useState } from 'react'

function EndpointSelector({ onNext }) {
  const [selected, setSelected] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!selected) {
      setError('Please select an endpoint type')
      return
    }
    onNext(selected)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <div className="alert-icon">✕</div>
          <div className="alert-content">{error}</div>
        </div>
      )}

      <div className="endpoint-options">
        <label className="endpoint-card"
          onClick={() => { setSelected('Interface'); setError('') }}>
          <div className="endpoint-radio">
            <input
              type="radio"
              name="endpoint_type"
              value="Interface"
              checked={selected === 'Interface'}
              onChange={() => { }}
              className="hidden-radio"
            />
            <div className={`radio-circle ${selected === 'Interface' ? 'active' : ''}`}></div>
          </div>
          <div className="endpoint-icon">🔗</div>
          <div className="endpoint-content">
            <h3 className="endpoint-title">Interface Endpoint</h3>
            <p className="endpoint-desc">Powered by AWS PrivateLink. Use for EC2, STS, KMS, DynamoDB Streams, SNS, SQS, and other services.</p>
            <ul className="endpoint-features">
              <li>✓ Requires subnets and security groups</li>
              <li>✓ Can enable private DNS names</li>
              <li>✓ Supports cross-account access</li>
            </ul>
          </div>
          <div className="endpoint-arrow">→</div>
        </label>

        <label className="endpoint-card"
          onClick={() => { setSelected('Gateway'); setError('') }}>
          <div className="endpoint-radio">
            <input
              type="radio"
              name="endpoint_type"
              value="Gateway"
              checked={selected === 'Gateway'}
              onChange={() => { }}
              className="hidden-radio"
            />
            <div className={`radio-circle ${selected === 'Gateway' ? 'active' : ''}`}></div>
          </div>
          <div className="endpoint-icon">🚪</div>
          <div className="endpoint-content">
            <h3 className="endpoint-title">Gateway Endpoint</h3>
            <p className="endpoint-desc">Static routing through route tables. Use for S3 and DynamoDB only.</p>
            <ul className="endpoint-features">
              <li>✓ Uses route tables configuration</li>
              <li>✓ No data transfer charges</li>
              <li>✓ Simple setup</li>
            </ul>
          </div>
          <div className="endpoint-arrow">→</div>
        </label>
      </div>

      <div className="btn-group">
        <button type="submit" className="btn btn-primary btn-block">
          Let's Go <span style={{ marginLeft: '0.4rem' }}>→</span>
        </button>
      </div>
    </form>
  )
}

export default EndpointSelector
