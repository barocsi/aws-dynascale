import {DescribeServicesCommand, ECSClient, UpdateServiceCommand} from "@aws-sdk/client-ecs";
import pkg from './logutils.js';

const {logEnvironmentVariables, logProxyDetails, logServiceDetails} = pkg;

const CLUSTER_NAME = process.env.CLUSTER_NAME;
const SERVICE_NAME = process.env.SERVICE_NAME;
const REGION = process.env.REGION;
const FARGATE_SERVICE_ENDPOINT = process.env.FARGATE_SERVICE_ENDPOINT;
const REQUESTED_INSTANCES = parseInt(process.env.REQUESTED_INSTANCES, 10) || 1;

const ecs = new ECSClient({region: REGION ? REGION : 'eu-central-1'});

export async function handler(event) {
    logEnvironmentVariables({CLUSTER_NAME, SERVICE_NAME, FARGATE_SERVICE_ENDPOINT, REQUESTED_INSTANCES});

    // Define a base for CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', // Adjust this to match your security requirements
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST'
    };

    try {
        const describeResponse = await ecs.send(new DescribeServicesCommand({
            cluster: CLUSTER_NAME, services: [SERVICE_NAME],
        }));
        const service = describeResponse.services[0];
        const runningCount = service.runningCount;
        const pendingCount = service.pendingCount;

        logServiceDetails(service);

        // Check if the service is being started (i.e., tasks are pending)
        if (runningCount === 0 && pendingCount > 0) {
            // Service is being started, inform client to poll for status
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({message: '[AWS-Dynascale Scaleup] Service is starting, please poll for status.'}),
            };
        } else if (runningCount === 0 && pendingCount === 0) {
            // No running or pending tasks, scale up the service
            await ecs.send(new UpdateServiceCommand({
                cluster: CLUSTER_NAME, service: SERVICE_NAME, desiredCount: REQUESTED_INSTANCES,
            }));
            // Inform client to start polling after initiating scaling
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: JSON.stringify({message: '[AWS-Dynascale Scaleup] Service scaling initiated, please poll for status.'}),
            };
        }

        // Service is ready
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({message: '[AWS-Dynascale Scaleup] Service OK.'}),
        };

    } catch (error) {
        console.error('Error handling request:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({message: '[AWS-Dynascale Scaleup] Internal Server Error', error: error.toString()}),
        };
    }
}
