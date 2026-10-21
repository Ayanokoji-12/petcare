const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Especie = sequelize.define(
  "Especie",
  {
    id_especie: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: "especie",
    timestamps: false
  }
);

module.exports = Especie;