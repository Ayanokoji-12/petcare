
const { Mascota, Cliente, Especie } = require(
  "../modelos/asociaciones"
);

// Relaciones necesarias para las consultas
const relaciones = [
  {
    model: Cliente,
    as: "cliente",
    attributes: ["nombres", "apellidos"],
    required: true
  },
  {
    model: Especie,
    as: "especieInfo",
    attributes: ["nombre"],
    required: true
  }
];

// Mantener el formato JSON anterior
function formatearMascota(mascota) {
  if (!mascota) return null;

  const datos = mascota.toJSON();

  const { cliente, especieInfo, ...campos } = datos;

  return {
    ...campos,
    especie: especieInfo?.nombre ?? null,
    propietario: cliente
      ? `${cliente.nombres} ${cliente.apellidos}`
      : null
  };
}

// 1. Listar mascotas
const obtenerTodos = async () => {
  const mascotas = await Mascota.findAll({
    include: relaciones,
    order: [["id_mascota", "DESC"]]
  });

  return mascotas.map(formatearMascota);
};

// 2. Buscar mascota por ID
const obtenerPorId = async (id) => {
  const mascota = await Mascota.findByPk(id, {
    include: relaciones
  });

  return formatearMascota(mascota);
};

// 3. Buscar mascotas por cliente
const obtenerPorCliente = async (idCliente) => {
  const mascotas = await Mascota.findAll({
    where: { id_cliente: idCliente },
    include: relaciones,
    order: [["id_mascota", "DESC"]]
  });

  return mascotas.map(formatearMascota);
};

// 4. Verificar existencia de cliente
const existeCliente = async (id) => {
  return (await Cliente.findByPk(id)) !== null;
};

// 5. Verificar existencia de especie
const existeEspecie = async (id) => {
  return (await Especie.findByPk(id)) !== null;
};

// 6. Registrar mascota
const crear = async (datos) => {
  return await Mascota.create(datos);
};

// 7. Actualizar mascota
const actualizar = async (id, datos) => {
  const mascota = await Mascota.findByPk(id);

  if (!mascota) return null;

  await mascota.update(datos);

  return mascota;
};

// 8. Eliminar mascota
const eliminar = async (id) => {
  const mascota = await Mascota.findByPk(id);

  if (!mascota) return false;

  await mascota.destroy();

  return true;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerPorCliente,
  existeCliente,
  existeEspecie,
  crear,
  actualizar,
  eliminar
};
