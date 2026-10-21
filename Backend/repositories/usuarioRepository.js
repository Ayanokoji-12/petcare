
const {
  Usuario,
  Empleado
} = require("../modelos/asociaciones");

// ====================================
// BUSCAR USUARIO POR CORREO
// ====================================
const buscarPorCorreo = async (correo) => {
  return await Usuario.findOne({
    where: { correo },
    include: [
      {
        model: Empleado,
        as: "empleadoInfo",
        required: true
      }
    ]
  });
};

// ====================================
// BUSCAR USUARIO POR ID
// ====================================
const buscarPorId = async (id_usuario) => {
  return await Usuario.findByPk(id_usuario, {
    include: [
      {
        model: Empleado,
        as: "empleadoInfo",
        required: true
      }
    ]
  });
};

module.exports = {
  buscarPorCorreo,
  buscarPorId
};
