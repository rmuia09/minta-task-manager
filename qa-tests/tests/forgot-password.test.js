const { api, uniqueEmail, registerUser, loginUser } = require('./helpers');

describe('Forgot Password API', () => {
  const canReset = process.env.API_BASE_URL?.includes('localhost') || process.env.API_BASE_URL?.includes('10.0.2.2');

  test('requests a reset code for an existing account', async () => {
    const { payload } = await registerUser();
    const res = await api.post('/api/auth/forgot-password', { email: payload.email });
    expect(res.status).toBe(200);

    if (canReset) {
      expect(res.data).toHaveProperty('devResetCode');
      expect(res.data.devResetCode).toMatch(/^\d{6}$/);
    }
  });

  test('does not leak whether an email is registered (returns 200 for unknown email)', async () => {
    const res = await api.post('/api/auth/forgot-password', {
      email: uniqueEmail('unknown'),
    });
    expect(res.status).toBe(200);
    expect(res.data.message).toContain('If an account exists');
    if (canReset) {
      expect(res.data).not.toHaveProperty('devResetCode');
    }
  });

  test('rejects a missing email', async () => {
    const res = await api.post('/api/auth/forgot-password', {});
    expect(res.status).toBe(400);
    expect(res.data.error).toContain('Email');
  });

  test('resets the password with a valid code and allows login with the new password', async () => {
    if (!canReset) {
      // Production backend does not return devResetCode — skip reset flow.
      return;
    }

    const { payload } = await registerUser();

    const forgotRes = await api.post('/api/auth/forgot-password', {
      email: payload.email,
    });
    const code = forgotRes.data.devResetCode;

    const resetRes = await api.post('/api/auth/reset-password', {
      email: payload.email,
      code,
      newPassword: 'NewPassword456!',
    });
    expect(resetRes.status).toBe(200);
    expect(resetRes.data.message).toContain('reset successfully');

    // Old password should no longer work
    const oldLogin = await loginUser(payload.email, payload.password);
    expect(oldLogin.status).toBe(401);

    // New password should work
    const newLogin = await loginUser(payload.email, 'NewPassword456!');
    expect(newLogin.status).toBe(200);
    expect(newLogin.data).toHaveProperty('token');
  });

  test('rejects reset with an invalid code', async () => {
    const { payload } = await registerUser();
    await api.post('/api/auth/forgot-password', { email: payload.email });

    const res = await api.post('/api/auth/reset-password', {
      email: payload.email,
      code: '000000',
      newPassword: 'NewPassword456!',
    });
    expect(res.status).toBe(400);
    expect(res.data.error).toContain('Invalid reset code');
  });

  test('rejects reset with a short new password', async () => {
    if (!canReset) return;

    const { payload } = await registerUser();
    const forgotRes = await api.post('/api/auth/forgot-password', {
      email: payload.email,
    });

    const res = await api.post('/api/auth/reset-password', {
      email: payload.email,
      code: forgotRes.data.devResetCode,
      newPassword: '123',
    });
    expect(res.status).toBe(400);
    expect(res.data.error).toContain('6 characters');
  });

  test('rejects reset with missing fields', async () => {
    const res = await api.post('/api/auth/reset-password', {
      email: uniqueEmail('missing'),
    });
    expect(res.status).toBe(400);
    expect(res.data.error).toContain('code');
  });
});
