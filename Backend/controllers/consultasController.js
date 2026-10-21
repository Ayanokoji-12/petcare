
const consultaRepository = require(
  "../repositories/consultaRepository"
);

// =====================================
// VALIDAR CONSULTA
// =====================================
function validarConsulta(datos) {
  const {
    id_cita,
    diagnostico,
    tratamiento,
    observaciones
  } = datos;

  if (
    !Number.isInteger(Number(id_cita)) ||
    Number(id_cita) <= 0
  ) {
    return "Debes seleccionar una cita válida";
  }

  if (
    typeof diagnostico !== "string" ||
    !diagnostico.trim()
  ) {
    return "El diagnóstico es obligatorio";
  }

  if (
    tratamiento != null &&
    typeof tratamiento !== "string"
  ) {
    return "El tratamiento debe ser texto";
  }

  if (
    observaciones != null &&
    typeof observaciones !== "string"
  ) {
    return "Las observaciones deben ser texto";
  }

  return null;
}

// =====================================
// 1. LISTAR CONSULTAS
// =====================================
exports.listarConsultas = async (req, res) => {
  try {
    const consultas = await consultaRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Consultas obtenidas correctamente",
      total: consultas.length,
      datos: consultas
    });

  } catch (error) {
    console.error("Error al listar consultas:", error);

    return res.status(500).json({
      mensaje: "Error al obtener las consultas"
    });
  }
};

// =====================================
// 2. BUSCAR CONSULTA POR ID
// =====================================
exports.obtenerConsulta = async (req, res) => {
  try {
    const consulta = await consultaRepository.obtenerPorId(
      req.params.id
    );

    if (!consulta) {
      return res.status(404).json({
        mensaje: "Consulta no encontrada"
      });
    }

    return res.status(200).json({
      datos: consulta
    });

  } catch (error) {
    console.error("Error al buscar consulta:", error);

    return res.status(500).json({
      mensaje: "Error al buscar la consulta"
    });
  }
};

// =====================================
// 3. REGISTRAR CONSULTA
// =====================================
exports.crearConsulta = async (req, res) => {
  try {
    const errorValidacion = validarConsulta(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const consulta =
      await consultaRepository.crearConTransaccion(req.body);

    return res.status(201).json({
      mensaje: "Consulta registrada correctamente",
      id_consulta: consulta.id_consulta,
      estado_cita: "Atendida"
    });

  } catch (error) {
    console.error("Error al registrar consulta:", error);

    if (error.status) {
      return res.status(error.status).json({
        mensaje: error.message
      });
    }

    const codigo = error.parent?.code || error.original?.code;

    if (
      codigo === "ER_DUP_ENTRY" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(409).json({
        mensaje: "La cita ya tiene una consulta registrada"
      });
    }

    return res.status(500).json({
      mensaje: "Error al registrar la consulta"
    });
  }
};

// =====================================
// 4. ACTUALIZAR CONSULTA
// =====================================

exports.actualizarConsulta = async (req, res) => {
  try {
    const {
      diagnostico,
      tratamiento,
      observaciones
    } = req.body;

    // Prohibir cambios de la cita asociada
    if (Object.prototype.hasOwnProperty.call(req.body, "id_cita")) {
      return res.status(400).json({
        mensaje: "No está permitido cambiar la cita de una consulta médica"
      });
    }

    // Validar diagnóstico
    if (
      typeof diagnostico !== "string" ||
      !diagnostico.trim()
    ) {
      return res.status(400).json({
        mensaje: "El diagnóstico es obligatorio"
      });
    }

    // Validar tratamiento
    if (
      tratamiento != null &&
      typeof tratamiento !== "string"
    ) {
      return res.status(400).json({
        mensaje: "El tratamiento debe ser texto"
      });
    }

    // Validar observaciones
    if (
      observaciones != null &&
      typeof observaciones !== "string"
    ) {
      return res.status(400).json({
        mensaje: "Las observaciones deben ser texto"
      });
    }

    const consulta = await consultaRepository.actualizar(
      req.params.id,
      {
        diagnostico,
        tratamiento,
        observaciones
      }
    );

    if (!consulta) {
      return res.status(404).json({
        mensaje: "Consulta no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Consulta actualizada correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar consulta:", error);

    return res.status(500).json({
      mensaje: "Error al actualizar la consulta"
    });
  }
};


// =====================================
// 5. ELIMINAR CONSULTA
// =====================================
exports.eliminarConsulta = async (req, res) => {
  try {
    const eliminado =
      await consultaRepository.eliminarConTransaccion(
        req.params.id
      );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Consulta no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Consulta eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar consulta:", error);

    return res.status(500).json({
      mensaje: "Error al eliminar la consulta"
    });
  }
};
