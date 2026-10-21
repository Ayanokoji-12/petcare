
const especieRepository = require(
  "../repositories/especieRepository"
);

// ========================================
// VALIDAR ESPECIE
// ========================================
function validarEspecie(datos) {
  if (
    typeof datos.nombre !== "string" ||
    !datos.nombre.trim()
  ) {
    return "El nombre de la especie es obligatorio";
  }

  return null;
}

// ========================================
// MANEJAR ERRORES
// ========================================
function manejarError(res, error, mensaje) {
  console.error(mensaje, error);

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      mensaje:
        "No se puede eliminar la especie porque tiene mascotas relacionadas"
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      mensaje: "La especie ya está registrada"
    });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      mensaje: "Los datos de la especie no son válidos"
    });
  }

  return res.status(500).json({
    mensaje
  });
}

// ========================================
// 1. LISTAR ESPECIES
// ========================================
exports.listarEspecies = async (req, res) => {
  try {
    const especies = await especieRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Especies obtenidas correctamente",
      total: especies.length,
      datos: especies
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al listar especies"
    );
  }
};

// ========================================
// 2. OBTENER ESPECIE POR ID
// ========================================
exports.obtenerEspecie = async (req, res) => {
  try {
    const especie = await especieRepository.obtenerPorId(
      req.params.id
    );

    if (!especie) {
      return res.status(404).json({
        mensaje: "Especie no encontrada"
      });
    }

    return res.status(200).json({
      datos: especie
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al buscar especie"
    );
  }
};

// ========================================
// 3. REGISTRAR ESPECIE
// ========================================
exports.crearEspecie = async (req, res) => {
  try {
    const errorValidacion = validarEspecie(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const especie = await especieRepository.crear({
      nombre: req.body.nombre.trim()
    });

    return res.status(201).json({
      mensaje: "Especie registrada correctamente",
      id_especie: especie.id_especie
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al registrar especie"
    );
  }
};

// ========================================
// 4. ACTUALIZAR ESPECIE
// ========================================
exports.actualizarEspecie = async (req, res) => {
  try {
    const errorValidacion = validarEspecie(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const especie = await especieRepository.actualizar(
      req.params.id,
      {
        nombre: req.body.nombre.trim()
      }
    );

    if (!especie) {
      return res.status(404).json({
        mensaje: "Especie no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Especie actualizada correctamente"
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al actualizar especie"
    );
  }
};

// ========================================
// 5. ELIMINAR ESPECIE
// ========================================
exports.eliminarEspecie = async (req, res) => {
  try {
    const eliminado = await especieRepository.eliminar(
      req.params.id
    );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Especie no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Especie eliminada correctamente"
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al eliminar especie"
    );
  }
};
