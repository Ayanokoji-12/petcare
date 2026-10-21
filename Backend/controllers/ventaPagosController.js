
const ventaRepository = require(
  "../repositories/ventaRepository"
);

// =====================================
// CONSULTAR HISTORIAL DE PAGOS
// =====================================
exports.obtenerHistorialPagos = async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number.isSafeInteger(Number(id)) ||
        Number(id) <= 0) {
      return res.status(400).json({
        mensaje: "ID de venta inválido"
      });
    }

    const resultado =
      await ventaRepository.obtenerHistorialPagos(id);

    return res.status(200).json({
      mensaje: "Historial obtenido correctamente",
      datos: resultado
    });

  } catch (error) {
    console.error("Error al consultar pagos:", error);

    return res.status(error.status || 500).json({
      mensaje: error.status
        ? error.message
        : "Error al consultar el historial de pagos"
    });
  }
};
