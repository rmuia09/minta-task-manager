const { api, uniqueEmail, registerUser, loginUser } = require('./helpers');

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    test('registers a new user and returns a token + user object', async () => {
      const { res } = await registerUser();
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('token');
      expect(res.data.token).toBeTruthy();
      expect(res.data.user).toMatchObject({
        name: 'QA Tester',
        email: expect.stringContaining('@example.com'),
      });
      expect(res.data.user).not.toHaveProperty('password');
    });

    test('rejects registration with a missing name', async () => {
      const res = await api.post('/api/auth/register', {
        email: uniqueEmail('noname'),
        password: 'Password123!',
      });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('Name');
    });

    test('rejects registration with a missing email', async () => {
      const res = await api.post('/api/auth/register', {
        name: 'No Email',
        password: 'Password123!',
      });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('email');
    });

    test('rejects registration with a short password', async () => {
      const res = await api.post('/api/auth/register', {
        name: 'Short Pass',
        email: uniqueEmail('shortpass'),
        password: '123',
      });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('6 characters');
    });

    test('rejects duplicate email registration', async () => {
      const { payload } = await registerUser();
      const res = await api.post('/api/auth/register', payload);
      expect(res.status).toBe(409);
      expect(res.data.error).toContain('already exists');
    });

    test('normalizes email to lowercase', async () => {
      const email = uniqueEmail('MixedCase');
      const res = await api.post('/api/auth/register', {
        name: 'Mixed Case',
        email: email.toUpperCase(),
        password: 'Password123!',
      });
      expect(res.status).toBe(201);
      expect(res.data.user.email).toBe(email.toLowerCase());
    });
  });

  describe('POST /api/auth/login', () => {
    test('logs in with valid credentials', async () => {
      const { payload } = await registerUser();
      const res = await loginUser(payload.email, payload.password);
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
      expect(res.data.user.email).toBe(payload.email);
    });

    test('rejects login with wrong password', async () => {
      const { payload } = await registerUser();
      const res = await loginUser(payload.email, 'WrongPassword!');
      expect(res.status).toBe(401);
      expect(res.data.error).toContain('Invalid email or password');
    });

    test('rejects login with non-existent email', async () => {
      const res = await loginUser(uniqueEmail('ghost'), 'Password123!');
      expect(res.status).toBe(401);
      expect(res.data.error).toContain('Invalid email or password');
    });

    test('rejects login with missing fields', async () => {
      const res = await api.post('/api/auth/login', { email: 'x@example.com' });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('password');
    });
  });
});