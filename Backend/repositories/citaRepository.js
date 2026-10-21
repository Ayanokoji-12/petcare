
const {
  Cita,
  Mascota,
  Cliente,
  Servicio,
  Empleado
} = require("../modelos/asociaciones");

// =====================================
// RELACIONES PARA MOSTRAR DATOS
// =====================================
const relaciones = [
  {
    model: Mascota,
    as: "mascotaInfo",
    attributes: ["nombre", "id_cliente"],
    required: true,
    include: [
      {
        model: Cliente,
        as: "cliente",
        attributes: ["nombres", "apellidos"],
        required: true
      }
    ]
  },
  {
    model: Servicio,
    as: "servicioInfo",
    attributes: ["nombre"],
    required: true
  },
  {
    model: Empleado,
    as: "empleadoInfo",
    attributes: ["nombres", "apellidos"],
    required: false
  }
];

// =====================================
// FORMATEAR RESPUESTA
// =====================================
function formatearCita(cita, incluirPropietario = true) {
  if (!cita) return null;

  const datos = cita.toJSON();

  const {
    mascotaInfo,
    servicioInfo,
    empleadoInfo,
    ...campos
  } = datos;

  const resultado = {
    ...campos,
    mascota: mascotaInfo?.nombre ?? null,
    servicio: servicioInfo?.nombre ?? null,
    veterinario: empleadoInfo
      ? `${empleadoInfo.nombres} ${empleadoInfo.apellidos}`
      : null
  };

  if (incluirPropietario) {
    const cliente = mascotaInfo?.cliente;

    resultado.propietario = cliente
      ? `${cliente.nombres} ${cliente.apellidos}`
      : null;
  }

  return resultado;
}

// =====================================
// 1. LISTAR CITAS
// =====================================
const obtenerTodos = async () => {
  const citas = await Cita.findAll({
    include: relaciones,
    order: [["fecha", "DESC"]]
  });

  return citas.map(cita => formatearCita(cita));
};

// =====================================
// 2. OBTENER CITA POR ID
// =====================================
const obtenerPorId = async (id) => {
  const cita = await Cita.findByPk(id, {
    include: relaciones
  });

  // La consulta original por ID no devolvía propietario
  return formatearCita(cita, false);
};

// =====================================
// 3. VERIFICAR RELACIONES
// =====================================
const existeMascota = async (id) => {
  return (await Mascota.findByPk(id)) !== null;
};

const existeServicioActivo = async (id) => {
  return (await Servicio.findOne({
    where: {
      id_servicio: id,
      estado: "Activo"
    }
  })) !== null;
};

const existeEmpleadoActivo = async (id) => {
  return (await Empleado.findOne({
    where: {
      id_empleado: id,
      estado: "Activo"
    }
  })) !== null;
};

// =====================================
// 4. CREAR CITA
// =====================================
const crear = async (datos) => {
  return await Cita.create(datos);
};

// =====================================
// 5. ACTUALIZAR CITA
// =====================================
const actualizar = async (id, datos) => {
  const cita = await Cita.findByPk(id);

  if (!cita) return null;

  await cita.update(datos);

  return cita;
};

// =====================================
// 6. ELIMINAR CITA
// =====================================
const eliminar = async (id) => {
  const cita = await Cita.findByPk(id);

  if (!cita) return false;

  await cita.destroy();

  return true;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  existeMascota,
  existeServicioActivo,
  existeEmpleadoActivo,
  crear,
  actualizar,
  eliminar
};
