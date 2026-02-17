# AWS VPC Endpoint Generator Web Application - Detailed Artifact Specification

## Document Metadata
- **Artifact Title**: AWS VPC Endpoint Generator Web Application Specification
- **Version**: 1.0
- **Author**: Grok AI (based on user requirements)
- **Date**: February 13, 2026
- **Purpose**: This artifact provides a comprehensive, precise, and detailed specification for building a web application that allows users to configure AWS CLI credentials, select and customize VPC endpoints (Interface and Gateway types), generate a customized PowerShell script (.ps1) for endpoint creation, and execute it instantly in PowerShell. The spec covers functional requirements, user flow, architecture, UI/UX design, backend logic, security considerations, error handling, and implementation guidelines.
- **Scope**: Focuses on AWS VPC endpoints only (Interface for various services, Gateway for S3/DynamoDB). Assumes AWS CLI is installed on the user's machine. Does not include advanced features like multi-endpoint batching unless specified.
- **Assumptions**:
  - User has AWS CLI and PowerShell installed locally.
  - The web app runs locally or on a server accessible by the user (e.g., via browser).
  - Backend has access to execute system commands (e.g., for `aws configure` and PowerShell invocation).
  - No cloud deployment details; focus on core app logic.
- **References**:
  - AWS CLI Documentation: https://docs.aws.amazon.com/cli/latest/reference/ec2/create-vpc-endpoint.html
  - AWS VPC Endpoints: https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html
  - PowerShell Execution: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/invoke-expression

## 1. High-Level Overview
### Application Description
The web application is a user-friendly tool for generating and executing PowerShell scripts to create AWS VPC endpoints. It guides users through:
1. AWS CLI configuration (access key, secret key, session token if needed).
2. Selection of endpoint type (Interface or Gateway).
3. Input of required parameters (e.g., VPC ID, subnets, security groups for Interface; route tables for Gateway).
4. Customization of tags using a prefix-type-suffix format.
5. Generation of a .ps1 file containing the `aws ec2 create-vpc-endpoint` command.
6. Immediate execution of the .ps1 file in PowerShell upon user confirmation.

The app ensures validation, error prevention, and a seamless flow. It is built with a frontend (FE) for user interaction and a backend (BE) for command execution and file generation.

### Key Features
- **AWS Configure Integration**: Securely set AWS credentials via form, executed in backend terminal.
- **Endpoint Type Selection**: Branching UI based on Interface vs. Gateway.
- **Dynamic Parameter Collection**: Conditional fields (e.g., subnets/SG for Interface only; route tables for Gateway).
- **Tag Customization**: User provides prefix and suffix; app auto-generates middle (e.g., "ec2" for EC2 service).
- **Script Generation**: Outputs a .ps1 file with exact CLI command, including tags.
- **Instant Execution**: User-triggered run of .ps1 in PowerShell.
- **Validation & Error Handling**: Real-time checks for input formats (e.g., valid VPC IDs, region codes).
- **User Feedback**: Progress indicators, success/failure messages, logs.

### Non-Functional Requirements
- **Performance**: Response time < 2s for UI interactions; script execution < 10s (depending on AWS API).
- **Security**: Handle credentials securely (no storage; pass to `aws configure` only). Use HTTPS if web-hosted.
- **Usability**: Intuitive UI with tooltips, placeholders, and guided steps.
- **Compatibility**: Browser support (Chrome, Firefox, Edge); Windows OS for PowerShell.
- **Accessibility**: WCAG 2.1 compliant (e.g., ARIA labels, keyboard navigation).
- **Logging**: BE logs all actions; FE shows user-friendly errors.

## 2. User Flow
### Step-by-Step Workflow
1. **Landing Page / Authentication (Optional)**:
   - Welcome screen: "AWS VPC Endpoint Generator".
   - Button: "Start Configuration".
   - If hosted, optional login (not required per query).

2. **AWS Configure Step**:
   - Form: Inputs for AWS Access Key ID, Secret Access Key, Default Region (pre-filled with ap-southeast-1 if known), Output Format (default: json).
   - Optional: Session Token (for temporary credentials).
   - Validation: Access Key (20 chars, alphanumeric), Secret Key (40 chars, base64-like), Region (valid AWS region code e.g., "ap-southeast-1").
   - Submit: BE executes `aws configure` command in terminal (non-interactive mode using stdin or set-profile).
   - Feedback: Success message ("AWS CLI configured.") or error (e.g., "Invalid credentials format").
   - Next: Proceed to Endpoint Selection.

3. **Endpoint Type Selection**:
   - Radio buttons: "Interface Endpoint" or "Gateway Endpoint".
   - Description tooltips: "Interface for services like EC2, STS; Gateway for S3/DynamoDB only."
   - Submit: Branches to parameter collection based on selection.

