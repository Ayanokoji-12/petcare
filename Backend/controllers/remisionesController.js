
const remisionRepository = require(
  "../repositories/remisionRepository"
);

// =====================================
// VALIDAR DATOS
// =====================================
function validarRemision(datos) {
  const {
    id_mascota,
    id_servicio,
    id_empleado_origen,
    motivo
  } = datos;

  if (
    !Number.isInteger(Number(id_mascota)) ||
    Number(id_mascota) <= 0
  ) {
    return "La mascota no es válida";
  }

  if (
    !Number.isInteger(Number(id_servicio)) ||
    Number(id_servicio) <= 0
  ) {
    return "El servicio es obligatorio";
  }

  if (
    id_empleado_origen != null &&
    (
      !Number.isInteger(Number(id_empleado_origen)) ||
      Number(id_empleado_origen) <= 0
    )
  ) {
    return "El empleado de origen no es válido";
  }

  if (
    typeof motivo !== "string" ||
    !motivo.trim()
  ) {
    return "El motivo es obligatorio";
  }

  return null;
}

// =====================================
// 1. LISTAR REMISIONES
// =====================================
exports.listarRemisiones = async (req, res) => {
  try {
    const remisiones =
      await remisionRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Remisiones obtenidas correctamente",
      total: remisiones.length,
      datos: remisiones
    });

  } catch (error) {
    console.error("Error al listar remisiones:", error);

    return res.status(500).json({
      mensaje: "Error al listar remisiones"
    });
  }
};

// =====================================
// 2. OBTENER REMISION POR ID
// =====================================
exports.obtenerRemision = async (req, res) => {
  try {
    const remision =
      await remisionRepository.obtenerPorId(req.params.id);

    if (!remision) {
      return res.status(404).json({
        mensaje: "Remisión no encontrada"
      });
    }

    return res.status(200).json({
      datos: remision
    });

  } catch (error) {
    console.error("Error al buscar remisión:", error);

    return res.status(500).json({
      mensaje: "Error al buscar remisión"
    });
  }
};

// =====================================
// 3. CREAR REMISION
// =====================================
exports.crearRemision = async (req, res) => {
  try {
    const errorValidacion = validarRemision(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const errorRelacion =
      await remisionRepository.verificarRelaciones(req.body);

    if (errorRelacion) {
      return res.status(400).json({
        mensaje: errorRelacion
      });
    }

    const remision = await remisionRepository.crear(req.body);

    return res.status(201).json({
      mensaje: "Remisión registrada correctamente",
      id_remision: remision.id_remision
    });

  } catch (error) {
    console.error("Error al registrar remisión:", error);

    return res.status(500).json({
      mensaje: "Error al registrar remisión"
    });
  }
};

// =====================================
// 4. ACTUALIZAR REMISION
// =====================================
exports.actualizarRemision = async (req, res) => {
  try {
    const errorValidacion = validarRemision(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const errorRelacion =
      await remisionRepository.verificarRelaciones(req.body);

    if (errorRelacion) {
      return res.status(400).json({
        mensaje: errorRelacion
      });
    }

    const remision = await remisionRepository.actualizar(
      req.params.id,
      req.body
    );

    if (!remision) {
      return res.status(404).json({
        mensaje: "Remisión no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Remisión actualizada correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar remisión:", error);

    return res.status(500).json({
      mensaje: "Error al actualizar remisión"
    });
  }
};

// =====================================
// 5. ELIMINAR REMISION
// =====================================
exports.eliminarRemision = async (req, res) => {
  try {
    const eliminado =
      await remisionRepository.eliminar(req.params.id);

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Remisión no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Remisión eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar remisión:", error);

    return res.status(500).json({
      mensaje: "Error al eliminar remisión"
    });
  }
};
