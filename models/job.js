const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define("Job", {
  title: DataTypes.STRING,
  company: DataTypes.STRING,
  category: DataTypes.STRING,
  description: DataTypes.TEXT
});

module.exports = Job;
