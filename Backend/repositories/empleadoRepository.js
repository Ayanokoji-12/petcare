
const { Empleado } = require("../modelos/asociaciones");

// ========================================
// 1. LISTAR TODOS LOS EMPLEADOS
// ========================================
const obtenerTodos = async () => {
  return Empleado.findAll({
    order: [["id_empleado", "DESC"]]
  });
};

// ========================================
// 2. OBTENER EMPLEADO POR ID
// ========================================
const obtenerPorId = async (id) => {
  return Empleado.findByPk(id);
};

// ========================================
// 3. REGISTRAR EMPLEADO
// ========================================
const crear = async (datos) => {
  return Empleado.create({
    nombres: datos.nombres,
    apellidos: datos.apellidos,
    cargo: datos.cargo,
    especialidad: datos.especialidad || null,
    telefono: datos.telefono || null,
    correo: datos.correo || null,
    estado: datos.estado || "Activo"
  });
};

// ========================================
// 4. ACTUALIZAR EMPLEADO
// ========================================
const actualizar = async (id, datos) => {
  const empleado = await Empleado.findByPk(id);

  if (!empleado) {
    return null;
  }

  await empleado.update({
    nombres: datos.nombres,
    apellidos: datos.apellidos,
    cargo: datos.cargo,
    especialidad: datos.especialidad || null,
    telefono: datos.telefono || null,
    correo: datos.correo || null,
    estado: datos.estado || "Activo"
  });

  return empleado;
};

// ========================================
// 5. ELIMINAR EMPLEADO
// ========================================
const eliminar = async (id) => {
  const empleado = await Empleado.findByPk(id);

  if (!empleado) {
    return null;
  }

  await empleado.destroy();

  return true;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
