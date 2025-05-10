const express = require('express');
const router = express.Router();
const jiraService = require('../services/jira_api_service');

/**
 * GET /jira/projects
 * Retrieves all projects from Jira
 */
router.get('/', async (req, res) => {
  try {
    // Get projects from Jira API
    const projects = await jiraService.getProjects();
    
    // Return the raw Jira API response to the client
    res.json(projects);
  } catch (error) {
    // Log the error
    console.error('Error fetching projects from Jira:', error.message);
    
    // Determine appropriate status code
    const statusCode = error.response ? error.response.status : 500;
    
    // Send an error response to a client
    res.status(statusCode).json({
      error: {
        message: error.message || 'Failed to fetch Jira projects',
        status: statusCode
      }
    });
  }
});

/**
 * GET /jira/projects/:id
 * Retrieves a specific project from Jira by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Get project from Jira API
    const project = await jiraService.getProjectById(projectId);
    
    // Return the raw Jira API response to the client
    res.json(project);
  } catch (error) {
    // Log the error
    console.error(`Error fetching project ${req.params.id} from Jira:`, error.message);
    
    // Determine appropriate status code
    const statusCode = error.status || 500;
    
    // Send an error response to the client
    res.status(statusCode).json({
      error: {
        message: error.message || `Failed to fetch Jira project with ID: ${req.params.id}`,
        status: statusCode
      }
    });
  }
});

module.exports = router;