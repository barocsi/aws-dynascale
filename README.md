# AWS-Dynascale Project

AWS-Dynascale is a scalable AWS Lambda solution for managing ECS tasks and services dynamically. This project contains
three key Lambda functions:

1. **runtask**: Manages the running of ECS tasks.
2. **scaleup**: Scales up ECS services and manages the instance count.
3. **teardown**: Scales down ECS services to zero.

## Features

- Dynamically start ECS tasks if none are currently running.
- Scale up the number of instances for an ECS service and allow polling to monitor instance count status.
- Scale down an ECS service entirely.

## Prerequisites

Before you can use this project, you need to set up your AWS environment:

- AWS CLI installed and configured
- Serverless Framework installed
- Node.js and npm installed

## Setup

### AWS Credentials

1. Create AWS IAM roles and credentials necessary for accessing AWS Services.
2. Add your AWS credentials to your local AWS credentials file (`~/.aws/credentials`).

### Environment Configuration

Create a `.env` file at the root of your project and include the following environment variables:

```plaintext
CLUSTER_NAME=your-cluster-name
REGION=your-region
TASK_DEFINITION_FAMILY=your-task-definition-family
SUBNET_IDS=your,subnet,ids
SECURITY_GROUP_IDS=your,security,group,ids
SERVICE_NAME=your-service-name
REQUESTED_INSTANCES=desired-instance-count
FARGATE_SERVICE_ENDPOINT=your-fargate-service-endpoint
```

## Deployment

To deploy the AWS-Dynascale functions, follow these steps:

1. Create a `serverless.yml` file that defines the resources and permissions for your functions.
2. Set up a `.gitlab-ci.yml` file if you are using GitLab for CI/CD.
3. Configure Serverless with your AWS credentials:

   ```bash
   serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET
   ```

4. Deploy the services using the Serverless Framework:

   ```bash
   serverless deploy --verbose --region YOUR_REGION --aws-profile YOUR_AWS_PROFILE --config serverless.yml
   ```

5. To manually test a function, you can invoke it using AWS CLI:

   ```bash
   aws lambda invoke --function-name FUNCTION_NAME --cli-binary-format raw-in-base64-out --payload '{"httpMethod": "GET", "path": "/", "headers": {"Content-Type": "application/json"}, "body": "{}"}' response.json
   ```

## Functions

### 1. runtask

Checks for existing tasks within a specified ECS cluster and task definition. If no tasks are running, it starts a new
task.

### 2. scaleup

Monitors the status of a specified ECS service and scales up the number of instances based on the environment
configuration.

### 3. teardown

Reduces the number of running instances of a specified ECS service to zero, effectively stopping the service.

## Integration with API Gateway and CloudWatch

Dynamically scaling services can be integrated with AWS API Gateway for triggering via HTTP requests and with AWS
CloudWatch for automated scaling based on specific metrics or schedules.

## Contributing

Contributions to the AWS-Dynascale project are welcome. Please ensure that your code adheres to the existing style and
that all tests pass before submitting a pull request.

## License

Apache 2.0

For more information on each function's specific configuration and additional details, refer to the inline comments
within each function's code or the additional documentation provided in the project repository.
