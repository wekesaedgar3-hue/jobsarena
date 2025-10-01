// models/Popup.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Popup = sequelize.define("Popup", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING, // optional: for popup images
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // only show active popups
  },
}, {
  tableName: "popups",
  timestamps: true,
});

module.exports = Popup;

