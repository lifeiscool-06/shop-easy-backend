// server.js
// EasyBuy Backend using Node.js + Express + SQLite
// Install first:
// npm install express sqlite3 cors bcryptjs

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = new sqlite3.Database("./easybuy.db", (err) => {
  if (err) {
    console.log("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create users table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
});

// Home route
app.get("/", (req, res) => {
  res.send("EasyBuy Backend is running successfully");
});

// Register API
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (firstName, lastName, email, password)
       VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({
            message: "User already exists or invalid data"
          });
        }

        res.status(200).json({
          message: "Registration successful"
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server error during registration"
    });
  }
});

// Login API
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, user) => {
        if (err || !user) {
          return res.status(401).json({
            message: "Invalid email or password"
          });
        }

        const isMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!isMatch) {
          return res.status(401).json({
            message: "Invalid email or password"
          });
        }

        res.status(200).json({
          message: "Login successful",
          user: {
            id: user.id,
            firstName: user.firstName,
            email: user.email
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server error during login"
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});