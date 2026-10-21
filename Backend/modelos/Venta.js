
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Venta = sequelize.define(
  "Venta",
  {
    id_venta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_empleado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    fecha: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },

   estado: {
  type: DataTypes.ENUM(
    "Pendiente",
    "Parcial",
    "Pagada",
    "Anulada"
  ),
  allowNull: false,
  defaultValue: "Pendiente"
},
  },
  {
    tableName: "venta",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Venta;
