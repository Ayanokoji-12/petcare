
const clienteRepository = require(
  "../repositories/clienteRepository"
);

// =====================================
// VALIDACIONES
// =====================================
function validarCliente(datos) {
  if (
    typeof datos.nombres !== "string" ||
    !datos.nombres.trim() ||
    typeof datos.apellidos !== "string" ||
    !datos.apellidos.trim()
  ) {
    return "Nombres y apellidos son obligatorios";
  }

  return null;
}

function prepararDatos(datos) {
  return {
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    dni: datos.dni || null,
    telefono: datos.telefono || null,
    correo: datos.correo || null,
    direccion: datos.direccion || null
  };
}

function manejarError(res, error, mensaje) {
  console.error(mensaje, error);

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      mensaje: "El DNI ya está registrado"
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      mensaje: "No puedes eliminar este cliente porque tiene registros relacionados"
    });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      mensaje: "Los datos del cliente no son válidos"
    });
  }

  return res.status(500).json({
    mensaje
  });
}

// =====================================
// 1. LISTAR CLIENTES
// =====================================
exports.listarClientes = async (req, res) => {
  try {
    const clientes = await clienteRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Clientes obtenidos correctamente",
      total: clientes.length,
      datos: clientes
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al obtener los clientes"
    );
  }
};

// =====================================
// 2. OBTENER CLIENTE
// =====================================
exports.obtenerCliente = async (req, res) => {
  try {
    const cliente = await clienteRepository.obtenerPorId(
      req.params.id
    );

    if (!cliente) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado"
      });
    }

    return res.status(200).json({
      datos: cliente
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al buscar cliente"
    );
  }
};

// =====================================
// 3. REGISTRAR CLIENTE
// =====================================
exports.crearCliente = async (req, res) => {
  try {
    const errorValidacion = validarCliente(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const cliente = await clienteRepository.crear(
      prepararDatos(req.body)
    );

    return res.status(201).json({
      mensaje: "Cliente registrado correctamente",
      id_cliente: cliente.id_cliente
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al registrar cliente"
    );
  }
};

// =====================================
// 4. ACTUALIZAR CLIENTE
// =====================================
exports.actualizarCliente = async (req, res) => {
  try {
    const errorValidacion = validarCliente(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const cliente = await clienteRepository.actualizar(
      req.params.id,
      prepararDatos(req.body)
    );

    if (!cliente) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Cliente actualizado correctamente"
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al actualizar cliente"
    );
  }
};

// =====================================
// 5. ELIMINAR CLIENTE
// =====================================
exports.eliminarCliente = async (req, res) => {
  try {
    const eliminado = await clienteRepository.eliminar(
      req.params.id
    );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Cliente no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Cliente eliminado correctamente"
    });
  } catch (error) {
    return manejarError(
      res,
      error,
      "Error al eliminar cliente"
    );
  }
};
