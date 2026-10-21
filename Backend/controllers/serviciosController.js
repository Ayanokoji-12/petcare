
const servicioRepository = require(
  "../repositories/servicioRepository"
);

// ========================================
// VALIDAR DATOS DEL SERVICIO
// ========================================
function validarServicio(datos) {
  const { nombre, precio, estado } = datos;

  if (typeof nombre !== "string" || !nombre.trim()) {
    return "El nombre del servicio es obligatorio";
  }

  if (
    precio === null ||
    precio === undefined ||
    precio === "" ||
    !Number.isFinite(Number(precio)) ||
    Number(precio) < 0 ||
    !/^\d+(\.\d{1,2})?$/.test(String(precio))
  ) {
    return "El precio debe ser un número válido con máximo 2 decimales";
  }

  if (
    estado !== undefined &&
    !["Activo", "Inactivo"].includes(estado)
  ) {
    return "El estado no es válido";
  }

  return null;
}

// ========================================
// 1. LISTAR TODOS LOS SERVICIOS
// ========================================
exports.listarServicios = async (req, res) => {
  try {
    const servicios = await servicioRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Servicios obtenidos correctamente",
      total: servicios.length,
      datos: servicios
    });
  } catch (error) {
    console.error("Error al listar servicios:", error);

    return res.status(500).json({
      mensaje: "Error al listar servicios"
    });
  }
};

// ========================================
// 2. OBTENER SERVICIO POR ID
// ========================================
exports.obtenerServicio = async (req, res) => {
  try {
    const servicio = await servicioRepository.obtenerPorId(
      req.params.id
    );

    if (!servicio) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado"
      });
    }

    return res.status(200).json({
      datos: servicio
    });
  } catch (error) {
    console.error("Error al buscar servicio:", error);

    return res.status(500).json({
      mensaje: "Error al buscar servicio"
    });
  }
};

// ========================================
// 3. REGISTRAR SERVICIO
// ========================================
exports.crearServicio = async (req, res) => {
  try {
    const errorValidacion = validarServicio(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const servicio = await servicioRepository.crear({
      nombre: req.body.nombre.trim(),
      descripcion: req.body.descripcion || null,
      precio: Number(req.body.precio),
      estado: req.body.estado || "Activo"
    });

    return res.status(201).json({
      mensaje: "Servicio registrado correctamente",
      id_servicio: servicio.id_servicio
    });
  } catch (error) {
    console.error("Error al registrar servicio:", error);

    return res.status(500).json({
      mensaje: "Error al registrar servicio"
    });
  }
};

// ========================================
// 4. ACTUALIZAR SERVICIO
// ========================================
exports.actualizarServicio = async (req, res) => {
  try {
    const errorValidacion = validarServicio(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const servicio = await servicioRepository.actualizar(
      req.params.id,
      {
        nombre: req.body.nombre.trim(),
        descripcion: req.body.descripcion || null,
        precio: Number(req.body.precio),
        estado: req.body.estado || "Activo"
      }
    );

    if (!servicio) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Servicio actualizado correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);

    return res.status(500).json({
      mensaje: "Error al actualizar servicio"
    });
  }
};

// ========================================
// 5. ELIMINAR SERVICIO
// ========================================
exports.eliminarServicio = async (req, res) => {
  try {
    const eliminado = await servicioRepository.eliminar(
      req.params.id
    );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Servicio no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Servicio eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);

    if (
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(409).json({
        mensaje:
          "No se puede eliminar porque tiene citas o remisiones relacionadas"
      });
    }

    return res.status(500).json({
      mensaje: "Error al eliminar servicio"
    });
  }
};
