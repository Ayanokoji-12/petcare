
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Producto = sequelize.define(
  "Producto",
  {
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },

    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    categoria: {
      type: DataTypes.STRING(80),
      allowNull: true
    },

    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },

    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },

    estado: {
      type: DataTypes.ENUM("Activo", "Inactivo"),
      defaultValue: "Activo"
    }
  },
  {
    tableName: "producto",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Producto;
