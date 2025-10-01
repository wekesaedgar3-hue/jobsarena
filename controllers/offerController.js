const Offer = require("../models/Offer");

exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ message: "Error creating offer", error: err.message });
  }
};

exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.findAll();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching offers", error: err.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    await offer.update(req.body);
    res.json(offer);
  } catch (err) {
    res.status(500).json({ message: "Error updating offer", error: err.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    await offer.destroy();
    res.json({ message: "Offer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting offer", error: err.message });
  }
};
