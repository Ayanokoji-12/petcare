
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Remision = sequelize.define(
  "Remision",
  {
    id_remision: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_mascota: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_empleado_origen: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    veterinario_origen: {
      type: DataTypes.STRING(150),
      allowNull: true
    },

    telefono_contacto: {
      type: DataTypes.STRING(20),
      allowNull: true
    },

    correo_profesional: {
      type: DataTypes.STRING(120),
      allowNull: true
    },

    motivo: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    archivo_adjunto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    estado: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Pendiente"
    },

    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "remision",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Remision;
