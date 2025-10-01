const Member = require("../models/Member");

exports.createMember = async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: "Error creating member", error: err.message });
  }
};

exports.getMembers = async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Error fetching members", error: err.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    await member.update(req.body);
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Error updating member", error: err.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    await member.destroy();
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting member", error: err.message });
  }
};
