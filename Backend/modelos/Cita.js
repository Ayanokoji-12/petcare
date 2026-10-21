
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cita = sequelize.define(
  "Cita",
  {
    id_cita: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_mascota: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_empleado: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },

    motivo: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    estado: {
      type: DataTypes.ENUM(
        "Pendiente",
        "Confirmada",
        "Atendida",
        "Cancelada"
      ),
      allowNull: true,
      defaultValue: "Pendiente"
    }
  },
  {
    tableName: "cita",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Cita;
