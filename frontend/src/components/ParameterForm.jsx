import { useState } from 'react'

function ParameterForm({ endpointType, onNext, initialData, isLocked = false, onInputAttempt = () => {} }) {
  const [formData, setFormData] = useState({
    vpc_id: initialData?.vpc_id || '',
    tag_prefix: initialData?.tag_prefix || '',
    tag_suffix: initialData?.tag_suffix || '',
    subnets: initialData?.subnets || [],
    security_groups: initialData?.security_groups || [],
    private_dns_enabled: initialData?.private_dns_enabled !== false,
    route_tables: initialData?.route_tables || [],
    select_all_route_tables: initialData?.select_all_route_tables || false,
  })

  const [errors, setErrors] = useState({})

  // Get selected services
  const selectedInterfaceServices = initialData?.selected_services?.interface || []
  const selectedGatewayServices = initialData?.selected_services?.gateway || []

  const handleChange = (e) => {
    if (isLocked) {
      onInputAttempt()
      return
    }
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleArrayInput = (field, value) => {
    if (isLocked) {
      onInputAttempt()
      return
    }
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    setFormData(prev => ({
      ...prev,
      [field]: items,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validate VPC ID
    if (!formData.vpc_id) newErrors.vpc_id = 'VPC ID is required'

    // Validate Interface services if selected
    if (selectedInterfaceServices.length > 0) {
      if (formData.subnets.length === 0) newErrors.subnets = 'At least one subnet is required'
      if (formData.security_groups.length === 0) newErrors.security_groups = 'At least one security group is required'
    }

    // Validate Gateway services if selected
    if (selectedGatewayServices.length > 0) {
      if (formData.route_tables.length === 0 && !formData.select_all_route_tables) {
        newErrors.route_tables = 'Specify route tables or select all'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onNext({
      ...formData,
      service_names: [...selectedInterfaceServices, ...selectedGatewayServices],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 3: Configure Endpoint Parameters</h2>
        <p className="text-sm text-gray-600">Configure resources for your selected services</p>
      </div>

      {/* Selected Services Summary */}
      {(selectedInterfaceServices.length > 0 || selectedGatewayServices.length > 0) && (
        <div className="ep-summary-box">
          <h4>Selected Services to Create</h4>
          <div className="ep-summary-items">
            {selectedInterfaceServices.length > 0 && (
              <div className="ep-summary-item">
                🔗 Interface: {selectedInterfaceServices.length} service{selectedInterfaceServices.length > 1 ? 's' : ''}
              </div>
            )}
            {selectedGatewayServices.length > 0 && (
              <div className="ep-summary-item">
                🚪 Gateway: {selectedGatewayServices.length} service{selectedGatewayServices.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VPC ID - Common Field */}
      <div className="form-group">
        <label className="form-label">VPC ID *</label>
        <input
          type="text"
          id="vpc_id"
          name="vpc_id"
          disabled={isLocked}
          value={formData.vpc_id}
          onChange={handleChange}
          placeholder="vpc-xxxxxxxxxxxxxxxxx"
          className={`form-input ${errors.vpc_id ? 'error' : ''} ${isLocked ? 'locked' : ''}`}
        />
        {errors.vpc_id && <p className="form-error">{errors.vpc_id}</p>}
      </div>

      {/* Tag Fields */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Tag Prefix (Optional)</label>
          <input
            type="text"
            id="tag_prefix"
            name="tag_prefix"
            disabled={isLocked}
            value={formData.tag_prefix}
            onChange={handleChange}
            placeholder="e.g., toma-io-aws"
            className={`form-input ${errors.tag_prefix ? 'error' : ''} ${isLocked ? 'locked' : ''}`}
          />
          {errors.tag_prefix && <p className="form-error">{errors.tag_prefix}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Tag Suffix (Optional)</label>
          <input
            type="text"
            id="tag_suffix"
            name="tag_suffix"
            disabled={isLocked}
            value={formData.tag_suffix}
            onChange={handleChange}
            placeholder="e.g., -ep"
            className={`form-input ${errors.tag_suffix ? 'error' : ''} ${isLocked ? 'locked' : ''}`}
          />
          {errors.tag_suffix && <p className="form-error">{errors.tag_suffix}</p>}
        </div>
      </div>

      {/* Interface Services Configuration */}
      {selectedInterfaceServices.length > 0 && (
        <div className="ep-config-group">
          <div className="ep-config-title">
            <span className="ep-config-icon">🔗</span>
            <h4>Interface Configuration (for all selected services)</h4>
          </div>

          <div className="form-group">
            <label className="form-label">
              Subnets (comma-separated) *
            </label>
            <input
              type="text"
              disabled={isLocked}
              placeholder="subnet-xxx, subnet-yyy, subnet-zzz"
              value={formData.subnets.join(', ')}
              onChange={(e) => handleArrayInput('subnets', e.target.value)}
              className={`form-input ${errors.subnets ? 'error' : ''} ${isLocked ? 'locked' : ''}`}
            />
            {errors.subnets && <p className="form-error">{errors.subnets}</p>}
            {formData.subnets.length > 0 && (
              <div className="ep-tags">
                {formData.subnets.map(subnet => (
                  <span key={subnet} className="ep-tag">
                    {subnet}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Security Groups (comma-separated) *
            </label>
            <input
              type="text"
              disabled={isLocked}
              placeholder="sg-xxx, sg-yyy, sg-zzz"
              value={formData.security_groups.join(', ')}
              onChange={(e) => handleArrayInput('security_groups', e.target.value)}
              className={`form-input ${errors.security_groups ? 'error' : ''} ${isLocked ? 'locked' : ''}`}
            />
            {errors.security_groups && <p className="form-error">{errors.security_groups}</p>}
            {formData.security_groups.length > 0 && (
              <div className="ep-tags">
                {formData.security_groups.map(sg => (
                  <span key={sg} className="ep-tag sg">
                    {sg}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                id="private_dns_enabled"
                name="private_dns_enabled"
                checked={formData.private_dns_enabled}
                onChange={handleChange}
                disabled={isLocked}
              />
              <span>Enable Private DNS Names</span>
            </label>
          </div>
        </div>
      )}

      {/* Gateway Services Configuration */}
      {selectedGatewayServices.length > 0 && (
        <div className="ep-config-group">
          <div className="ep-config-title">
            <span className="ep-config-icon">🚪</span>
            <h4>Gateway Configuration (for all selected services)</h4>
          </div>

          <div className="form-group">
            <label className="form-label">
              Route Tables (comma-separated)
            </label>
            <input
              type="text"
              disabled={isLocked || formData.select_all_route_tables}
              placeholder="rtb-xxx, rtb-yyy, rtb-zzz"
              value={formData.route_tables.join(', ')}
              onChange={(e) => handleArrayInput('route_tables', e.target.value)}
              className={`form-input ${errors.route_tables ? 'error' : ''} ${isLocked ? 'locked' : ''} ${formData.select_all_route_tables ? 'disabled-by-option' : ''}`}
            />
            {errors.route_tables && <p className="form-error">{errors.route_tables}</p>}
            {formData.route_tables.length > 0 && (
              <div className="ep-tags">
                {formData.route_tables.map(rt => (
                  <span key={rt} className="ep-tag rt">
                    {rt}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="select_all_route_tables"
                checked={formData.select_all_route_tables}
                onChange={handleChange}
                disabled={isLocked}
              />
              <span>Associate with all route tables in VPC</span>
            </label>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="btn-group">
        <button type="submit" className="btn btn-primary btn-block">
          Continue to Review <span style={{ marginLeft: '0.4rem' }}>→</span>
        </button>
      </div>
    </form>
  )
}

export default ParameterForm
