import {DescribeTasksCommand, ECSClient, ListTasksCommand, RunTaskCommand} from "@aws-sdk/client-ecs";
import pkg from './logutils.js';

const {logEnvironmentVariables} = pkg;

const CLUSTER_NAME = process.env.CLUSTER_NAME;
const REGION = process.env.REGION;
const TASK_DEFINITION_FAMILY = process.env.TASK_DEFINITION_FAMILY;
const SUBNET_IDS = process.env.SUBNET_IDS.split(','); // Split comma-separated subnet IDs into an array
const SECURITY_GROUP_IDS = process.env.SECURITY_GROUP_IDS ? process.env.SECURITY_GROUP_IDS.split(',') : []; // Optionally split security group IDs

const ecs = new ECSClient({region: REGION ? REGION : 'eu-central-1'});

export async function handler(event) {
    logEnvironmentVariables({CLUSTER_NAME, TASK_DEFINITION_FAMILY, SUBNET_IDS, SECURITY_GROUP_IDS});

    console.log(`[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] Starting task check...`);

    try {
        console.log(`[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] Listing tasks for cluster ${CLUSTER_NAME} and family ${TASK_DEFINITION_FAMILY}`);
        const listTasksResponse = await ecs.send(new ListTasksCommand({
            cluster: CLUSTER_NAME,
            family: TASK_DEFINITION_FAMILY,
        }));

        console.log(`[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] ListTasksCommand response: ${JSON.stringify(listTasksResponse)}`);

        if (listTasksResponse.taskArns && listTasksResponse.taskArns.length > 0) {
            console.log(`[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] Describing tasks: ${JSON.stringify(listTasksResponse.taskArns)}`);
            const describeTasksResponse = await ecs.send(new DescribeTasksCommand({
                cluster: CLUSTER_NAME,
                tasks: listTasksResponse.taskArns,
            }));

            console.log(`[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] DescribeTasksCommand response: ${JSON.stringify(describeTasksResponse)}`);
            const runningTasks = describeTasksResponse.tasks.filter(task =>
                task.lastStatus === 'RUNNING' || task.lastStatus === 'PROVISIONING' || task.lastStatus === 'PENDING'
            );

            if (runningTasks.length > 0) {
                console.log(`[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] Found running tasks, not starting a new one.`);
                return {
                    statusCode: 200,
                    body: JSON.stringify({message: `[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] Task is already running.`}),
                };
            }
        }

        console.log("No running tasks found, starting a new task.");
        const runTaskResponse = await ecs.send(new RunTaskCommand({
            cluster: CLUSTER_NAME,
            taskDefinition: TASK_DEFINITION_FAMILY,
            launchType: 'FARGATE',
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: SUBNET_IDS,
                    securityGroups: SECURITY_GROUP_IDS,
                    assignPublicIp: "ENABLED",
                },
            },
        }));

        console.log(`[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] RunTaskCommand response: ${JSON.stringify(runTaskResponse)}`);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] Task started immediately.`,
                taskId: runTaskResponse.tasks[0].taskArn,
            }),
        };
    } catch (error) {
        console.error(`Error checking or running task: ${error}`);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `[AWS-Dynascale RunTask ${TASK_DEFINITION_FAMILY}] Internal Server Error`,
                error: error.toString(),
            }),
        };
    }
}
