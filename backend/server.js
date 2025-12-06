require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8081;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// --- Middleware ---
app.use(cors({
  origin: '*', // or 'http://localhost:5173' if you want to restrict
  credentials: false
}));
app.use(express.json());

// --- In-memory "database" ---
const db = {
  users: [],        // { id, name, email, passwordHash }
  departments: [],  // { id, name, description, createdAt }
  students: [],     // { id, name, email, departmentId, createdAt }
  teachers: []      // { id, name, email, phone, subject, departmentId, createdAt }
};

// --- Helper: auth middleware ---
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// --- Helper: generate JWT ---
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ===================== AUTH =====================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = db.users.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: uuid(), name, email, passwordHash };
    db.users.push(user);

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===================== DEPARTMENTS =====================

// GET /api/departments
app.get('/api/departments', authMiddleware, (req, res) => {
  res.json(db.departments);
});

// POST /api/departments
app.post('/api/departments', authMiddleware, (req, res) => {
  const { name, description } = req.body || {};
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }
  const department = { 
    id: uuid(), 
    name, 
    description: description || '',
    createdAt: new Date().toISOString()
  };
  db.departments.push(department);
  res.status(201).json(department);
});

// GET /api/departments/:id
app.get('/api/departments/:id', authMiddleware, (req, res) => {
  const dep = db.departments.find(d => d.id === req.params.id);
  if (!dep) return res.status(404).json({ message: 'Department not found' });
  res.json(dep);
});

// PUT /api/departments/:id
app.put('/api/departments/:id', authMiddleware, (req, res) => {
  const id = req.params.id.toString();
  const dep = db.departments.find(d => d.id.toString() === id);

  if (!dep) return res.status(404).json({ message: 'Department not found' });

  const { name, description } = req.body || {};
  if (name) dep.name = name;
  if (description !== undefined) dep.description = description;

  res.json(dep);
});

// DELETE /api/departments/:id
app.delete('/api/departments/:id', authMiddleware, (req, res) => {
  const id = req.params.id.toString();
  const index = db.departments.findIndex(d => d.id.toString() === id);

  if (index === -1) return res.status(404).json({ message: 'Department not found' });

  db.departments.splice(index, 1);
  res.json({ success: true });
});


// ===================== STUDENTS =====================

// GET /api/students?departmentId=...
app.get('/api/students', authMiddleware, (req, res) => {
  const { departmentId } = req.query;
  let students = db.students;
  if (departmentId) {
    students = students.filter(s => s.departmentId === departmentId);
  }
  res.json(students);
});

// POST /api/students
app.post('/api/students', authMiddleware, (req, res) => {
  const { name, email, departmentId } = req.body || {};
  if (!name || !email || !departmentId) {
    return res.status(400).json({ message: 'Name, email, departmentId are required' });
  }
  const student = { 
    id: uuid(), 
    name, 
    email, 
    departmentId,
    createdAt: new Date().toISOString()
  };
  db.students.push(student);
  res.status(201).json(student);
});

// GET /api/students/:id
app.get('/api/students/:id', authMiddleware, (req, res) => {
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
});

// PUT /api/students/:id
app.put('/api/students/:id', authMiddleware, (req, res) => {
  const student = db.students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const { name, email, departmentId } = req.body || {};
  if (name) student.name = name;
  if (email) student.email = email;
  if (departmentId) student.departmentId = departmentId;

  res.json(student);
});

// DELETE /api/students/:id
app.delete('/api/students/:id', authMiddleware, (req, res) => {
  const index = db.students.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Student not found' });

  db.students.splice(index, 1);
  res.status(200).json({ message: 'Student deleted successfully' });
});

// ===================== TEACHERS =====================

// GET /api/teachers?departmentId=...
app.get('/api/teachers', authMiddleware, (req, res) => {
  const { departmentId } = req.query;
  let teachers = db.teachers;
  if (departmentId) {
    teachers = teachers.filter(t => t.departmentId === departmentId);
  }
  res.json(teachers);
});

// POST /api/teachers
app.post('/api/teachers', authMiddleware, (req, res) => {
  const { name, email, phone, subject, departmentId } = req.body || {};
  if (!name || !email || !departmentId) {
    return res.status(400).json({ message: 'Name, email, departmentId are required' });
  }
  const teacher = { 
    id: uuid(), 
    name, 
    email, 
    phone: phone || '', 
    subject: subject || '', 
    departmentId,
    createdAt: new Date().toISOString()
  };
  db.teachers.push(teacher);
  res.status(201).json(teacher);
});

// GET /api/teachers/:id
app.get('/api/teachers/:id', authMiddleware, (req, res) => {
  const teacher = db.teachers.find(t => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
  res.json(teacher);
});

// PUT /api/teachers/:id
app.put('/api/teachers/:id', authMiddleware, (req, res) => {
  const teacher = db.teachers.find(t => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

  const { name, email, phone, subject, departmentId } = req.body || {};
  if (name) teacher.name = name;
  if (email) teacher.email = email;
  if (phone !== undefined) teacher.phone = phone;
  if (subject !== undefined) teacher.subject = subject;
  if (departmentId) teacher.departmentId = departmentId;

  res.json(teacher);
});

// DELETE /api/teachers/:id
app.delete('/api/teachers/:id', authMiddleware, (req, res) => {
  const index = db.teachers.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Teacher not found' });

  db.teachers.splice(index, 1);
  res.status(200).json({ message: 'Teacher deleted successfully' });
});


// ===================== START SERVER =====================

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});