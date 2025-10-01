const express = require("express");
const Offer = require("../models/offer");
const { authMiddleware, isAdmin } = require("../middleware/auth");
const router = express.Router();

// Get offers
router.get("/", async (req, res) => {
  const offers = await Offer.findAll();
  res.json(offers);
});

// Add offer (admin only)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.json(offer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
