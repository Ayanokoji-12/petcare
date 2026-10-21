
const { Especie } = require("../modelos/asociaciones");

// ========================================
// 1. LISTAR TODAS LAS ESPECIES
// ========================================
const obtenerTodos = async () => {
  return Especie.findAll({
    order: [["id_especie", "DESC"]]
  });
};

// ========================================
// 2. OBTENER ESPECIE POR ID
// ========================================
const obtenerPorId = async (id) => {
  return Especie.findByPk(id);
};

// ========================================
// 3. REGISTRAR ESPECIE
// ========================================
const crear = async (datos) => {
  return Especie.create({
    nombre: datos.nombre
  });
};

// ========================================
// 4. ACTUALIZAR ESPECIE
// ========================================
const actualizar = async (id, datos) => {
  const especie = await Especie.findByPk(id);

  if (!especie) {
    return null;
  }

  await especie.update({
    nombre: datos.nombre
  });

  return especie;
};

// ========================================
// 5. ELIMINAR ESPECIE
// ========================================
const eliminar = async (id) => {
  const especie = await Especie.findByPk(id);

  if (!especie) {
    return null;
  }

  await especie.destroy();

  return true;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};
