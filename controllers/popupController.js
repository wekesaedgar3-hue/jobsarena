const Popup = require("../models/Popup");

exports.createPopup = async (req, res) => {
  try {
    const popup = await Popup.create(req.body);
    res.status(201).json(popup);
  } catch (err) {
    res.status(500).json({ message: "Error creating popup", error: err.message });
  }
};

exports.getPopups = async (req, res) => {
  try {
    const popups = await Popup.findAll();
    res.json(popups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching popups", error: err.message });
  }
};

exports.updatePopup = async (req, res) => {
  try {
    const popup = await Popup.findByPk(req.params.id);
    if (!popup) return res.status(404).json({ message: "Popup not found" });

    await popup.update(req.body);
    res.json(popup);
  } catch (err) {
    res.status(500).json({ message: "Error updating popup", error: err.message });
  }
};

exports.deletePopup = async (req, res) => {
  try {
    const popup = await Popup.findByPk(req.params.id);
    if (!popup) return res.status(404).json({ message: "Popup not found" });

    await popup.destroy();
    res.json({ message: "Popup deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting popup", error: err.message });
  }
};
