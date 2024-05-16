// logutils.js

/**
 * Logs the environment variables.
 * @param {Object} envVars - The environment variables to log.
 */
function logEnvironmentVariables(envVars) {
    console.log('[AWS Dynascale] Environment Variables:', envVars);
}

/**
 * Logs the ECS service details.
 * @param {Object} service - The ECS service details to log.
 */
function logServiceDetails(service) {
    console.log('[AWS Dynascale] ECS Service Details:', service);
}

/**
 * Logs the proxy request and response details.
 * @param {Object} request - The proxy request object.
 * @param {Object} response - The proxy response object.
 */
function logProxyDetails(request, response) {
    console.log('[AWS Dynascale] Proxy Request Details:', {
        method: request.httpMethod,
        path: request.path,
        body: request.body,
        headers: request.headers,
    });
    console.log('[AWS Dynascale] Proxy Response Details:', {
        statusCode: response.status,
        body: response.data,
        headers: response.headers,
    });
}

module.exports = {
    logEnvironmentVariables,
    logServiceDetails,
    logProxyDetails,
};
