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
    const response = await fetch(`${JIRA_BASE_URL}/rest/api/3/project`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.source = 'Jira API';
      throw error;
    }

    return await response.json();
  } catch (error) {
    // Enhance error with additional context if not already set
    if (!error.source) {
      error.source = 'Jira API';
    }
    throw error;
  }
}

module.exports = {
  getProjects
};