// server.js
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
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create users table
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
  res.send("Shop Easy Backend is running successfully");
});

// =======================
// REGISTER API
// =======================
app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO users (firstName, lastName, email, password)
       VALUES (?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({
            message: "User already exists"
          });
        }

        res.json({
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

// =======================
// LOGIN API
// =======================
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔴 Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // ✅ DEFAULT LOGIN (IMPORTANT - put FIRST)
    if (email === "abc" && password === "abc") {
      return res.json({
        message: "Login successful",
        user: {
          firstName: "Demo User",
          email: "abc"
        }
      });
    }

    // 🔹 DATABASE LOGIN
    db.get(
      `SELECT * FROM users WHERE email = ?`,
      [email],
      async (err, user) => {
        if (err || !user) {
          return res.status(401).json({
            message: "Invalid email or password"
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(401).json({
            message: "Invalid email or password"
          });
        }

        res.json({
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

// =======================
// PRODUCTS API
// =======================
app.get("/products", (req, res) => {
  res.json([
    {
      id: 1,
      name: "iPhone 15 Pro",
      description: "A17 chip, 256GB storage",
      price: 999,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"
    },
    {
      id: 2,
      name: "Sony WH-1000XM5",
      description: "Noise cancelling headphones",
      price: 349,
      image: "https://images.unsplash.com/photo-1518449032309-cc2a1e3cb0a7"
    },
    {
      id: 3,
      name: "Logitech MX Master 3S",
      description: "Wireless performance mouse",
      price: 99,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3"
    },
    {
      id: 4,
      name: "Pet Comfort Bed",
      description: "Soft and cozy bed",
      price: 29,
      image: "https://images.unsplash.com/photo-1601758123927-196aa1c1c9b0"
    }
  ]);
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});