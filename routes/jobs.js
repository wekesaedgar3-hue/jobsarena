const express = require("express");
const Job = require("../models/job");
const { authMiddleware, isAdmin } = require("../middleware/auth");
const router = express.Router();

// Get all jobs
router.get("/", async (req, res) => {
  const jobs = await Job.findAll();
  res.json(jobs);
});

// Post job (admin only)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
