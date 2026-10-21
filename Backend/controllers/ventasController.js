
const ventaRepository = require(
  "../repositories/ventaRepository"
);

// =====================================
// VALIDAR DATOS DE VENTA
// =====================================
function validarVenta(datos) {
  const { id_cliente, id_empleado, productos } = datos;

  if (
    !Number.isInteger(Number(id_cliente)) ||
    Number(id_cliente) <= 0
  ) {
    return "El cliente no es válido";
  }

  if (
    !Number.isInteger(Number(id_empleado)) ||
    Number(id_empleado) <= 0
  ) {
    return "El empleado no es válido";
  }

  if (
    !Array.isArray(productos) ||
    productos.length === 0
  ) {
    return "Debes agregar al menos un producto";
  }

  const ids = new Set();

  for (const producto of productos) {
    if (
      !Number.isInteger(Number(producto.id_producto)) ||
      Number(producto.id_producto) <= 0
    ) {
      return "El ID del producto no es válido";
    }

    if (
      !Number.isInteger(Number(producto.cantidad)) ||
      Number(producto.cantidad) <= 0
    ) {
      return "La cantidad debe ser un entero positivo";
    }

    const id = Number(producto.id_producto);

    if (ids.has(id)) {
      return "No repitas productos en una misma venta";
    }

    ids.add(id);
  }

  return null;
}

// =====================================
// 1. LISTAR VENTAS
// =====================================
exports.listarVentas = async (req, res) => {
  try {
    const ventas = await ventaRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Ventas obtenidas correctamente",
      total: ventas.length,
      datos: ventas
    });

  } catch (error) {
    console.error("Error al listar ventas:", error);

    return res.status(500).json({
      mensaje: "Error al obtener las ventas"
    });
  }
};

// =====================================
// 2. OBTENER VENTA POR ID
// =====================================
exports.obtenerVenta = async (req, res) => {
  try {
    const resultado = await ventaRepository.obtenerPorId(
      req.params.id
    );

    if (!resultado) {
      return res.status(404).json({
        mensaje: "Venta no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Venta encontrada",
      venta: resultado.venta,
      productos: resultado.productos
    });

  } catch (error) {
    console.error("Error al buscar venta:", error);

    return res.status(500).json({
      mensaje: "Error al obtener la venta"
    });
  }
};

// =====================================
// 3. CREAR VENTA
// =====================================
exports.crearVenta = async (req, res) => {
  try {
    const errorValidacion = validarVenta(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const resultado =
      await ventaRepository.crearConTransaccion(req.body);

    return res.status(201).json({
      mensaje: "Venta registrada correctamente",
      id_venta: resultado.id_venta,
      total: resultado.total,
      productos: resultado.productos
    });

  } catch (error) {
    console.error("Error al registrar venta:", error);

    if (error.status) {
      return res.status(error.status).json({
        mensaje: error.message
      });
    }

    return res.status(500).json({
      mensaje: "Error al registrar la venta"
    });
  }
};

// =====================================
// 4. ANULAR VENTA
// =====================================
exports.anularVenta = async (req, res) => {
  try {
    await ventaRepository.anularConTransaccion(
      req.params.id
    );

    return res.status(200).json({
      mensaje:
        "Venta anulada y stock restaurado correctamente"
    });

  } catch (error) {
    console.error("Error al anular venta:", error);

    if (error.status) {
      return res.status(error.status).json({
        mensaje: error.message
      });
    }

    return res.status(500).json({
      mensaje: "Error al anular la venta"
    });
  }
};
