
const { Servicio } = require("../modelos/asociaciones");

// =====================================
// 1. LISTAR TODOS LOS SERVICIOS
// =====================================
const obtenerTodos = async () => {
  return Servicio.findAll({
    order: [["id_servicio", "DESC"]]
  });
};

// =====================================
// 2. OBTENER SERVICIO POR ID
// =====================================
const obtenerPorId = async (id) => {
  return Servicio.findByPk(id);
};

// =====================================
// 3. CREAR SERVICIO
// =====================================
const crear = async (datos) => {
  return Servicio.create({
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    precio: datos.precio,
    estado: datos.estado || "Activo"
  });
};

// =====================================
// 4. ACTUALIZAR SERVICIO
// =====================================
const actualizar = async (id, datos) => {
  const servicio = await Servicio.findByPk(id);

  if (!servicio) {
    return null;
  }

  await servicio.update({
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    precio: datos.precio,
    estado: datos.estado || "Activo"
  });

  return servicio;
};

// =====================================
// 5. ELIMINAR SERVICIO
// =====================================
const eliminar = async (id) => {
  const servicio = await Servicio.findByPk(id);

  if (!servicio) {
    return null;
  }

  await servicio.destroy();

  return true;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
