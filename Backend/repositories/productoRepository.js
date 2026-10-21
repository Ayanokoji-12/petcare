
const { Op } = require("sequelize");
const Producto = require("../modelos/Producto");

// 1. Listar todos los productos
const obtenerTodos = async () => {
  return await Producto.findAll({
    order: [["id_producto", "DESC"]],
    raw: true
  });
};

// 2. Buscar producto por ID
const obtenerPorId = async (id) => {
  return await Producto.findByPk(id, {
    raw: true
  });
};

// 3. Crear producto
const crear = async (datos) => {
  return await Producto.create(datos);
};

// 4. Actualizar producto
const actualizar = async (id, datos) => {
  const producto = await Producto.findByPk(id);

  if (!producto) {
    return null;
  }

  await producto.update(datos);

  return producto;
};

// 5. Eliminar producto
const eliminar = async (id) => {
  const producto = await Producto.findByPk(id);

  if (!producto) {
    return false;
  }

  await producto.destroy();

  return true;
};

// 6. Productos con stock bajo
const obtenerStockBajo = async (limite = 5) => {
  return await Producto.findAll({
    where: {
      stock: {
        [Op.lte]: limite
      }
    },
    order: [["stock", "ASC"]],
    raw: true
  });
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerStockBajo
};
