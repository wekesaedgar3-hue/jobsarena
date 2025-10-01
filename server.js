const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const memberRoutes = require("./routes/members");
const offerRoutes = require("./routes/offers");
const popupRoutes = require("./routes/popups");

// Load environment variables
dotenv.config();
if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET environment variable!");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
// Middleware
// ========================
app.use(
  cors({
    origin: "*", // replace with your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend files

// ========================
// In-memory popups (replace with DB in production)
// ========================
let popups = [
  { id: 1, text: "Welcome to JobBoard!", enabled: true },
  { id: 2, text: "New IT jobs available now.", enabled: true },
];

// ========================
// Routes
// ========================

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Popups routes
app.get("/api/popups", (req, res) => {
  res.json(popups);
});

app.post("/api/popups", (req, res) => {
  const { text, enabled } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  const newPopup = { id: Date.now(), text, enabled: enabled ?? true };
  popups.push(newPopup);
  res.json(newPopup);
});

// Jobs route example
let jobs = [
  { id: 1, title: "Senior Nurse", company: "Kenya Medical", location: "Nairobi", category: "Medical" },
  { id: 2, title: "Mechanical Technician", company: "AutoCare", location: "Mombasa", category: "Mechanics" },
  { id: 3, title: "Housekeeping Supervisor", company: "ComfortStay Hotels", location: "", category: "Housekeeping" },
];

app.get("/api/jobs", (req, res) => {
  res.json(jobs);
});

// Admin login route (simple example)
app.post("/api/admin-login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.json({ token: "fake-jwt-token", role: "admin" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// ========================
// Optional: JWT auth middleware
// ========================
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });
  next();
}

// ========================
// Additional routes from Sequelize models (optional)
// ========================
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/popups", popupRoutes);

// ========================
// Catch-all route to serve frontend index.html
// ========================
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========================
// Database connection + server start
// ========================
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // Fix ENUM role issues automatically
    await sequelize.query(`
      ALTER TABLE "Users"
        ALTER COLUMN "role" TYPE VARCHAR(255) USING role::text;
      ALTER TABLE "Users"
        ALTER COLUMN "role" SET DEFAULT 'seeker';
      ALTER TABLE "Users"
        ALTER COLUMN "role" DROP NOT NULL;
    `);
    console.log("✅ Users.role column updated");

    // Sync models
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
  }
})();




