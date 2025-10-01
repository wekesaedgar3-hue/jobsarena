const express = require("express");
const router = express.Router();
const Popup = require("../models/popup");

// Get all popups
router.get("/", async (req, res) => {
  try {
    const popups = await Popup.findAll();
    res.json(popups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a popup (Admin)
router.post("/", async (req, res) => {
  try {
    const { title, message, imageUrl } = req.body;
    const popup = await Popup.create({ title, message, imageUrl });
    res.json(popup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete popup
router.delete("/:id", async (req, res) => {
  try {
    const popup = await Popup.findByPk(req.params.id);
    if (!popup) return res.status(404).json({ error: "Popup not found" });
    await popup.destroy();
    res.json({ message: "Popup deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

