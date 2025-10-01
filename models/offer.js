const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Offer = sequelize.define("Offer", {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: DataTypes.STRING
});

module.exports = Offer;
