/**
 * Utility functions for Jira API integration
 */

// Load environment variables
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL;
const JIRA_USER_PASSWORD = process.env.JIRA_USER_PASSWORD;

/**
 * Creates the basic authentication header value
 * @returns {string} Base64 encoded authentication string
 * @private
 */
const getAuthHeader = () => {
  return Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_USER_PASSWORD}`).toString('base64');
};

/**
 * Default headers for Jira API requests
 * @private
 */
const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

/**
 * Validates the required environment variables
 * @throws {Error} If any required environment variable is missing
 * @private
 */
const validateEnvironmentVars = () => {
  const required = ['JIRA_BASE_URL', 'JIRA_USER_EMAIL', 'JIRA_USER_PASSWORD'];
  const missing = required.filter(var_name => !process.env[var_name]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

/**
 * Creates a custom error object for API errors
 * @param {Response} response - Fetch Response object
 * @param {string} message - Custom error message
 * @returns {Error} Enhanced error object
 * @private
 */
const createApiError = (response, message) => {
  const error = new Error(message || `HTTP error! status: ${response.status}`);
  error.status = response.status;
  error.statusText = response.statusText;
  error.source = 'Jira API';
  return error;
};

/**
 * Validates and formats the API endpoint
 * @param {string} endpoint - The API endpoint to format
 * @returns {string} Formatted endpoint
 * @private
 */
const formatEndpoint = (endpoint) => {
  if (!endpoint) {
    throw new Error('Endpoint is required');
  }
  
  // Ensure endpoint starts with '/'
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

/**
 * Makes an HTTP request to the Jira API
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Request options
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.headers={}] - Additional headers
 * @param {Object} [options.body] - Request body
 * @param {Object} [options.queryParams={}] - Query parameters
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If the request fails
 */
async function makeJiraRequest(endpoint, options = {}) {
  try {
    // Validate environment variables before making request
    validateEnvironmentVars();

    const {
      method = 'GET',
      headers = {},
      body,
      queryParams = {}
    } = options;

    // Prepare request URL with query parameters
    const queryString = new URLSearchParams(queryParams).toString();
    const formattedEndpoint = formatEndpoint(endpoint);
    const url = `${JIRA_BASE_URL}${formattedEndpoint}${queryString ? `?${queryString}` : ''}`;

    // Prepare request options
    const requestOptions = {
      method,
      headers: {
        ...defaultHeaders,
        'Authorization': `Basic ${getAuthHeader()}`,
        ...headers
      }
    };

    // Add body if provided
    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    // Make the request
    const response = await fetch(url, requestOptions);

    // Handle non-OK responses
    if (!response.ok) {
      throw createApiError(response);
    }

    // Parse and return response
    return await response.json();
  } catch (error) {
    // Enhance error with source if not already set
    if (!error.source) {
      error.source = 'Jira API';
    }
    throw error;
  }
}

/**
 * Retries a failed request with exponential backoff
 * @param {Function} requestFn - Function that returns a promise
 * @param {number} [maxRetries=3] - Maximum number of retry attempts
 * @param {number} [initialDelay=1000] - Initial delay in milliseconds
 * @returns {Promise<any>} The result of the request
 */
async function withRetry(requestFn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's a client error (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

module.exports = {
  makeJiraRequest,
  withRetry
};