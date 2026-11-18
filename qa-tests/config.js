// Central configuration for the QA test suite.
// Override via environment variables when needed.
module.exports = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  // Unique suffix so repeated test runs don't collide on existing accounts.
  emailSuffix: process.env.TEST_EMAIL_SUFFIX || Date.now().toString(),
};