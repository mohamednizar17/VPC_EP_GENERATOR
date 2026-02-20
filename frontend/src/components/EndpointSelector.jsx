import { useState } from 'react'

function EndpointSelector({ onNext, isLocked = false, onInputAttempt = () => {} }) {
  const [selectedEndpoints, setSelectedEndpoints] = useState({
    interface: false,
    gateway: false,
  })
  const [selectedServices, setSelectedServices] = useState({
    interface: [],
    gateway: [],
  })
  const [formData, setFormData] = useState({
    subnets: [],
    security_groups: [],
    route_tables: [],
    select_all_route_tables: false,
  })
  const [errors, setErrors] = useState({})
  const [expandedCategories, setExpandedCategories] = useState({})
  const [interfaceSearch, setInterfaceSearch] = useState('')
  const [gatewaySearch, setGatewaySearch] = useState('')

  const region = 'ap-southeast-1'

  // Comprehensive Interface Services organized by AWS console categories
  const interfaceServicesByCategory = {
    'Compute': [
      { arn: `com.amazonaws.${region}.ec2`, name: 'EC2' },
      { arn: `com.amazonaws.${region}.ec2.api`, name: 'EC2 API' },
      { arn: `com.amazonaws.${region}.lambda`, name: 'Lambda' },
    ],
    'Storage & CDN': [
      { arn: `com.amazonaws.${region}.s3`, name: 'S3 (Interface)' },
      { arn: `com.amazonaws.${region}.ebs`, name: 'EBS' },
      { arn: `com.amazonaws.${region}.efs`, name: 'EFS' },
    ],
    'Database': [
      { arn: `com.amazonaws.${region}.rds`, name: 'RDS' },
      { arn: `com.amazonaws.${region}.elasticache`, name: 'ElastiCache' },
      { arn: `com.amazonaws.${region}.redshift`, name: 'Amazon Redshift' },
      { arn: `com.amazonaws.${region}.redshift-data`, name: 'Redshift Data API' },
      { arn: `com.amazonaws.${region}.dynamodb`, name: 'DynamoDB (Interface)' },
      { arn: `com.amazonaws.${region}.qldb`, name: 'QLDB' },
    ],
    'Messaging & Streaming': [
      { arn: `com.amazonaws.${region}.sns`, name: 'SNS' },
      { arn: `com.amazonaws.${region}.sqs`, name: 'SQS' },
      { arn: `com.amazonaws.${region}.kinesis-streams`, name: 'Kinesis Data Streams' },
      { arn: `com.amazonaws.${region}.kinesis-firehose`, name: 'Kinesis Data Firehose' },
      { arn: `com.amazonaws.${region}.kafka`, name: 'MSK' },
      { arn: `com.amazonaws.${region}.kafka-cluster`, name: 'MSK Cluster' },
    ],
    'Analytics': [
      { arn: `com.amazonaws.${region}.athena`, name: 'Athena' },
      { arn: `com.amazonaws.${region}.emr`, name: 'EMR' },
      { arn: `com.amazonaws.${region}.elasticmapreduce`, name: 'EMR (Legacy)' },
      { arn: `com.amazonaws.${region}.glue`, name: 'Glue' },
      { arn: `com.amazonaws.${region}.databrew`, name: 'Glue DataBrew' },
      { arn: `com.amazonaws.${region}.dataexchange`, name: 'AWS Data Exchange' },
    ],
    'Security, Identity & Compliance': [
      { arn: `com.amazonaws.${region}.kms`, name: 'KMS' },
      { arn: `com.amazonaws.${region}.sts`, name: 'STS' },
      { arn: `com.amazonaws.${region}.secretsmanager`, name: 'Secrets Manager' },
      { arn: `com.amazonaws.${region}.acm-pca`, name: 'ACM PCA' },
    ],
    'Management & Governance': [
      { arn: `com.amazonaws.${region}.ssm`, name: 'Systems Manager' },
      { arn: `com.amazonaws.${region}.ssmmessages`, name: 'Session Manager' },
      { arn: `com.amazonaws.${region}.ec2messages`, name: 'EC2 Systems Manager Messages' },
      { arn: `com.amazonaws.${region}.monitoring`, name: 'CloudWatch' },
      { arn: `com.amazonaws.${region}.logs`, name: 'CloudWatch Logs' },
      { arn: `com.amazonaws.${region}.cloudwatch-events`, name: 'EventBridge' },
      { arn: `com.amazonaws.${region}.events`, name: 'EventBridge (Events)' },
      { arn: `com.amazonaws.${region}.cloudformation`, name: 'CloudFormation' },
      { arn: `com.amazonaws.${region}.config`, name: 'Config' },
      { arn: `com.amazonaws.${region}.backup`, name: 'AWS Backup' },
      { arn: `com.amazonaws.${region}.appconfig`, name: 'AppConfig' },
    ],
    'Developer Tools': [
      { arn: `com.amazonaws.${region}.codecommit`, name: 'CodeCommit' },
      { arn: `com.amazonaws.${region}.codecommit.git`, name: 'CodeCommit Git' },
      { arn: `com.amazonaws.${region}.codepipeline`, name: 'CodePipeline' },
      { arn: `com.amazonaws.${region}.codebuild`, name: 'CodeBuild' },
      { arn: `com.amazonaws.${region}.codedeploy`, name: 'CodeDeploy' },
      { arn: `com.amazonaws.${region}.codestar`, name: 'CodeStar' },
    ],
    'Integration & Orchestration': [
      { arn: `com.amazonaws.${region}.states`, name: 'Step Functions' },
      { arn: `com.amazonaws.${region}.apicatalog`, name: 'API Gateway' },
    ],
    'Machine Learning': [
      { arn: `com.amazonaws.${region}.sagemaker.api`, name: 'SageMaker API' },
      { arn: `com.amazonaws.${region}.sagemaker.runtime`, name: 'SageMaker Runtime' },
      { arn: `com.amazonaws.${region}.comprehend`, name: 'Comprehend' },
      { arn: `com.amazonaws.${region}.polly`, name: 'Polly' },
      { arn: `com.amazonaws.${region}.rekognition`, name: 'Rekognition' },
      { arn: `com.amazonaws.${region}.textract`, name: 'Textract' },
    ],
    'IoT & Edge': [
      { arn: `com.amazonaws.${region}.iot-core`, name: 'IoT Core' },
      { arn: `com.amazonaws.${region}.iot-jobs`, name: 'IoT Jobs' },
      { arn: `com.amazonaws.${region}.iot-data`, name: 'IoT Data Plane' },
      { arn: `com.amazonaws.${region}.greengrass`, name: 'IoT Greengrass' },
      { arn: `com.amazonaws.${region}.greengrass-connectors`, name: 'Greengrass Connectors' },
    ],
    'Media Services': [
      { arn: `com.amazonaws.${region}.mediatailor`, name: 'Elemental MediaTailor' },
      { arn: `com.amazonaws.${region}.transfer`, name: 'Transfer Family' },
    ],
    'Migration & Disaster Recovery': [
      { arn: `com.amazonaws.${region}.datasync`, name: 'DataSync' },
    ],
    'Network & Content Delivery': [
      { arn: `com.amazonaws.${region}.elasticloadbalancing`, name: 'Elastic Load Balancing' },
      { arn: `com.amazonaws.${region}.route53`, name: 'Route 53' },
      { arn: `com.amazonaws.${region}.appsync`, name: 'AppSync' },
    ],
    'Container Services': [
      { arn: `com.amazonaws.${region}.ecr.api`, name: 'ECR API' },
      { arn: `com.amazonaws.${region}.ecr.dkr`, name: 'ECR DKR' },
      { arn: `com.amazonaws.${region}.ecs-telemetry`, name: 'ECS Telemetry' },
    ],
    'Application Services': [
      { arn: `com.amazonaws.${region}.elasticbeanstalk`, name: 'Elastic Beanstalk' },
      { arn: `com.amazonaws.${region}.elasticbeanstalk-health`, name: 'Elastic Beanstalk Health' },
      { arn: `com.amazonaws.${region}.autoscaling`, name: 'Auto Scaling' },
      { arn: `com.amazonaws.${region}.autoscaling-plans`, name: 'Auto Scaling Plans' },
      { arn: `com.amazonaws.${region}.servicecatalog`, name: 'Service Catalog' },
    ],
    'Frontend Web & Mobile': [
      { arn: `com.amazonaws.${region}.ampl`, name: 'AWS Amplify' },
    ],
  }

  // Gateway Services
  const gatewayServices = [
    { arn: `com.amazonaws.${region}.s3`, name: 'Amazon S3' },
    { arn: `com.amazonaws.${region}.dynamodb`, name: 'Amazon DynamoDB' },
  ]

  // Flatten interface services for easier lookup
  const allInterfaceServices = Object.values(interfaceServicesByCategory).flat()

  const handleEndpointToggle = (type) => {
    if (isLocked) {
      onInputAttempt()
      return
    }
    setSelectedEndpoints(prev => ({
      ...prev,
      [type]: !prev[type],
    }))
    // Clear services when toggling endpoint type
    setSelectedServices(prev => ({
      ...prev,
      [type]: [],
    }))
    setErrors({})
  }

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleServiceToggle = (type, serviceArn) => {
    if (isLocked) {
      onInputAttempt()
      return
    }
    setSelectedServices(prev => {
      const services = prev[type]
      if (services.includes(serviceArn)) {
        return {
          ...prev,
          [type]: services.filter(s => s !== serviceArn),
        }
      } else {
        return {
          ...prev,
          [type]: [...services, serviceArn],
        }
      }
    })
    setErrors({})
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

  const handleCheckboxChange = (e) => {
    if (isLocked) {
      onInputAttempt()
      return
    }
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLocked) {
      onInputAttempt()
      return
    }

    const newErrors = {}
    const hasInterface = selectedEndpoints.interface
    const hasGateway = selectedEndpoints.gateway

    if (!hasInterface && !hasGateway) {
      newErrors.endpoints = 'Please select at least one endpoint type'
    }

    if (hasInterface && selectedServices.interface.length === 0) {
      newErrors.interfaceServices = 'Select at least one Interface service'
    }

    if (hasGateway && selectedServices.gateway.length === 0) {
      newErrors.gatewayServices = 'Select at least one Gateway service'
    }

    if (hasInterface) {
      if (formData.subnets.length === 0) newErrors.subnets = 'At least one subnet is required'
      if (formData.security_groups.length === 0) newErrors.security_groups = 'At least one security group is required'
    }

    if (hasGateway) {
      if (formData.route_tables.length === 0 && !formData.select_all_route_tables) {
        newErrors.route_tables = 'Specify route tables or select all'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Determine endpoint type
    let endpointType = ''
    if (hasInterface && hasGateway) {
      endpointType = 'Both'
    } else if (hasInterface) {
      endpointType = 'Interface'
    } else {
      endpointType = 'Gateway'
    }

    onNext({
      endpoint_types: selectedEndpoints,
      endpointType: endpointType,
      selected_services: selectedServices,
      ...formData,
    })
  }

  const hasInterface = selectedEndpoints.interface
  const hasGateway = selectedEndpoints.gateway
  const hasSelection = hasInterface || hasGateway

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Errors */}
      {errors.endpoints && (
        <div className="alert alert-error">
          <div className="alert-icon">✕</div>
          <div className="alert-content">{errors.endpoints}</div>
        </div>
      )}

      {/* Step Title */}
      <div className="ep-step-header">
        <h2>Select VPC Endpoints to Deploy</h2>
        <p>Choose endpoint types and the services you want to create</p>
      </div>

      {/* Endpoint Type Selection */}
      <div className="endpoint-selector-grid">
        <label className={`endpoint-option-card ${hasInterface ? 'selected' : ''}`}>
          <input
            type="checkbox"
            name="interface"
            checked={hasInterface}
            onChange={() => handleEndpointToggle('interface')}
            className="hidden-checkbox"
          />
          <div className="endpoint-option-content">
            <div className="endpoint-option-header">
              <div className="endpoint-option-icon">🔗</div>
              <h3>Interface Endpoint</h3>
            </div>
            <p className="endpoint-option-desc">Powered by AWS PrivateLink for 40+ services</p>
            <ul className="endpoint-option-features">
              <li>Multiple services available</li>
              <li>Requires subnets & security groups</li>
              <li>All use same config</li>
            </ul>
            <div className={`endpoint-option-badge ${hasInterface ? 'active' : ''}`}>
              {hasInterface ? '✓ Selected' : 'Select'}
            </div>
          </div>
        </label>

        <label className={`endpoint-option-card ${hasGateway ? 'selected' : ''}`}>
          <input
            type="checkbox"
            name="gateway"
            checked={hasGateway}
            onChange={() => handleEndpointToggle('gateway')}
            className="hidden-checkbox"
          />
          <div className="endpoint-option-content">
            <div className="endpoint-option-header">
              <div className="endpoint-option-icon">🚪</div>
              <h3>Gateway Endpoint</h3>
            </div>
            <p className="endpoint-option-desc">S3 and DynamoDB with route tables</p>
            <ul className="endpoint-option-features">
              <li>Limited to 2 services</li>
              <li>Uses route tables configuration</li>
              <li>All use same route tables</li>
            </ul>
            <div className={`endpoint-option-badge ${hasGateway ? 'active' : ''}`}>
              {hasGateway ? '✓ Selected' : 'Select'}
            </div>
          </div>
        </label>
      </div>

      {/* Service Selection */}
      {hasSelection && (
        <div className="ep-configuration-section">
          <div className="ep-config-header">
            <h3>Select Services</h3>
            <p>Choose the services you want to create endpoints for</p>
          </div>

          {/* Interface Services */}
          {hasInterface && (
            <div className="ep-config-group">
              <div className="ep-config-title">
                <span className="ep-config-icon">🔗</span>
                <h4>Interface Services (Select Multiple)</h4>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.3rem' }}>
                  Total: {allInterfaceServices.length} services available (Selected: {selectedServices.interface.length})
                </p>
              </div>

              {errors.interfaceServices && (
                <p className="form-error" style={{ marginBottom: '1rem' }}>{errors.interfaceServices}</p>
              )}

              {/* Search Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search services (e.g., EC2, RDS, Lambda...)"
                    value={interfaceSearch}
                    onChange={(e) => setInterfaceSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: '1px solid #d0d0d0',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      boxShadow: interfaceSearch ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d0d0d0'}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.1rem',
                    pointerEvents: 'none',
                  }}>🔍</span>
                </div>
              </div>

              {/* Service Categories - Filtered */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(interfaceServicesByCategory).map(([category, services]) => {
                  // Filter services based on search query
                  const filteredServices = services.filter(service =>
                    service.name.toLowerCase().includes(interfaceSearch.toLowerCase())
                  )

                  // Skip category if no services match
                  if (filteredServices.length === 0 && interfaceSearch) {
                    return null
                  }

                  return (
                    <div key={category} style={{ border: '1px solid #e0e0e0', borderRadius: '0.375rem', overflow: 'hidden' }}>
                      {/* Category Header */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: expandedCategories[category] ? '#f0f7ff' : '#fafafa',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.95rem',
                          fontWeight: '500',
                          color: '#333',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = expandedCategories[category] ? '#e8f0ff' : '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = expandedCategories[category] ? '#f0f7ff' : '#fafafa'}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem' }}>
                            {expandedCategories[category] ? '▼' : '▶'}
                          </span>
                          <span>{category}</span>
                          <span style={{ fontSize: '0.85rem', color: '#999' }}>({interfaceSearch ? filteredServices.length : services.length})</span>
                        </span>
                      </button>

                      {/* Category Services */}
                      {expandedCategories[category] && (
                        <div style={{ padding: '1rem', backgroundColor: '#fff', borderTop: '1px solid #e0e0e0' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {(interfaceSearch ? filteredServices : services).map(service => (
                              <label key={service.arn} className="service-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={selectedServices.interface.includes(service.arn)}
                                  onChange={() => handleServiceToggle('interface', service.arn)}
                                  disabled={isLocked}
                                  className={isLocked ? 'locked' : ''}
                                />
                                <span className="service-name">{service.name}</span>
                              </label>
                            ))}
                          </div>
                          {interfaceSearch && filteredServices.length === 0 && (
                            <p style={{ color: '#999', textAlign: 'center', padding: '1rem' }}>No services match your search</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {interfaceSearch && Object.entries(interfaceServicesByCategory).every(([_, services]) =>
                services.filter(s => s.name.toLowerCase().includes(interfaceSearch.toLowerCase())).length === 0
              ) && (
                <div style={{ padding: '1rem', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.375rem', color: '#92400e' }}>
                  No services found matching "{interfaceSearch}"
                </div>
              )}

              {selectedServices.interface.length > 0 && (
                <div className="ep-tags" style={{ marginTop: '1rem' }}>
                  {selectedServices.interface.map(arn => {
                    const service = allInterfaceServices.find(s => s.arn === arn)
                    return (
                      <span key={arn} className="ep-tag">
                        {service?.name}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Gateway Services */}
          {hasGateway && (
            <div className="ep-config-group">
              <div className="ep-config-title">
                <span className="ep-config-icon">🚪</span>
                <h4>Gateway Services (Select Multiple)</h4>
                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.3rem' }}>
                  Total: {gatewayServices.length} services available (Selected: {selectedServices.gateway.length})
                </p>
              </div>

              {errors.gatewayServices && (
                <p className="form-error" style={{ marginBottom: '1rem' }}>{errors.gatewayServices}</p>
              )}

              {/* Search Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search gateway services (e.g., S3, DynamoDB...)"
                    value={gatewaySearch}
                    onChange={(e) => setGatewaySearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: '1px solid #d0d0d0',
                      borderRadius: '0.375rem',
                      fontSize: '0.95rem',
                      boxShadow: gatewaySearch ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d0d0d0'}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '1.1rem',
                    pointerEvents: 'none',
                  }}></span>
                </div>
              </div>

              {/* Filtered Gateway Services */}
              <div className="services-grid">
                {gatewayServices
                  .filter(service => service.name.toLowerCase().includes(gatewaySearch.toLowerCase()))
                  .map(service => (
                    <label key={service.arn} className="service-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedServices.gateway.includes(service.arn)}
                        onChange={() => handleServiceToggle('gateway', service.arn)}
                        disabled={isLocked}
                        className={isLocked ? 'locked' : ''}
                      />
                      <span className="service-name">{service.name}</span>
                    </label>
                  ))}
              </div>

              {gatewaySearch && gatewayServices.filter(s => s.name.toLowerCase().includes(gatewaySearch.toLowerCase())).length === 0 && (
                <div style={{ padding: '1rem', backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.375rem', color: '#92400e' }}>
                  No services found matching "{gatewaySearch}"
                </div>
              )}

              {selectedServices.gateway.length > 0 && (
                <div className="ep-tags" style={{ marginTop: '1rem' }}>
                  {selectedServices.gateway.map(arn => {
                    const service = gatewayServices.find(s => s.arn === arn)
                    return (
                      <span key={arn} className="ep-tag rt">
                        {service?.name}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Configuration Parameters */}
          <div className="ep-configuration-section" style={{ marginTop: '1.5rem' }}>
            <div className="ep-config-header">
              <h3>Configure Resources</h3>
              <p>All selected services will use these same resources</p>
            </div>

            {/* Interface Configuration */}
            {hasInterface && (
              <div className="ep-config-group">
                <div className="ep-config-title">
                  <span className="ep-config-icon">🔗</span>
                  <h4>Interface Configuration</h4>
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
              </div>
            )}

            {/* Gateway Configuration */}
            {hasGateway && (
              <div className="ep-config-group">
                <div className="ep-config-title">
                  <span className="ep-config-icon">🚪</span>
                  <h4>Gateway Configuration</h4>
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
                      onChange={handleCheckboxChange}
                      disabled={isLocked}
                      className={isLocked ? 'locked' : ''}
                    />
                    <span>Associate with all route tables in VPC</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {hasSelection && (
        <div className="ep-summary-box">
          <h4>Summary</h4>
          <div className="ep-summary-items">
            {hasInterface && (
              <div className="ep-summary-item">
                🔗 Interface: {selectedServices.interface.length} service{selectedServices.interface.length > 1 ? 's' : ''} with shared Subnet & SG
              </div>
            )}
            {hasGateway && (
              <div className="ep-summary-item">
                🚪 Gateway: {selectedServices.gateway.length} service{selectedServices.gateway.length > 1 ? 's' : ''} with shared Route Table
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="btn-group">
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={!hasSelection}
        >
          Continue <span style={{ marginLeft: '0.4rem' }}>→</span>
        </button>
      </div>
    </form>
  )
}

export default EndpointSelector
