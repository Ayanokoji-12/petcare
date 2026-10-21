
const {
  Remision,
  Mascota,
  Servicio,
  Cliente,
  Empleado
} = require("../modelos/asociaciones");

// =====================================
// RELACIONES PARA LISTAR REMISIONES
// =====================================
const relaciones = [
  {
    model: Mascota,
    as: "mascotaInfo",
    required: true,
    include: [
      {
        model: Cliente,
        as: "cliente",
        required: true
      }
    ]
  },
  {
    model: Servicio,
    as: "servicioInfo",
    required: true
  }
];

// =====================================
// FORMATEAR RESPUESTA
// =====================================
function formatearRemision(registro) {
  const datos = registro.toJSON();

  const {
    mascotaInfo,
    servicioInfo,
    ...campos
  } = datos;

  const cliente = mascotaInfo?.cliente;

  return {
    ...campos,
    mascota: mascotaInfo?.nombre ?? null,
    servicio: servicioInfo?.nombre ?? null,
    propietario: cliente
      ? `${cliente.nombres} ${cliente.apellidos}`
      : null
  };
}

// =====================================
// 1. LISTAR REMISIONES
// =====================================
const obtenerTodos = async () => {
  const remisiones = await Remision.findAll({
    include: relaciones,
    order: [["id_remision", "DESC"]]
  });

  return remisiones.map(formatearRemision);
};

// =====================================
// 2. BUSCAR REMISION POR ID
// =====================================
const obtenerPorId = async (id) => {
  return await Remision.findByPk(id, {
    raw: true
  });
};

// =====================================
// 3. VERIFICAR RELACIONES
// =====================================
const verificarRelaciones = async (datos) => {
  const mascota = await Mascota.findByPk(datos.id_mascota);

  if (!mascota) {
    return "La mascota no existe";
  }

  const servicio = await Servicio.findByPk(datos.id_servicio);

  if (!servicio) {
    return "El servicio no existe";
  }

  if (datos.id_empleado_origen != null) {
    const empleado = await Empleado.findByPk(
      datos.id_empleado_origen
    );

    if (!empleado) {
      return "El empleado de origen no existe";
    }
  }

  return null;
};

// =====================================
// 4. CREAR REMISION
// =====================================
const crear = async (datos) => {
  return await Remision.create({
    id_mascota: datos.id_mascota,
    id_empleado_origen: datos.id_empleado_origen ?? null,
    id_servicio: datos.id_servicio,
    veterinario_origen: datos.veterinario_origen || null,
    telefono_contacto: datos.telefono_contacto || null,
    correo_profesional: datos.correo_profesional || null,
    motivo: datos.motivo.trim(),
    archivo_adjunto: datos.archivo_adjunto || null
  });
};

// =====================================
// 5. ACTUALIZAR REMISION
// =====================================
const actualizar = async (id, datos) => {
  const remision = await Remision.findByPk(id);

  if (!remision) {
    return null;
  }

  await remision.update({
    id_mascota: datos.id_mascota,
    id_empleado_origen: datos.id_empleado_origen ?? null,
    id_servicio: datos.id_servicio,
    veterinario_origen: datos.veterinario_origen || null,
    telefono_contacto: datos.telefono_contacto || null,
    correo_profesional: datos.correo_profesional || null,
    motivo: datos.motivo.trim(),
    archivo_adjunto: datos.archivo_adjunto || null
  });

  return remision;
};

// =====================================
// 6. ELIMINAR REMISION
// =====================================
const eliminar = async (id) => {
  const remision = await Remision.findByPk(id);

  if (!remision) {
    return false;
  }

  await remision.destroy();

  return true;
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  verificarRelaciones,
  crear,
  actualizar,
  eliminar
};
