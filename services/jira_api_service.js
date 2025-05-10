const { makeJiraRequest } = require('./utils');

/**
 * Fetches all projects from the Jira API
 * @returns {Promise<Array>} A promise that resolves to an array of Jira projects
 */
async function getProjects() {
  return makeJiraRequest('/rest/api/3/project');
}

/**
 * Fetches a specific project from the Jira API by its ID
 * @param {string} projectId - The ID of the project to fetch
 * @returns {Promise<Object>} A promise that resolves to a Jira project object
 */
async function getProjectById(projectId) {
  return makeJiraRequest(`/rest/api/3/project/${projectId}`);
}

module.exports = {
  getProjects,
  getProjectById
};