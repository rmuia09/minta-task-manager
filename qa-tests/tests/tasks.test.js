const { api, registerUser, createTask } = require('./helpers');

describe('Tasks API', () => {
  let token;

  beforeAll(async () => {
    const { res } = await registerUser();
    token = res.data.token;
  });

  describe('Authentication & authorization', () => {
    test('rejects task access without a token', async () => {
      const res = await api.get('/api/tasks');
      expect(res.status).toBe(401);
      expect(res.data.error).toContain('No token');
    });

    test('rejects task access with an invalid token', async () => {
      const res = await api.get('/api/tasks', {
        headers: { Authorization: 'Bearer invalid-token' },
      });
      expect(res.status).toBe(401);
      expect(res.data.error).toContain('Invalid or expired');
    });
  });

  describe('POST /api/tasks', () => {
    test('creates a task with all fields', async () => {
      const { res } = await createTask(token, {
        title: 'Design onboarding screens',
        description: '3 screens for first-launch flow',
        due_date: 'Today',
        priority: 'high',
        project: 'design',
      });
      expect(res.status).toBe(201);
      expect(res.data).toMatchObject({
        title: 'Design onboarding screens',
        description: '3 screens for first-launch flow',
        due_date: 'Today',
        priority: 'high',
        project: 'design',
        completed: false,
      });
      expect(res.data.id).toBeDefined();
    });

    test('creates a task with defaults when optional fields are omitted', async () => {
      const { res } = await createTask(token, { title: 'Minimal task' });
      expect(res.status).toBe(201);
      expect(res.data.priority).toBe('medium');
      expect(res.data.project).toBe('personal');
      expect(res.data.completed).toBe(false);
    });

    test('rejects a task with an empty title', async () => {
      const res = await api.post(
        '/api/tasks',
        { title: '   ' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('Title');
    });

    test('rejects a task with a missing title', async () => {
      const res = await api.post(
        '/api/tasks',
        { description: 'no title' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('Title');
    });
  });

  describe('GET /api/tasks', () => {
    test('returns tasks for the authenticated user', async () => {
      await createTask(token, { title: 'List me' });
      const res = await api.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data[0]).toHaveProperty('title');
      expect(res.data[0]).toHaveProperty('completed');
    });

    test('does not return tasks belonging to another user', async () => {
      await createTask(token, { title: 'Private task' });

      const second = await registerUser();
      const secondToken = second.res.data.token;

      const res = await api.get('/api/tasks', {
        headers: { Authorization: `Bearer ${secondToken}` },
      });
      expect(res.status).toBe(200);
      const titles = res.data.map((t) => t.title);
      expect(titles).not.toContain('Private task');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('updates a task', async () => {
      const { res: created } = await createTask(token, { title: 'Before update' });
      const taskId = created.data.id;

      const res = await api.put(
        `/api/tasks/${taskId}`,
        { title: 'After update', completed: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(res.status).toBe(200);
      expect(res.data.title).toBe('After update');
      expect(res.data.completed).toBe(true);
    });

    test('returns 404 when updating a non-existent task', async () => {
      const res = await api.put(
        '/api/tasks/999999',
        { title: 'Ghost' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(res.status).toBe(404);
      expect(res.data.error).toContain('not found');
    });

    test('cannot update another user\'s task', async () => {
      const { res: created } = await createTask(token, { title: 'Mine' });
      const taskId = created.data.id;

      const second = await registerUser();
      const secondToken = second.res.data.token;

      const res = await api.put(
        `/api/tasks/${taskId}`,
        { title: 'Hijacked' },
        { headers: { Authorization: `Bearer ${secondToken}` } }
      );
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('deletes a task', async () => {
      const { res: created } = await createTask(token, { title: 'Delete me' });
      const taskId = created.data.id;

      const res = await api.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      expect(res.data.message).toContain('deleted');

      const list = await api.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ids = list.data.map((t) => t.id);
      expect(ids).not.toContain(taskId);
    });

    test('returns 404 when deleting a non-existent task', async () => {
      const res = await api.delete('/api/tasks/999999', {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(404);
    });
  });
});