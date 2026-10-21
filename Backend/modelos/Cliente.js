
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cliente = sequelize.define(
  "Cliente",
  {
    id_cliente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    dni: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true
    },

    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },

    correo: {
      type: DataTypes.STRING(120),
      allowNull: true
    },

    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },

    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "cliente",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Cliente;
