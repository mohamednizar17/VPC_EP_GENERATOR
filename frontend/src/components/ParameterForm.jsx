import { useState, useEffect } from 'react'

function ParameterForm({ endpointType, onNext, initialData }) {
  const [formData, setFormData] = useState({
    vpc_id: initialData?.vpc_id || '',
    service_name: initialData?.service_name || '',
    tag_prefix: initialData?.tag_prefix || '',
    tag_suffix: initialData?.tag_suffix || '',
    subnets: initialData?.subnets || [],
    security_groups: initialData?.security_groups || [],
    private_dns_enabled: initialData?.private_dns_enabled !== false,
    route_tables: initialData?.route_tables || [],
    select_all_route_tables: initialData?.select_all_route_tables || false,
  })

  const [errors, setErrors] = useState({})

  // Get region from service name (will be dynamically set)
  const getRegion = () => {
    // Extract region from initialData or use default
    const region = initialData?.region || 'ap-southeast-1'
    return region
  }

  const region = getRegion()

  // All Interface VPC Endpoint Services with meaningful names (as displayed in AWS)
  const interfaceServices = [
    { arn: `com.amazonaws.${region}.ec2`, name: 'EC2 - Elastic Compute Cloud' },
    { arn: `com.amazonaws.${region}.ec2.api`, name: 'EC2 API - Elastic Compute Cloud API' },
    { arn: `com.amazonaws.${region}.sts`, name: 'STS - AWS Security Token Service' },
    { arn: `com.amazonaws.${region}.kms`, name: 'KMS - AWS Key Management Service' },
    { arn: `com.amazonaws.${region}.elasticmapreduce`, name: 'EMR - Amazon Elastic MapReduce' },
    { arn: `com.amazonaws.${region}.sns`, name: 'SNS - Amazon Simple Notification Service' },
    { arn: `com.amazonaws.${region}.sqs`, name: 'SQS - Amazon Simple Queue Service' },
    { arn: `com.amazonaws.${region}.kinesis-streams`, name: 'Kinesis Streams - Amazon Kinesis Data Streams' },
    { arn: `com.amazonaws.${region}.kinesis-firehose`, name: 'Kinesis Firehose - Amazon Kinesis Data Firehose' },
    { arn: `com.amazonaws.${region}.lambda`, name: 'Lambda - AWS Lambda' },
    { arn: `com.amazonaws.${region}.logs`, name: 'CloudWatch Logs - Amazon CloudWatch Logs' },
    { arn: `com.amazonaws.${region}.monitoring`, name: 'CloudWatch Metrics - Amazon CloudWatch' },
    { arn: `com.amazonaws.${region}.cloudwatch-events`, name: 'EventBridge - Amazon EventBridge' },
    { arn: `com.amazonaws.${region}.cloudformation`, name: 'CloudFormation - AWS CloudFormation' },
    { arn: `com.amazonaws.${region}.secretsmanager`, name: 'Secrets Manager - AWS Secrets Manager' },
    { arn: `com.amazonaws.${region}.ssm`, name: 'Systems Manager - AWS Systems Manager' },
    { arn: `com.amazonaws.${region}.ssmmessages`, name: 'Session Manager - AWS Systems Manager Session Manager' },
    { arn: `com.amazonaws.${region}.ec2messages`, name: 'EC2 Messages - EC2 Systems Manager Message Service' },
    { arn: `com.amazonaws.${region}.states`, name: 'Step Functions - AWS Step Functions' },
    { arn: `com.amazonaws.${region}.servicecatalog`, name: 'Service Catalog - AWS Service Catalog' },
    { arn: `com.amazonaws.${region}.elasticloadbalancing`, name: 'ELB - Elastic Load Balancing' },
    { arn: `com.amazonaws.${region}.elasticbeanstalk-health`, name: 'Elastic Beanstalk Health' },
    { arn: `com.amazonaws.${region}.elasticbeanstalk`, name: 'Elastic Beanstalk - AWS Elastic Beanstalk' },
    { arn: `com.amazonaws.${region}.autoscaling`, name: 'Auto Scaling - Amazon EC2 Auto Scaling' },
    { arn: `com.amazonaws.${region}.autoscaling-plans`, name: 'Auto Scaling Plans - AWS Auto Scaling' },
    { arn: `com.amazonaws.${region}.config`, name: 'Config - AWS Config' },
    { arn: `com.amazonaws.${region}.rds`, name: 'RDS - Amazon Relational Database Service' },
    { arn: `com.amazonaws.${region}.sagemaker.api`, name: 'SageMaker API - Amazon SageMaker API' },
    { arn: `com.amazonaws.${region}.sagemaker.runtime`, name: 'SageMaker Runtime - Amazon SageMaker Runtime' },
    { arn: `com.amazonaws.${region}.comprehend`, name: 'Comprehend - Amazon Comprehend' },
    { arn: `com.amazonaws.${region}.polly`, name: 'Polly - Amazon Polly' },
    { arn: `com.amazonaws.${region}.textract`, name: 'Textract - Amazon Textract' },
    { arn: `com.amazonaws.${region}.rekognition`, name: 'Rekognition - Amazon Rekognition' },
    { arn: `com.amazonaws.${region}.mediatailor`, name: 'MediaTailor - AWS Elemental MediaTailor' },
    { arn: `com.amazonaws.${region}.transfer`, name: 'Transfer - AWS Transfer Family' },
    { arn: `com.amazonaws.${region}.datasync`, name: 'DataSync - AWS DataSync' },
    { arn: `com.amazonaws.${region}.qldb`, name: 'QLDB - Amazon QLDB' },
    { arn: `com.amazonaws.${region}.events`, name: 'Events - Amazon EventBridge' },
    { arn: `com.amazonaws.${region}.imagebuilder`, name: 'Image Builder - EC2 Image Builder' },
    { arn: `com.amazonaws.${region}.kafka`, name: 'MSK - Amazon Managed Streaming for Apache Kafka' },
    { arn: `com.amazonaws.${region}.kafka-cluster`, name: 'Kafka Cluster - MSK Kafka Cluster' },
    { arn: `com.amazonaws.${region}.glue`, name: 'Glue - AWS Glue' },
    { arn: `com.amazonaws.${region}.databrew`, name: 'DataBrew - AWS Glue DataBrew' },
    { arn: `com.amazonaws.${region}.dataexchange`, name: 'Data Exchange - AWS Data Exchange' },
    { arn: `com.amazonaws.${region}.greengrass`, name: 'Greengrass - AWS IoT Greengrass' },
    { arn: `com.amazonaws.${region}.greengrass-connectors`, name: 'Greengrass Connectors - IoT Greengrass Connectors' },
    { arn: `com.amazonaws.${region}.appconfig`, name: 'AppConfig - AWS AppConfig' },
    { arn: `com.amazonaws.${region}.codebuild`, name: 'CodeBuild - AWS CodeBuild' },
    { arn: `com.amazonaws.${region}.codepipeline`, name: 'CodePipeline - AWS CodePipeline' },
    { arn: `com.amazonaws.${region}.codecommit`, name: 'CodeCommit - AWS CodeCommit' },
    { arn: `com.amazonaws.${region}.codedeploy`, name: 'CodeDeploy - AWS CodeDeploy' },
    { arn: `com.amazonaws.${region}.codestar`, name: 'CodeStar - AWS CodeStar' },
    { arn: `com.amazonaws.${region}.codecommit.git`, name: 'CodeCommit Git - Git repositories in CodeCommit' },
    { arn: `com.amazonaws.${region}.apicatalog`, name: 'API Gateway - Amazon API Gateway' },
    { arn: `com.amazonaws.${region}.iot-core`, name: 'IoT Core - AWS IoT Core' },
    { arn: `com.amazonaws.${region}.iot-jobs`, name: 'IoT Jobs - AWS IoT Jobs' },
    { arn: `com.amazonaws.${region}.iot-data`, name: 'IoT Data Plane - AWS IoT Data Plane' },
    { arn: `com.amazonaws.${region}.timestream`, name: 'Timestream - Amazon Timestream' },
    { arn: `com.amazonaws.${region}.msk`, name: 'MSK Control Plane - Amazon MSK Control Plane' },
    { arn: `com.amazonaws.${region}.elasticache`, name: 'ElastiCache - Amazon ElastiCache' },
    { arn: `com.amazonaws.${region}.backup`, name: 'Backup - AWS Backup' },
    { arn: `com.amazonaws.${region}.route53`, name: 'Route 53 - Amazon Route 53' },
    { arn: `com.amazonaws.${region}.acm-pca`, name: 'ACM PCA - AWS Private Certificate Authority' },
  ]

  // All Gateway VPC Endpoint Services
  const gatewayServices = [
    { arn: `com.amazonaws.${region}.s3`, name: 'S3 - Amazon Simple Storage Service' },
    { arn: `com.amazonaws.${region}.dynamodb`, name: 'DynamoDB - Amazon DynamoDB' },
  ]

  const services = endpointType === 'Interface' ? interfaceServices : gatewayServices

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleArrayInput = (field, value) => {
    // Split by comma and trim whitespace
    const items = value.split(',').map(item => item.trim()).filter(Boolean)
    setFormData(prev => ({
      ...prev,
      [field]: items,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validate required fields
    if (!formData.vpc_id) newErrors.vpc_id = 'VPC ID is required'
    if (!formData.service_name) newErrors.service_name = 'Service name is required'
    if (!formData.tag_prefix) newErrors.tag_prefix = 'Tag prefix is required'
    if (!formData.tag_suffix) newErrors.tag_suffix = 'Tag suffix is required'

    if (endpointType === 'Interface') {
      if (formData.subnets.length === 0) newErrors.subnets = 'At least one subnet is required'
      if (formData.security_groups.length === 0) newErrors.security_groups = 'At least one security group is required'
    } else if (endpointType === 'Gateway') {
      if (formData.route_tables.length === 0 && !formData.select_all_route_tables) {
        newErrors.route_tables = 'Specify route tables or select all'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 3: Configure Parameters</h2>
        <p className="text-sm text-gray-600">Enter details for {endpointType} endpoint</p>
      </div>

      {/* Common Fields */}
      <div>
        <label htmlFor="vpc_id" className="block text-sm font-medium text-gray-700 mb-1">
          VPC ID *
        </label>
        <input
          type="text"
          id="vpc_id"
          name="vpc_id"
          value={formData.vpc_id}
          onChange={handleChange}
          placeholder="vpc-xxxxxxxxxxxxxxxxx"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.vpc_id ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.vpc_id && <p className="text-red-600 text-sm mt-1">{errors.vpc_id}</p>}
      </div>

      <div>
        <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-1">
          Service Name * <span className="text-xs text-gray-500">({services.length} available)</span>
        </label>
        <select
          id="service_name"
          name="service_name"
          value={formData.service_name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.service_name ? 'border-red-500' : 'border-gray-300'}`}
        >
          <option value="">Select a service</option>
          {services.map(service => (
            <option key={service.arn} value={service.arn}>{service.name}</option>
          ))}
        </select>
        {errors.service_name && <p className="text-red-600 text-sm mt-1">{errors.service_name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="tag_prefix" className="block text-sm font-medium text-gray-700 mb-1">
            Tag Prefix *
          </label>
          <input
            type="text"
            id="tag_prefix"
            name="tag_prefix"
            value={formData.tag_prefix}
            onChange={handleChange}
            placeholder="e.g., toma-io-aws-sg-nss"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.tag_prefix ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.tag_prefix && <p className="text-red-600 text-sm mt-1">{errors.tag_prefix}</p>}
        </div>

        <div>
          <label htmlFor="tag_suffix" className="block text-sm font-medium text-gray-700 mb-1">
            Tag Suffix *
          </label>
          <input
            type="text"
            id="tag_suffix"
            name="tag_suffix"
            value={formData.tag_suffix}
            onChange={handleChange}
            placeholder="e.g., -ep"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.tag_suffix ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.tag_suffix && <p className="text-red-600 text-sm mt-1">{errors.tag_suffix}</p>}
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Generated Tag:</strong> {formData.tag_prefix}-{endpointType === 'Interface' ? 'service' : 'gateway'}-{formData.tag_suffix}
        </p>
      </div>

      {/* Interface-specific Fields */}
      {endpointType === 'Interface' && (
        <>
          <div>
            <label htmlFor="subnets" className="block text-sm font-medium text-gray-700 mb-1">
              Subnets (comma-separated) *
            </label>
            <input
              type="text"
              id="subnets"
              placeholder="subnet-xxx, subnet-yyy"
              value={formData.subnets.join(', ')}
              onChange={(e) => handleArrayInput('subnets', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.subnets ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.subnets && <p className="text-red-600 text-sm mt-1">{errors.subnets}</p>}
            {formData.subnets.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.subnets.map(subnet => (
                  <span key={subnet} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                    {subnet}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="security_groups" className="block text-sm font-medium text-gray-700 mb-1">
              Security Groups (comma-separated) *
            </label>
            <input
              type="text"
              id="security_groups"
              placeholder="sg-xxx, sg-yyy"
              value={formData.security_groups.join(', ')}
              onChange={(e) => handleArrayInput('security_groups', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.security_groups ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.security_groups && <p className="text-red-600 text-sm mt-1">{errors.security_groups}</p>}
            {formData.security_groups.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.security_groups.map(sg => (
                  <span key={sg} className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                    {sg}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="private_dns_enabled"
              name="private_dns_enabled"
              checked={formData.private_dns_enabled}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="private_dns_enabled" className="text-sm font-medium text-gray-700">
              Enable Private DNS Names
            </label>
          </div>
        </>
      )}

      {/* Gateway-specific Fields */}
      {endpointType === 'Gateway' && (
        <>
          <div>
            <label htmlFor="route_tables" className="block text-sm font-medium text-gray-700 mb-1">
              Route Tables (comma-separated)
            </label>
            <input
              type="text"
              id="route_tables"
              placeholder="rtb-xxx, rtb-yyy"
              value={formData.route_tables.join(', ')}
              onChange={(e) => handleArrayInput('route_tables', e.target.value)}
              disabled={formData.select_all_route_tables}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.route_tables ? 'border-red-500' : 'border-gray-300'} ${formData.select_all_route_tables ? 'bg-gray-100' : ''}`}
            />
            {errors.route_tables && <p className="text-red-600 text-sm mt-1">{errors.route_tables}</p>}
            {formData.route_tables.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.route_tables.map(rt => (
                  <span key={rt} className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm">
                    {rt}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="select_all_route_tables"
              name="select_all_route_tables"
              checked={formData.select_all_route_tables}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="select_all_route_tables" className="text-sm font-medium text-gray-700">
              Associate with all route tables in this VPC
            </label>
          </div>
        </>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition duration-200"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
        >
          Review »
        </button>
      </div>
    </form>
  )
}

export default ParameterForm
