
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Consulta = sequelize.define(
  "Consulta",
  {
    id_consulta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_cita: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },

    diagnostico: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    tratamiento: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    fecha_consulta: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "consulta",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Consulta;