4. **Parameter Collection (Branching)**:
   - **Common Fields** (both types):
     - Region: Dropdown (all AWS regions; default: user's configured default).
     - VPC ID: Text input (format: vpc-xxxxxxxxxxxxxxxxx; validation: regex ^vpc-[0-9a-f]{17}$).
     - Service Name: Dropdown for valid services.
       - Interface: List (e.g., com.amazonaws.[region].ec2, .sts, .kms, .elasticmapreduce, etc.; full list from AWS docs).
       - Gateway: Only "com.amazonaws.[region].s3" or "com.amazonaws.[region].dynamodb".
     - Tag Prefix: Text input (e.g., "toma-io-aws-sg-nss").
     - Tag Suffix: Text input (e.g., "-ep").
     - Auto-generated Tag Middle: Based on service short name (e.g., "ec2" for ec2 service, "s3" for S3).
     - Full Tag Example Display: Live preview (e.g., "toma-io-aws-sg-nss-ec2-ep").

   - **Interface-Specific Fields**:
     - Subnets: Multi-select dropdown or comma-separated input (format: subnet-xxxxxxxxxxxxxxxxx; validation: regex, min 1).
     - Security Groups: Multi-select or comma-separated (format: sg-xxxxxxxxxxxxxxxxx; validation: regex, min 1).
     - Private DNS Enabled: Checkbox (default: true; maps to --private-dns-enabled or --no-private-dns-enabled).

   - **Gateway-Specific Fields**:
     - Route Tables: Multi-select or comma-separated (format: rtb-xxxxxxxxxxxxxxxxx; validation: regex, min 1).
     - Option: Checkbox "Select All Route Tables (*)" – if checked, BE queries AWS for all RTs in VPC (using `aws ec2 describe-route-tables`) and includes them.

5. **Review & Confirm**:
   - Summary page: Display all inputs in a readable format (e.g., table or list).
   - Generated Command Preview: Show the raw `aws ec2 create-vpc-endpoint` command string.
   - Buttons: "Edit" (back to previous), "Generate .ps1" (downloads/saves file), "Generate & Run" (generates then executes).

6. **Script Generation & Execution**:
   - Generate: BE creates .ps1 file (e.g., "vpc-endpoint-script.ps1") in user's downloads or temp dir.
   - Run: Invoke PowerShell with `powershell.exe -File path/to/script.ps1` from BE (if local) or provide FE button to trigger local execution (e.g., via JS exec if permitted, but security note: browser restrictions).
   - Feedback: Execution logs/output in UI (success: endpoint ID; error: AWS error message).

### Edge Cases in Flow
- Invalid AWS Configure: Retry with error details.
- No Subnets/SG for Gateway: Hide irrelevant fields.
- Tag Errors: Validate prefix/suffix non-empty; ensure no invalid chars (e.g., no spaces in keys).
- Execution Failure: Capture stderr, display "Check AWS permissions" or "VPC not found".

## 3. Architecture
### Tech Stack
- **Frontend**: React.js (for dynamic forms, state management with Redux/Formik), Bootstrap/Tailwind for UI.
- **Backend**: Node.js with Express (for API endpoints), or Python Flask/Django (if preferring AWS integration).
- **Communication**: REST API (e.g., POST /configure, POST /generate-script).
- **File Handling**: BE generates .ps1; serves as download or saves locally.
- **Execution**: Child_process module in Node.js to run `aws` and `powershell.exe`.
- **Database**: None (stateless; session-based if multi-step).

### Components Diagram (Textual)
- FE: ConfigForm → EndpointSelector → ParamForm (conditional) → ReviewPage → Download/Run Button.
- BE: /api/configure (exec `aws configure set ...`) → /api/validate-inputs → /api/generate-ps1 (build command string, write file) → /api/run-ps1 (exec PowerShell).

### API Endpoints
- POST /api/configure: Body {accessKey, secretKey, region, outputFormat, sessionToken?} → Exec `aws configure`.
- POST /api/generate: Body {all params} → Return {ps1Content, filePath}.
- POST /api/run: Body {filePath} → Exec script, return {output, error}.

## 4. Detailed Implementation Guidelines
### AWS Configure Execution
- Non-interactive: Use `aws configure set aws_access_key_id <key> --profile default` (similar for others).
- Session Token: If provided, set `aws_session_token`.
- Security: Encrypt in transit; never store.

### Command Building Logic
- Base: `aws ec2 create-vpc-endpoint --vpc-id $vpcId --vpc-endpoint-type [Interface|Gateway] --service-name $service --region $region`
- Interface Add: `--subnet-ids $subnetsJoined --security-group-ids $sgJoined [--private-dns-enabled | --no-private-dns-enabled]`
- Gateway Add: `--route-table-ids $rtJoined` (if *, query `aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$vpcId" --query "RouteTables[].RouteTableId"`)
- Tags: `--tag-specifications "ResourceType=vpc-endpoint,Tags=[{Key=Name,Value=$prefix-$middle-$suffix}]"` (escape quotes for PS).
- .ps1 Content: Wrap in try-catch for error handling; add Write-Host for logs.

### Validation Rules
- VPC ID: Regex ^vpc-[0-9a-f]{8,17}$
- Subnet/SG/RT: Similar regex.
- Region: List of valid AWS regions (hardcoded array).
- Service Name: Validate against type (e.g., Gateway only s3/dynamodb).

### Security & Best Practices
- Credentials: Use HTTPS; avoid logging.
- Execution: Sanitize inputs to prevent injection (e.g., escape shell args).
- Permissions: App should run with least privilege; user must have EC2:CreateVpcEndpoint IAM perms.
- Testing: Unit tests for command builder; integration for flow.

### Potential Enhancements (Out of Scope)
- Multi-endpoint support (batch in one .ps1).
- Query AWS for existing VPCs/subnets (using `aws ec2 describe-vpcs`).

This artifact serves as the blueprint for development. Implement step-by-step, starting with BE command execution.