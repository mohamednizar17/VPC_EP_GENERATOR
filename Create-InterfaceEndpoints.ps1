# Create-InterfaceEndpoints.ps1

$ErrorActionPreference = "Stop"

$vpcId    = ""   # your VPC
$vpcName  = ""      # ← your prefix here
$subnets  = @("")
$sg       = ""
$region   = ""

$commonParams = "--vpc-id $vpcId --vpc-endpoint-type Interface --security-group-ids $sg --private-dns-enabled --region $region"

$services = @(
    @{ short = "ecr-api";   name = "ECR API";           service = "com.amazonaws.$region.ecr.api"   }
    @{ short = "ecr-dkr";   name = "ECR Docker";        service = "com.amazonaws.$region.ecr.dkr"   }
    @{ short = "sts";       name = "STS";               service = "com.amazonaws.$region.sts"       }
    @{ short = "ec2";       name = "EC2";               service = "com.amazonaws.$region.ec2"       }
    @{ short = "eks";       name = "EKS";               service = "com.amazonaws.$region.eks"       }
    @{ short = "eks-auth";  name = "EKS Auth";          service = "com.amazonaws.$region.eks-auth"  }
    @{ short = "kms";       name = "KMS";               service = "com.amazonaws.$region.kms"       }
    @{ short = "autoscaling"; name = "AutoScaling";     service = "com.amazonaws.$region.autoscaling" }
    @{ short = "logs";      name = "CloudWatch Logs";   service = "com.amazonaws.$region.logs"      }
    @{ short = "elb";       name = "ELB";               service = "com.amazonaws.$region.elasticloadbalancing" }
    # Add more if needed, e.g. EMR:
    # @{ short = "emr";    name = "EMR API";           service = "com.amazonaws.$region.elasticmapreduce" }
)

foreach ($svc in $services) {
    $endpointName = "$vpcName$($svc.short)-ep"   # e.g. toma-io-aws-sg-nss-ec2-ep

    Write-Host "Creating $($svc.name) endpoint with Name tag: $endpointName ..." -ForegroundColor Cyan

    $subnetArg = $subnets -join " "

    # Build the tag specification (JSON-like string for PowerShell)
    $tagSpec = "ResourceType=vpc-endpoint,Tags=[{Key=Name,Value=$endpointName}]"

    $cmd = "aws ec2 create-vpc-endpoint $commonParams --service-name $($svc.service) --subnet-ids $subnetArg --tag-specifications '$tagSpec'"

    try {
        Invoke-Expression $cmd | Out-Default
        Write-Host "Created successfully`n" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Finished creating endpoints with Name tags." -ForegroundColor Yellow
