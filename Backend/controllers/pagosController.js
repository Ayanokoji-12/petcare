
const pagoRepository = require(
  "../repositories/pagoRepository"
);

const metodosPermitidos = [
  "Efectivo",
  "Yape",
  "Plin",
  "Tarjeta",
  "Transferencia"
];

function validarPago(datos) {
  if (
    !Number.isSafeInteger(Number(datos.id_venta)) ||
    Number(datos.id_venta) <= 0
  ) {
    return "La venta no es válida";
  }

  const monto = Number(datos.monto);

  if (
    datos.monto === null ||
    datos.monto === undefined ||
    datos.monto === "" ||
    !Number.isFinite(monto) ||
    monto <= 0 ||
    !Number.isInteger(monto * 100)
  ) {
    return "El monto debe ser positivo y tener máximo dos decimales";
  }

  if (!metodosPermitidos.includes(datos.metodo_pago)) {
    return "Método de pago no válido";
  }

  if (
    datos.referencia != null &&
    (
      typeof datos.referencia !== "string" ||
      datos.referencia.length > 120
    )
  ) {
    return "La referencia no es válida";
  }

  return null;
}

// LISTAR PAGOS
exports.listarPagos = async (req, res) => {
  try {
    const pagos = await pagoRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Pagos obtenidos correctamente",
      total: pagos.length,
      datos: pagos
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al listar pagos"
    });
  }
};

// OBTENER PAGO
exports.obtenerPago = async (req, res) => {
  try {
    const pago = await pagoRepository.obtenerPorId(
      req.params.id
    );

    if (!pago) {
      return res.status(404).json({
        mensaje: "Pago no encontrado"
      });
    }

    return res.status(200).json({
      datos: pago
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensaje: "Error al obtener pago"
    });
  }
};


// =====================================
// REGISTRAR PAGO
// =====================================
exports.crearPago = async (req, res) => {
  try {
    const errorValidacion = validarPago(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const resultado = await pagoRepository.crear(
      req.body
    );

    return res.status(201).json({
      mensaje: "Pago registrado correctamente",
      pago: resultado.pago,
      venta: resultado.resumen
    });

  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      mensaje: error.status
        ? error.message
        : "Error al registrar pago"
    });
  }
};

// =====================================
// ANULAR PAGO
// =====================================
exports.anularPago = async (req, res) => {
  try {
    const resultado = await pagoRepository.anular(
      req.params.id
    );

    return res.status(200).json({
      mensaje: "Pago anulado correctamente",
      pago: resultado.pago,
      venta: resultado.resumen
    });

  } catch (error) {
    console.error(error);

    return res.status(error.status || 500).json({
      mensaje: error.status
        ? error.message
        : "Error al anular pago"
    });
  }
};
