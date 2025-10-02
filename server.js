// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken");
const sequelize = require("./config/db");

// Sequelize models
const Job = require("./models/Job");
const Member = require("./models/Member");
const Offer = require("./models/Offer");

// Import routes (FIXED: points to auth.js, not authRoutes.js)
const authRoutes = require("./routes/auth");

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
// JWT auth middleware
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
// Routes
// ========================

// Auth routes (MUST be before catch-all!)
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// ========================
// Jobs
// ========================
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.findAll({ order: [["createdAt", "DESC"]] });
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

app.post("/api/jobs", verifyToken, adminOnly, async (req, res) => {
  try {
    const { title, company, category, location, description } = req.body;
    if (!title || !company || !category)
      return res
        .status(400)
        .json({ message: "Title, company, and category are required" });

    const newJob = await Job.create({
      title,
      company,
      category,
      location,
      description,
    });
    res.json(newJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add job" });
  }
});

// ========================
// Members
// ========================
app.get("/api/members", async (req, res) => {
  try {
    const members = await Member.findAll({ order: [["createdAt", "DESC"]] });
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch members" });
  }
});

app.post("/api/members", verifyToken, adminOnly, async (req, res) => {
  try {
    const { name, role } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const newMember = await Member.create({ name, role: role || "member" });
    res.json(newMember);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add member" });
  }
});

// ========================
// Offers
// ========================
app.get("/api/offers", async (req, res) => {
  try {
    const offers = await Offer.findAll({ order: [["createdAt", "DESC"]] });
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch offers" });
  }
});

app.post("/api/offers", verifyToken, adminOnly, async (req, res) => {
  try {
    const { title, price, description } = req.body;
    if (!title || !price)
      return res
        .status(400)
        .json({ message: "Title and price are required" });

    const newOffer = await Offer.create({ title, price, description });
    res.json(newOffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add offer" });
  }
});

// ========================
// Popups (in-memory example, replace with DB if needed)
// ========================
let popups = [
  { id: 1, text: "Welcome to JobBoard!", enabled: true },
  { id: 2, text: "New IT jobs available now.", enabled: true },
];

app.get("/api/popups", (req, res) => res.json(popups));

app.post("/api/popups", verifyToken, adminOnly, (req, res) => {
  const { text, enabled } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  const newPopup = { id: Date.now(), text, enabled: enabled ?? true };
  popups.push(newPopup);
  res.json(newPopup);
});

// ========================
// Admin login (demo)
// ========================
app.post("/api/admin-login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    const token = jwt.sign(
      { username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token, role: "admin" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// ========================
// Catch-all route to serve frontend
// ========================
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========================
// Start server + DB connection
// ========================
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    await sequelize.sync({ alter: true });

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
  }
})();


