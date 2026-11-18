// API helper used by Appium UI tests to set up/tear down test data.
const axios = require('axios');
const config = require('../../config');

const api = axios.create({
  baseURL: config.baseUrl,
  timeout: 15000,
});

let emailCounter = 0;

function uniqueEmail(prefix = 'ui') {
  emailCounter += 1;
  return `${prefix}+${config.emailSuffix}+${emailCounter}@example.com`;
}

async function registerUser(overrides = {}) {
  const payload = {
    name: 'UI Tester',
    email: uniqueEmail(),
    password: 'Password123!',
    ...overrides,
  };
  const res = await api.post('/api/auth/register', payload);
  return { res, payload };
}

async function getResetCode(email) {
  const res = await api.post('/api/auth/forgot-password', { email });
  return res.data.devResetCode || null;
}

async function logout() {
  try {
    await api.post('/api/auth/logout');
  } catch (e) {
    // ignore — token may already be invalid
  }
}

module.exports = { api, uniqueEmail, registerUser, getResetCode, logout };
