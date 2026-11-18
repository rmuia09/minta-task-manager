// Global test setup: verify the API is reachable before running the suite.
const { api } = require('./helpers');

beforeAll(async () => {
  try {
    await api.get('/api/tasks');
  } catch (err) {
    // A connection error means the backend is not running.
    throw new Error(
      'Could not reach the Task Manager API. Make sure the backend is running ' +
        '(cd backend && npm start) before running the QA tests.'
    );
  }
});