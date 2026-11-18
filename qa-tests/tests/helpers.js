const axios = require('axios');
const config = require('../config');

const api = axios.create({
  baseURL: config.baseUrl,
  timeout: 15000,
  validateStatus: () => true, // don't throw on non-2xx; tests assert status codes
});

let emailCounter = 0;

function uniqueEmail(prefix = 'qa') {
  emailCounter += 1;
  return `${prefix}+${config.emailSuffix}+${emailCounter}@example.com`;
}

async function registerUser(overrides = {}) {
  const payload = {
    name: 'QA Tester',
    email: uniqueEmail(),
    password: 'Password123!',
    ...overrides,
  };
  const res = await api.post('/api/auth/register', payload);
  return { res, payload };
}

async function loginUser(email, password) {
  return api.post('/api/auth/login', { email, password });
}

async function createTask(token, overrides = {}) {
  const payload = {
    title: 'Test task',
    description: 'Created by QA suite',
    due_date: 'Today',
    priority: 'medium',
    project: 'personal',
    ...overrides,
  };
  const res = await api.post('/api/tasks', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { res, payload };
}

module.exports = {
  api,
  uniqueEmail,
  registerUser,
  loginUser,
  createTask,
};