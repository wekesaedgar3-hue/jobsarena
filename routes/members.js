const express = require("express");
const Member = require("../models/member");
const { authMiddleware, isAdmin } = require("../middleware/auth");
const router = express.Router();

// Get members
router.get("/", async (req, res) => {
  const members = await Member.findAll();
  res.json(members);
});

// Add member (admin only)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
