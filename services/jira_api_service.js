const axios = require('axios');

// Load environment variables
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL;
const JIRA_USER_PASSWORD = process.env.JIRA_USER_PASSWORD;

/**
 * Fetches all projects from the Jira API
 * @returns {Promise<Array>} A promise that resolves to an array of Jira projects
 */
async function getProjects() {
  try {
    // Set up authentication for Jira API
    const auth = Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_USER_PASSWORD}`).toString('base64');
    
    // Make request to Jira API
    const response = await axios({
      method: 'GET',
      url: `${JIRA_BASE_URL}/rest/api/3/project`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    // Enhance error with additional context
    error.source = 'Jira API';
    throw error;
  }
}

module.exports = {
  getProjects
};