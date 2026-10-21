
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pago = sequelize.define(
  "Pago",
  {
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },

    metodo_pago: {
      type: DataTypes.ENUM(
        "Efectivo",
        "Yape",
        "Plin",
        "Tarjeta",
        "Transferencia"
      ),
      allowNull: false
    },

    referencia: {
      type: DataTypes.STRING(120),
      allowNull: true
    },

    fecha_pago: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    estado: {
      type: DataTypes.ENUM(
        "Confirmado",
        "Anulado"
      ),
      allowNull: false,
      defaultValue: "Confirmado"
    }
  },
  {
    tableName: "pago",
    timestamps: false,
    freezeTableName: true
  }
);


module.exports = Pago;
