const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || (IS_PRODUCTION ? null : 'local-development-only');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be set when NODE_ENV=production');
}

const SEED_DEMO_DATA = process.env.SEED_DEMO_DATA === 'true';
const DEMO_NAME = process.env.DEMO_NAME || 'Demo User';
const DEMO_EMAIL = (process.env.DEMO_EMAIL || 'demo@example.com').toLowerCase();
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'password123';

// ---------- JSON file database ----------
const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : path.join(__dirname, 'taskmanager.json');

function loadDb() {
  if (!fs.existsSync(DB_FILE)) {
    return { users: [], tasks: [], nextUserId: 1, nextTaskId: 1 };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { users: [], tasks: [], nextUserId: 1, nextTaskId: 1 };
  }
}

function saveDb(db) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function demoDate(daysFromToday) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function seedDemoData(database) {
  if (!SEED_DEMO_DATA || database.users.length > 0 || database.tasks.length > 0) {
    return;
  }

  const now = new Date().toISOString();
  const user = {
    id: database.nextUserId++,
    name: DEMO_NAME,
    email: DEMO_EMAIL,
    password: bcrypt.hashSync(DEMO_PASSWORD, 10),
    reset_token: null,
    reset_token_expires: null,
    created_at: now,
  };
  database.users.push(user);

  const demoTasks = [
    {
      title: 'Review client proposal',
      description: 'Check the scope, timeline, and open questions.',
      due_date: demoDate(0),
      priority: 'high',
      project: 'work',
      completed: 0,
    },
    {
      title: 'Prepare product demo',
      description: 'Walk through registration and the daily task workflow.',
      due_date: demoDate(1),
      priority: 'high',
      project: 'work',
      completed: 0,
    },
    {
      title: 'Update onboarding screens',
      description: 'Apply the latest visual feedback.',
      due_date: demoDate(2),
      priority: 'medium',
      project: 'design',
      completed: 0,
    },
    {
      title: 'Buy groceries',
      description: 'Fruit, coffee, and breakfast supplies.',
      due_date: null,
      priority: 'low',
      project: 'personal',
      completed: 1,
    },
  ];

  demoTasks.forEach((task, index) => {
    database.tasks.push({
      ...task,
      id: database.nextTaskId++,
      user_id: user.id,
      created_at: new Date(Date.now() - index * 60000).toISOString(),
    });
  });

  saveDb(database);
  console.log(`Seeded ${DEMO_EMAIL} with ${demoTasks.length} demo tasks`);
}

let db = loadDb();
seedDemoData(db);

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- Helpers ----------
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function generateResetToken() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ---------- Auth routes ----------

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = email.toLowerCase();
  const existing = db.users.find((u) => u.email === normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const user = {
    id: db.nextUserId++,
    name: name.trim(),
    email: normalizedEmail,
    password: hashed,
    reset_token: null,
    reset_token_expires: null,
    created_at: new Date().toISOString(),
  };
  db.users.push(user);
  saveDb(db);

  const token = generateToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.find((u) => u.email === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user);
  res.json({ token, user: publicUser(user) });
});

// Forgot password - request reset code
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.users.find((u) => u.email === email.toLowerCase());
  // Always return success to avoid leaking which emails are registered
  if (!user) {
    return res.json({ message: 'If an account exists for this email, a reset code has been sent.' });
  }

  const token = generateResetToken();
  user.reset_token = token;
  user.reset_token_expires = Date.now() + 15 * 60 * 1000; // 15 minutes
  saveDb(db);

  const response = {
    message: 'If an account exists for this email, a reset code has been sent.',
  };

  if (!IS_PRODUCTION) {
    // Local development only. Production requires real email/SMS delivery.
    console.log(`[DEV] Password reset code for ${user.email}: ${token}`);
    response.devResetCode = token;
  }

  res.json(response);
});

// Reset password
app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, code and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const user = db.users.find((u) => u.email === email.toLowerCase());
  if (!user || !user.reset_token || user.reset_token !== code) {
    return res.status(400).json({ error: 'Invalid reset code' });
  }
  if (Date.now() > user.reset_token_expires) {
    return res.status(400).json({ error: 'Reset code has expired' });
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  user.reset_token = null;
  user.reset_token_expires = null;
  saveDb(db);

  res.json({ message: 'Password has been reset successfully. You can now log in.' });
});

// ---------- Task routes (protected) ----------

// Get all tasks for the authenticated user
app.get('/api/tasks', authenticate, (req, res) => {
  const tasks = db.tasks
    .filter((t) => t.user_id === req.user.id)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  res.json(tasks.map((t) => ({ ...t, completed: !!t.completed })));
});

// Create a task
app.post('/api/tasks', authenticate, (req, res) => {
  const { title, description, due_date, priority, project } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const task = {
    id: db.nextTaskId++,
    user_id: req.user.id,
    title: title.trim(),
    description: description || '',
    due_date: due_date || null,
    priority: priority || 'medium',
    project: project || 'personal',
    completed: 0,
    created_at: new Date().toISOString(),
  };
  db.tasks.push(task);
  saveDb(db);

  res.status(201).json({ ...task, completed: false });
});

// Update a task
app.put('/api/tasks/:id', authenticate, (req, res) => {
  const task = db.tasks.find(
    (t) => t.id === Number(req.params.id) && t.user_id === req.user.id
  );
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, due_date, priority, project, completed } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (due_date !== undefined) task.due_date = due_date;
  if (priority !== undefined) task.priority = priority;
  if (project !== undefined) task.project = project;
  if (completed !== undefined) task.completed = completed ? 1 : 0;
  saveDb(db);

  res.json({ ...task, completed: !!task.completed });
});

// Delete a task
app.delete('/api/tasks/:id', authenticate, (req, res) => {
  const index = db.tasks.findIndex(
    (t) => t.id === Number(req.params.id) && t.user_id === req.user.id
  );
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  db.tasks.splice(index, 1);
  saveDb(db);
  res.json({ message: 'Task deleted' });
});

// ---------- Start server ----------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Task Manager API running on http://0.0.0.0:${PORT}`);
});