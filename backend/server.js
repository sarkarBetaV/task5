import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import db from "./config/database.js";

const app = express();

// Important: Basic CORS
app.use(
  cors({
    origin: [
      "https://user-management-frontend-62hx.onrender.com", // Your exact frontend URL
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Add this line after CORS setup
app.options("*", cors());

app.use(express.json());

// Important: Test if database connection works
async function testDatabase() {
  try {
    const result = await db.query("SELECT NOW()");
    console.log("✅ Database connection test:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

// Simple health check
app.get("/api/health", async (req, res) => {
  const dbConnected = await testDatabase();

  res.json({
    status: "ok",
    database: dbConnected ? "connected" : "disconnected",
    message: "Backend server is running!",
    timestamp: new Date().toISOString(),
  });
});

// Database check endpoint
app.get("/api/check-database", async (req, res) => {
  try {
    // Check if table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    // Check if we can query the table
    let userCount = 0;
    if (tableCheck.rows[0].exists) {
      const countResult = await db.query("SELECT COUNT(*) FROM users");
      userCount = parseInt(countResult.rows[0].count);
    }

    res.json({
      table_exists: tableCheck.rows[0].exists,
      user_count: userCount,
      database_url: process.env.DATABASE_URL ? "Set" : "Not set",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      database_url: process.env.DATABASE_URL ? "Set" : "Not set",
    });
  }
});

// Registration endpoint
app.post("/api/auth/register", async (req, res) => {
  console.log("📝 Registration attempt:", req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    // Insert user
    const result = await db.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, hashedPassword]
    );

    console.log("✅ User created successfully");
    res.status(201).json({
      message: "Registration successful!",
      userId: result.rows[0].id,
    });
  } catch (error) {
    console.error("❌ Registration error:", error.message);

    if (error.code === "23505") {
      return res.status(400).json({ message: "Email already exists." });
    }

    res.status(500).json({ message: "Registration failed: " + error.message });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  console.log("🔐 Login attempt:", req.body);

  try {
    const { email, password } = req.body;

    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Compare hashed password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      token: "test-jwt-token",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Backend server running on port", PORT);
  console.log("✅ Health endpoint: /api/health");
  console.log("✅ Database check: /api/check-database");
  console.log("✅ Register endpoint: /api/auth/register");
  console.log("✅ Login endpoint: /api/auth/login");
});
