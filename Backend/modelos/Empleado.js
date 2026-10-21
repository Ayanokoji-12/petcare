
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Empleado = sequelize.define(
  "Empleado",
  {
    id_empleado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false
    },

    cargo: {
      type: DataTypes.STRING(80),
      allowNull: false
    },

    especialidad: {
      type: DataTypes.STRING(100),
      allowNull: true
    },

    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },

    correo: {
      type: DataTypes.STRING(120),
      allowNull: true,
      unique: true
    },

    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo"),
      allowNull: true,
      defaultValue: "Activo"
    }
  },
  {
    tableName: "empleado",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Empleado;
