
const { Cliente } = require("../modelos/asociaciones");

// =====================================
// 1. LISTAR CLIENTES
// =====================================
const obtenerTodos = async () => {
  return Cliente.findAll({
    order: [["id_cliente", "DESC"]]
  });
};

// =====================================
// 2. OBTENER CLIENTE POR ID
// =====================================
const obtenerPorId = async (id) => {
  return Cliente.findByPk(id);
};

// =====================================
// 3. REGISTRAR CLIENTE
// =====================================
const crear = async (datos) => {
  return Cliente.create({
    nombres: datos.nombres,
    apellidos: datos.apellidos,
    dni: datos.dni || null,
    telefono: datos.telefono || null,
    correo: datos.correo || null,
    direccion: datos.direccion || null
  });
};

// =====================================
// 4. ACTUALIZAR CLIENTE
// =====================================
const actualizar = async (id, datos) => {
  const cliente = await Cliente.findByPk(id);

  if (!cliente) return null;

  await cliente.update({
    nombres: datos.nombres,
    apellidos: datos.apellidos,
    dni: datos.dni || null,
    telefono: datos.telefono || null,
    correo: datos.correo || null,
    direccion: datos.direccion || null
  });

  return cliente;
};

// =====================================
// 5. ELIMINAR CLIENTE
// =====================================
const eliminar = async (id) => {
  const cliente = await Cliente.findByPk(id);

  if (!cliente) return null;

  await cliente.destroy();

  return true;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
