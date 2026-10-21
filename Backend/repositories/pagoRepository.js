
const sequelize = require("../config/database");

const {
  Pago,
  Venta
} = require("../modelos/asociaciones");

// =====================================
// ERRORES CONTROLADOS
// =====================================
function errorPago(mensaje, status = 400) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// =====================================
// CONVERTIR MONTOS A CÉNTIMOS
// =====================================
function aCentimos(valor) {
  const texto = String(valor);

  if (!/^\d+(\.\d{1,2})?$/.test(texto)) {
    throw errorPago(
      "El monto debe tener como máximo dos decimales"
    );
  }

  const [soles, decimales = ""] = texto.split(".");

  const centimos =
    Number(soles) * 100 +
    Number(decimales.padEnd(2, "0"));

  if (!Number.isSafeInteger(centimos)) {
    throw errorPago("Monto fuera del rango permitido");
  }

  return centimos;
}

// =====================================
// CALCULAR TOTAL PAGADO
// =====================================
async function calcularPagado(idVenta, transaction) {
  const pagos = await Pago.findAll({
    where: {
      id_venta: idVenta,
      estado: "Confirmado"
    },
    transaction
  });

  return pagos.reduce(
    (total, pago) => total + aCentimos(pago.monto),
    0
  );
}

// =====================================
// ACTUALIZAR ESTADO DE LA VENTA
// =====================================
async function actualizarEstadoVenta(venta, transaction) {
  const total = aCentimos(venta.total);

  const pagado = await calcularPagado(
    venta.id_venta,
    transaction
  );

  let estado = "Pendiente";

  if (pagado > 0 && pagado < total) {
    estado = "Parcial";
  }

  if (pagado === total) {
    estado = "Pagada";
  }

  if (pagado > total) {
    throw errorPago(
      "Los pagos superan el total de la venta"
    );
  }

  await venta.update(
    { estado },
    { transaction }
  );

  return {
    estado,
    total: total / 100,
    pagado: pagado / 100,
    pendiente: (total - pagado) / 100
  };
}

// =====================================
// 1. LISTAR PAGOS
// =====================================
const obtenerTodos = async () => {
  return Pago.findAll({
    order: [["id_pago", "DESC"]]
  });
};

// =====================================
// 2. OBTENER PAGO POR ID
// =====================================
const obtenerPorId = async (id) => {
  return Pago.findByPk(id);
};

// =====================================
// 3. REGISTRAR PAGO
// =====================================
const crear = async (datos) => {
  return sequelize.transaction(async (transaction) => {

    const venta = await Venta.findByPk(
      datos.id_venta,
      {
        transaction,
        lock: transaction.LOCK.UPDATE
      }
    );

    if (!venta) {
      throw errorPago("La venta no existe", 404);
    }

    if (venta.estado === "Anulada") {
      throw errorPago(
        "No puedes pagar una venta anulada"
      );
    }

    const monto = aCentimos(datos.monto);
    const total = aCentimos(venta.total);

    if (monto <= 0) {
      throw errorPago(
        "El monto debe ser mayor que cero"
      );
    }

    const pagadoActual = await calcularPagado(
      venta.id_venta,
      transaction
    );

    if (pagadoActual + monto > total) {
      throw errorPago(
        "El pago supera el saldo pendiente"
      );
    }

    const pago = await Pago.create({
      id_venta: venta.id_venta,
      monto: (monto / 100).toFixed(2),
      metodo_pago: datos.metodo_pago,
      referencia: datos.referencia || null,
      estado: "Confirmado"
    }, { transaction });

    const resumen = await actualizarEstadoVenta(
      venta,
      transaction
    );

    return {
      pago,
      resumen
    };
  });
};

// =====================================
// 4. ANULAR PAGO
// =====================================
const anular = async (id) => {
  return sequelize.transaction(async (transaction) => {

    const pagoReferencia = await Pago.findByPk(id, {
      transaction,
      attributes: ["id_venta"]
    });

    if (!pagoReferencia) {
      throw errorPago("Pago no encontrado", 404);
    }

    // Primero bloqueamos la venta
    const venta = await Venta.findByPk(
      pagoReferencia.id_venta,
      {
        transaction,
        lock: transaction.LOCK.UPDATE
      }
    );

    if (!venta) {
      throw errorPago("La venta no existe", 404);
    }

    if (venta.estado === "Anulada") {
      throw errorPago(
        "No puedes modificar pagos de una venta anulada"
      );
    }

    const pago = await Pago.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (pago.estado === "Anulado") {
      throw errorPago(
        "Este pago ya está anulado"
      );
    }

    await pago.update(
      { estado: "Anulado" },
      { transaction }
    );

    const resumen = await actualizarEstadoVenta(
      venta,
      transaction
    );

    return {
      pago,
      resumen
    };
  });
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  anular
};
