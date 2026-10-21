
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Mascota = sequelize.define(
  "Mascota",
  {
    id_mascota: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    id_especie: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    raza: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    sexo: {
      type: DataTypes.ENUM("Macho", "Hembra"),
      allowNull: true
    },

    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    peso: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true
    },

    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: "mascota",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Mascota;
