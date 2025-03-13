import express from 'express';
import cors from 'cors';
import connectDB from './database/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config'; // Add this to load .env
import path from 'path'; // Add this to handle file paths for serving the React build
import { log } from 'console';
import { console } from 'inspector';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // Use environment variable

// Middleware
app.use(express.json());
app.use(cors());

// Database Setup
const setupDB = async () => {
  const db = await connectDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone_number TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      gender TEXT CHECK(gender IN ('male', 'female', 'all')) NOT NULL,
      phone_number TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      price REAL NOT NULL,
      status TEXT CHECK(status IN ('process', 'denied', 'completed')) NOT NULL DEFAULT 'process',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stat_key TEXT UNIQUE NOT NULL,
      count INTEGER DEFAULT 0
    );
  `);

  // Initialize statistic counters if they don’t exist
  await db.run(`
    INSERT OR IGNORE INTO statistics (stat_key, count) VALUES 
    ('home_visits', 0),
    ('worker_visits', 0),
    ('call_button_clicks', 0)
  `);
  console.log('✅ Database connected & tables created');
};
setupDB();

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};
const adminauthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      if (user.role !== 'admin') {
          return res.status(403).json({ error: 'Admin access required' });
      }
      req.user = user;
      next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.send('Freelancing App Backend Running 🚀');
});

// Registration with Auto-Login
app.post('/register', async (req, res) => {
  const { name, phone_number, password } = req.body;
  if (!name || !phone_number || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const db = await connectDB();
    const result = await db.run(
      'INSERT INTO users (name, phone_number, password) VALUES (?, ?, ?)',
      [name, phone_number, hashedPassword]
    );
    const userId = result.lastID;
    const token = jwt.sign({ id: userId, name }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Phone number already exists' });
    } else {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  }
});

// Login
app.post('/login', async (req, res) => {
  const { phone_number, password } = req.body;
  if (!phone_number || !password) {
    return res.status(400).json({ error: 'Phone number and password required' });
  }
  try {
    const db = await connectDB();
    const user = await db.get(
      'SELECT id, name, password FROM users WHERE phone_number = ?',
      [phone_number]
    );
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Post Notice
app.post('/notices', authenticateToken, async (req, res) => {
  const { description, date, gender, price } = req.body;
  const user_id = req.user.id;
  if (!description || !date || !gender || !price) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!['male', 'female', 'all'].includes(gender)) {
    return res.status(400).json({ error: 'Invalid gender value' });
  }
  try {
    const db = await connectDB();
    // Get the user's phone number from the database
    const user = await db.get('SELECT phone_number FROM users WHERE id = ?', [user_id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await db.run(
      'INSERT INTO notices (user_id, description, date, gender, phone_number, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, description, date, gender, user.phone_number, price, 'process']
    );
    
    res.status(201).json({ message: 'Notice posted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post notice', details: error.message });
  }
});

// Get User's Notices
app.get('/notice', authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  try {
    const db = await connectDB();
    const notices = await db.all(
      'SELECT n.id, n.description, n.date, n.gender, n.phone_number, n.price, n.created_at, n.status, u.name AS user_name FROM notices n JOIN users u ON n.user_id = u.id WHERE n.user_id = ? ORDER BY n.created_at DESC',
      [user_id]
    );
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notices', details: error.message });
  }
});
// DELETE Notice by ID
app.delete('/notice/:id', authenticateToken, async (req, res) => {
  const noticeId = req.params.id;
  const user_id = req.user.id; // Get the authenticated user's ID from the JWT token

  try {
    const db = await connectDB();

    // Check if the notice exists and belongs to the user
    const notice = await db.get('SELECT user_id FROM notices WHERE id = ?', [noticeId]);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    if (notice.user_id !== user_id) {
      return res.status(403).json({ error: 'Unauthorized to delete this notice' });
    }

    // Delete the notice
    const result = await db.run('DELETE FROM notices WHERE id = ?', [noticeId]);
    
    if (result.changes > 0) {
      res.status(200).json({ message: 'Notice deleted successfully' });
    } else {
      res.status(404).json({ error: 'Notice not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notice', details: error.message });
  }
});
// Get Available Notices (in process) - Public Access
app.get('/worker', async (req, res) => {
  
  try {
    const db = await connectDB();
    await db.run('UPDATE statistics SET count = count + 1 WHERE stat_key = "worker_visits"');
    const notices = await db.all(
      `SELECT n.id, n.description, n.date, n.gender, n.phone_number, n.price, 
              n.created_at, n.status, u.name AS user_name 
       FROM notices n 
       JOIN users u ON n.user_id = u.id 
       WHERE n.status = 'completed' 
       ORDER BY n.created_at DESC`
    );
    res.json(notices);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch available notices', 
      details: error.message 
    });
  }
});
// Admin Login
app.post('/admin', async (req, res) => {
  
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }

  try {
    const db = await connectDB();
    const admin = await db.get(
      'SELECT id, login, password FROM admins WHERE login = ?',
      [login]
    );

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }

    const token = jwt.sign({ id: admin.id, login: admin.login, role: 'admin' }, JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ message: 'Admin login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
// Admin Routes with Authentication
app.get('/admin/allnotices', adminauthenticateToken, async (req, res) => {
  try {
      const db = await connectDB();
      const notices = await db.all(
          `SELECT n.id, n.description, n.date, n.gender, n.phone_number, n.price, 
                  n.created_at, n.status, u.name AS user_name 
           FROM notices n 
           JOIN users u ON n.user_id = u.id 
           WHERE n.status = 'completed' 
           ORDER BY n.created_at DESC`
      );
      res.json(notices);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notices', details: error.message });
  }
});

app.get('/admin/inprogress', adminauthenticateToken, async (req, res) => {
  try {
      const db = await connectDB();
      const notices = await db.all(
          `SELECT n.id, n.description, n.date, n.gender, n.phone_number, n.price, 
                  n.created_at, n.status, u.name AS user_name 
           FROM notices n 
           JOIN users u ON n.user_id = u.id 
           WHERE n.status = 'process' 
           ORDER BY n.created_at DESC`
      );
      res.json(notices);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notices', details: error.message });
  }
});

app.get('/admin/statistics', adminauthenticateToken, async (req, res) => {
  try {
      res.json({ message: 'hello' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

// Update Notice Status to Completed (Admin Only)
app.put('/admin/notice/:id/status', adminauthenticateToken, async (req, res) => {
  const noticeId = req.params.id;

  try {
    const db = await connectDB();

    // Check if the notice exists and has status 'process'
    const notice = await db.get('SELECT status FROM notices WHERE id = ?', [noticeId]);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    if (notice.status !== 'process') {
      return res.status(400).json({ error: 'Only notices in process can be completed' });
    }

    // Update the status to 'completed'
    const result = await db.run(
      'UPDATE notices SET status = ? WHERE id = ?',
      ['completed', noticeId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.status(200).json({ message: 'Notice status updated to completed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notice status', details: error.message });
  }
});
// Delete Notice by ID (Admin Only)
app.delete('/admin/notice/:id', adminauthenticateToken, async (req, res) => {
  const noticeId = req.params.id;

  try {
    const db = await connectDB();
    
    // Delete the notice
    const result = await db.run('DELETE FROM notices WHERE id = ?', [noticeId]);
    
    if (result.changes > 0) {
      res.status(200).json({ message: 'Notice deleted successfully' });
    } else {
      res.status(404).json({ error: 'Notice not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notice', details: error.message });
  }
});
// Update Notice by ID (Admin Only)
app.put('/admin/notice/:id', adminauthenticateToken, async (req, res) => {
  const noticeId = req.params.id;
  const { description, date, gender, phone_number, price } = req.body;  

  if (!description || !date || !gender || !phone_number || !price) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['male', 'female', 'all'].includes(gender)) {
    return res.status(400).json({ error: 'Invalid gender value' });
  }

  try {
    const db = await connectDB();
    const result = await db.run(
      `UPDATE notices 
       SET description = ?, date = ?, gender = ?, phone_number = ?, price = ? 
       WHERE id = ?`,
      [description, date, gender, phone_number, price, noticeId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.status(200).json({ message: 'Notice updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notice', details: error.message });
  }
});
// statistics
app.get('/home_visits', async (req, res) => {
  try {
    const db = await connectDB();
    await db.run('UPDATE statistics SET count = count + 1 WHERE stat_key = "home_visits"');
  } catch (error) {
    console.error('Failed to update home_visits:', error.message);
  }
  res.send('Freelancing App Backend Running 🚀');
});
app.post('/stats/track-call-click', async (req, res) => {
  try {
    const db = await connectDB();
    await db.run('UPDATE statistics SET count = count + 1 WHERE stat_key = "call_button_clicks"');
    res.json({ message: 'Call button click tracked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track click', details: error.message });
  }
});
app.get('/stats', adminauthenticateToken, async (req, res) => {
  try {
    const db = await connectDB();
    const stats = await db.all('SELECT stat_key, count FROM statistics');
    const userCount = await db.get('SELECT COUNT(*) as user_count FROM users');
    const noticeCount = await db.get('SELECT COUNT(*) as notice_count FROM notices');
    const adminNoticeCount = await db.get(
      'SELECT COUNT(*) as admin_notice_count FROM notices WHERE user_id = ?',
      [-2]
    );
    const userNoticeCount = noticeCount.notice_count - adminNoticeCount.admin_notice_count
    
    
    const result = {
      home_visits: stats.find(s => s.stat_key === 'home_visits')?.count || 0,
      worker_visits: stats.find(s => s.stat_key === 'worker_visits')?.count || 0,
      call_button_clicks: stats.find(s => s.stat_key === 'call_button_clicks')?.count || 0,
      user_count: userCount.user_count,
      notice_count: noticeCount.notice_count,
      admin_notices: adminNoticeCount.admin_notice_count,
      userNoticeCount: userNoticeCount
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});
// Post Notice by Admin
app.post('/noticesaddadmin', adminauthenticateToken, async (req, res) => {
  const { description, date, gender, phone_number, price } = req.body;
  if (!description || !date || !gender || !phone_number || !price) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!['male', 'female', 'all'].includes(gender)) {
    return res.status(400).json({ error: 'Invalid gender value' });
  }

  try {
    const db = await connectDB();
    const adminUserId = -2;
    const result = await db.run(
      'INSERT INTO notices (user_id, description, date, gender, phone_number, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [adminUserId, description, date, gender, phone_number, price, 'completed']
    );

    res.status(201).json({ message: 'Notice posted successfully by admin', noticeId: result.lastID });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post notice', details: error.message });
  }
});


// Serve React Build (New Code Added Here)
// Set the path to the React build folder (adjust path as needed based on your project structure)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle all other routes by serving the React app (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});