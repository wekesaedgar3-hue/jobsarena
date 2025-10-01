const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const memberRoutes = require("./routes/members");
const offerRoutes = require("./routes/offers");
const popupRoutes = require("./routes/popups");
const jwt = require("jsonwebtoken");

// Load environment variables
dotenv.config();
if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET environment variable!");
  process.exit(1);
}

const app = express();

// ========================
// Middleware
// ========================
app.use(cors({
  origin: "*", // replace with your frontend URL in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// ========================
// Routes
// ========================
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/popups", popupRoutes);

// ========================
// Health check
// ========================
app.get("/", (req, res) => {
  res.send("✅ JobBoard API is running...");
});

// ========================
// Optional: JWT Auth Middleware
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
  if (!req.user || req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
}

// ========================
// Database + Server Start
// ========================
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // ========================
    // Fix ENUM role issue automatically
    // ========================
    await sequelize.query(`
      ALTER TABLE "Users" 
        ALTER COLUMN "role" TYPE VARCHAR(255) USING role::text;
      ALTER TABLE "Users" 
        ALTER COLUMN "role" SET DEFAULT 'seeker';
      ALTER TABLE "Users" 
        ALTER COLUMN "role" DROP NOT NULL;
    `);
    console.log("✅ Users.role column updated to VARCHAR and default set");

    // Sync models
    await sequelize.sync({ alter: true }); // keeps schema in sync

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
  }
})();


