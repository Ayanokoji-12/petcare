
const citaRepository = require(
  "../repositories/citaRepository"
);

// =====================================
// VALIDAR DATOS DE UNA CITA
// =====================================
function validarCita(datos) {
  const {
    id_mascota,
    id_empleado,
    id_servicio,
    fecha,
    estado
  } = datos;

  if (
    !Number.isInteger(Number(id_mascota)) ||
    Number(id_mascota) <= 0
  ) {
    return "Selecciona una mascota válida";
  }

  if (
    !Number.isInteger(Number(id_servicio)) ||
    Number(id_servicio) <= 0
  ) {
    return "Selecciona un servicio válido";
  }

  if (
    id_empleado != null &&
    id_empleado !== "" &&
    (
      !Number.isInteger(Number(id_empleado)) ||
      Number(id_empleado) <= 0
    )
  ) {
    return "El veterinario no es válido";
  }

  if (
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fecha)
  ) {
    return "La fecha debe tener formato YYYY-MM-DD HH:MM:SS";
  }

  const estados = [
    "Pendiente",
    "Confirmada",
    "Atendida",
    "Cancelada"
  ];

  if (
    estado !== undefined &&
    !estados.includes(estado)
  ) {
    return "El estado de la cita no es válido";
  }

  return null;
}

// =====================================
// PREPARAR DATOS
// =====================================
function prepararDatos(datos) {
  return {
    id_mascota: Number(datos.id_mascota),
    id_empleado: datos.id_empleado
      ? Number(datos.id_empleado)
      : null,
    id_servicio: Number(datos.id_servicio),
    fecha: datos.fecha,
    motivo: datos.motivo || null,
    estado: datos.estado ?? "Pendiente"
  };
}

// =====================================
// VERIFICAR RELACIONES
// =====================================
async function verificarRelaciones(datos) {
  const mascotaExiste =
    await citaRepository.existeMascota(datos.id_mascota);

  if (!mascotaExiste) {
    return "La mascota no existe";
  }

  const servicioExiste =
    await citaRepository.existeServicioActivo(datos.id_servicio);

  if (!servicioExiste) {
    return "El servicio no existe o está inactivo";
  }

  if (
    datos.id_empleado != null &&
    datos.id_empleado !== ""
  ) {
    const empleadoExiste =
      await citaRepository.existeEmpleadoActivo(
        datos.id_empleado
      );

    if (!empleadoExiste) {
      return "El empleado no existe o está inactivo";
    }
  }

  return null;
}

// =====================================
// 1. LISTAR CITAS
// =====================================
exports.listarCitas = async (req, res) => {
  try {
    const citas = await citaRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Citas obtenidas correctamente",
      total: citas.length,
      datos: citas
    });

  } catch (error) {
    console.error("Error al listar citas:", error);

    return res.status(500).json({
      mensaje: "Error al obtener las citas"
    });
  }
};

// =====================================
// 2. BUSCAR CITA POR ID
// =====================================
exports.obtenerCita = async (req, res) => {
  try {
    const cita = await citaRepository.obtenerPorId(
      req.params.id
    );

    if (!cita) {
      return res.status(404).json({
        mensaje: "Cita no encontrada"
      });
    }

    return res.status(200).json({
      datos: cita
    });

  } catch (error) {
    console.error("Error al buscar cita:", error);

    return res.status(500).json({
      mensaje: "Error al buscar la cita"
    });
  }
};

// =====================================
// 3. REGISTRAR CITA
// =====================================
exports.crearCita = async (req, res) => {
  try {
    const errorValidacion = validarCita(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const errorRelacion = await verificarRelaciones(req.body);

    if (errorRelacion) {
      return res.status(400).json({
        mensaje: errorRelacion
      });
    }

    const cita = await citaRepository.crear(
      prepararDatos(req.body)
    );

    return res.status(201).json({
      mensaje: "Cita registrada correctamente",
      id_cita: cita.id_cita
    });

  } catch (error) {
    console.error("Error al crear cita:", error);

    return res.status(500).json({
      mensaje: "Error al registrar la cita"
    });
  }
};

// =====================================
// 4. ACTUALIZAR CITA
// =====================================
exports.actualizarCita = async (req, res) => {
  try {
    const errorValidacion = validarCita(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const errorRelacion = await verificarRelaciones(req.body);

    if (errorRelacion) {
      return res.status(400).json({
        mensaje: errorRelacion
      });
    }

    const cita = await citaRepository.actualizar(
      req.params.id,
      prepararDatos(req.body)
    );

    if (!cita) {
      return res.status(404).json({
        mensaje: "Cita no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Cita actualizada correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar cita:", error);

    return res.status(500).json({
      mensaje: "Error al actualizar la cita"
    });
  }
};

// =====================================
// 5. ELIMINAR CITA
// =====================================
exports.eliminarCita = async (req, res) => {
  try {
    const eliminado = await citaRepository.eliminar(
      req.params.id
    );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Cita no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Cita eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar cita:", error);

    const codigo =
      error.parent?.code || error.original?.code;

    if (
      codigo === "ER_ROW_IS_REFERENCED_2" ||
      codigo === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        mensaje:
          "No se puede eliminar esta cita porque tiene una consulta médica relacionada"
      });
    }

    return res.status(500).json({
      mensaje: "Error al eliminar la cita"
    });
  }
};
