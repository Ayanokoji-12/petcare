
const empleadoRepository = require(
  "../repositories/empleadoRepository"
);

// ========================================
// VALIDAR DATOS DEL EMPLEADO
// ========================================
function validarEmpleado(datos) {
  const {
    nombres,
    apellidos,
    cargo,
    estado
  } = datos;

  if (
    typeof nombres !== "string" ||
    !nombres.trim()
  ) {
    return "Los nombres del empleado son obligatorios";
  }

  if (
    typeof apellidos !== "string" ||
    !apellidos.trim()
  ) {
    return "Los apellidos del empleado son obligatorios";
  }

  if (
    typeof cargo !== "string" ||
    !cargo.trim()
  ) {
    return "El cargo del empleado es obligatorio";
  }

  if (
    estado !== undefined &&
    !["Activo", "Inactivo"].includes(estado)
  ) {
    return "El estado debe ser Activo o Inactivo";
  }

  return null;
}

// ========================================
// PREPARAR DATOS
// ========================================
function prepararDatos(datos) {
  return {
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    cargo: datos.cargo.trim(),
    especialidad: datos.especialidad || null,
    telefono: datos.telefono || null,
    correo: datos.correo || null,
    estado: datos.estado || "Activo"
  };
}

// ========================================
// MANEJAR ERRORES
// ========================================
function manejarError(res, error, mensaje) {
  console.error(mensaje, error);

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      mensaje: "El correo electrónico ya está registrado"
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      mensaje:
        "No se puede eliminar el empleado porque tiene registros relacionados"
    });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      mensaje: "Los datos del empleado no son válidos"
    });
  }

  return res.status(500).json({
    mensaje
  });
}

// ========================================
// 1. LISTAR TODOS LOS EMPLEADOS
// ========================================
exports.listarEmpleados = async (req, res) => {
  try {
    const empleados = await empleadoRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Empleados obtenidos correctamente",
      total: empleados.length,
      datos: empleados
    });

  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al listar empleados"
    );
  }
};

// ========================================
// 2. OBTENER EMPLEADO POR ID
// ========================================
exports.obtenerEmpleado = async (req, res) => {
  try {
    const empleado = await empleadoRepository.obtenerPorId(
      req.params.id
    );

    if (!empleado) {
      return res.status(404).json({
        mensaje: "Empleado no encontrado"
      });
    }

    return res.status(200).json({
      datos: empleado
    });

  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al buscar empleado"
    );
  }
};

// ========================================
// 3. REGISTRAR EMPLEADO
// ========================================
exports.crearEmpleado = async (req, res) => {
  try {
    const errorValidacion = validarEmpleado(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const empleado = await empleadoRepository.crear(
      prepararDatos(req.body)
    );

    return res.status(201).json({
      mensaje: "Empleado registrado correctamente",
      id_empleado: empleado.id_empleado
    });

  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al registrar empleado"
    );
  }
};

// ========================================
// 4. ACTUALIZAR EMPLEADO
// ========================================
exports.actualizarEmpleado = async (req, res) => {
  try {
    const errorValidacion = validarEmpleado(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const empleado = await empleadoRepository.actualizar(
      req.params.id,
      prepararDatos(req.body)
    );

    if (!empleado) {
      return res.status(404).json({
        mensaje: "Empleado no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Empleado actualizado correctamente"
    });

  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al actualizar empleado"
    );
  }
};

// ========================================
// 5. ELIMINAR EMPLEADO
// ========================================
exports.eliminarEmpleado = async (req, res) => {
  try {
    const eliminado = await empleadoRepository.eliminar(
      req.params.id
    );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Empleado no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Empleado eliminado correctamente"
    });

  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al eliminar empleado"
    );
  }
};
