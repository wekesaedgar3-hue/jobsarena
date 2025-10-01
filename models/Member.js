const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Member = sequelize.define("Member", {
  name: DataTypes.STRING,
  role: DataTypes.STRING
});

module.exports = Member;
