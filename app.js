const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Load environment variables
const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL;
const JIRA_USER_PASSWORD = process.env.JIRA_USER_PASSWORD;

// Check required environment variables
if (!JIRA_BASE_URL || !JIRA_USER_EMAIL || !JIRA_USER_PASSWORD) {
  console.error('Missing required environment variables: JIRA_BASE_URL, JIRA_USER_EMAIL, JIRA_USER_PASSWORD');
  process.exit(1);
}

const indexRouter = require('./routes/index');
const projectsRouter = require('./routes/projects');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/jira/projects', projectsRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Return JSON error for API routes
  if (req.path.startsWith('/jira')) {
    return res.status(err.status || 500).json({
      error: {
        message: err.message,
        status: err.status || 500
      }
    });
  }

  // Render the error page for web routes
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;