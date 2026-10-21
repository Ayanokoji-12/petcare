
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Servicio = sequelize.define(
  "Servicio",
  {
    id_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },

    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo"),
      allowNull: true,
      defaultValue: "Activo"
    }
  },
  {
    tableName: "servicio",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Servicio;
