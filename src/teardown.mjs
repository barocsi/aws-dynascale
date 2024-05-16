import {ECSClient, UpdateServiceCommand} from "@aws-sdk/client-ecs";

const CLUSTER_NAME = process.env.CLUSTER_NAME;
const SERVICE_NAME = process.env.SERVICE_NAME;
const REGION = process.env.REGION;
const ecs = new ECSClient({region: REGION ? REGION : 'eu-central-1'});

export async function handler(event) {
    try {
        await ecs.send(new UpdateServiceCommand({
            cluster: CLUSTER_NAME,
            service: SERVICE_NAME,
            desiredCount: 0,
        }));
        console.log('[AWS-Dynascale Teardown] Service scaled down successfully');
        return {
            statusCode: 200,
            body: JSON.stringify({message: 'Service scaled down successfully'}),
        };
    } catch (error) {
        console.error('[AWS-Dynascale Teardown] Error scaling down service:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: '[AWS-Dynascale Teardown] Failed to scale down service',
                error: error.toString()
            }),
        };
    }
}
