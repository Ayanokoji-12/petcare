const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define(
  "Usuario",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    id_empleado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    correo: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },

    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    rol: {
      type: DataTypes.ENUM(
        "Administrador",
        "Veterinario",
        "Recepcionista"
      ),
      allowNull: false
    },

    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo"),
      defaultValue: "Activo"
    }
  },
  {
    tableName: "usuario",
    timestamps: false
  }
);

module.exports = Usuario;