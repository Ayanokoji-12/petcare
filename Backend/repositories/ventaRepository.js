
const sequelize = require("../config/database");

const {
  Venta,
  DetalleVenta,
  Producto,
  Cliente,
  Empleado,
  Pago
} = require("../modelos/asociaciones");

// =====================================
// ERRORES CONTROLADOS
// =====================================
function errorVenta(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// =====================================
// FORMATEAR CABECERA DE VENTA
// =====================================
function formatearVenta(registro) {
  const datos = registro.toJSON();

  const { clienteInfo, empleadoInfo, ...campos } = datos;

  return {
    ...campos,
    cliente: clienteInfo
      ? `${clienteInfo.nombres} ${clienteInfo.apellidos}`
      : null,
    empleado: empleadoInfo
      ? `${empleadoInfo.nombres} ${empleadoInfo.apellidos}`
      : null
  };
}

// =====================================
// 1. LISTAR VENTAS
// =====================================
const obtenerTodos = async () => {
  const ventas = await Venta.findAll({
    include: [
      {
        association: "clienteInfo",
        required: true,
        attributes: ["nombres", "apellidos"]
      },
      {
        association: "empleadoInfo",
        required: true,
        attributes: ["nombres", "apellidos"]
      }
    ],
    order: [["id_venta", "DESC"]]
  });

  return ventas.map(formatearVenta);
};

// =====================================
// 2. OBTENER VENTA Y SUS PRODUCTOS
// =====================================
const obtenerPorId = async (id) => {
  const venta = await Venta.findByPk(id, {
    include: [
      {
        association: "clienteInfo",
        required: true,
        attributes: ["nombres", "apellidos"]
      },
      {
        association: "empleadoInfo",
        required: true,
        attributes: ["nombres", "apellidos"]
      }
    ]
  });

  if (!venta) return null;

  const detalles = await DetalleVenta.findAll({
    where: { id_venta: id },
    include: [
      {
        association: "productoInfo",
        required: true,
        attributes: ["nombre"]
      }
    ],
    order: [["id_detalle", "ASC"]]
  });

  const productos = detalles.map(registro => {
    const datos = registro.toJSON();

    return {
      id_detalle: datos.id_detalle,
      id_producto: datos.id_producto,
      producto: datos.productoInfo.nombre,
      cantidad: datos.cantidad,
      precio_unitario: datos.precio_unitario,
      subtotal: datos.subtotal
    };
  });

  return {
    venta: formatearVenta(venta),
    productos
  };
};

// =====================================
// 3. REGISTRAR VENTA CON TRANSACCIÓN
// =====================================
const crearConTransaccion = async (datos) => {
  return sequelize.transaction(async (transaction) => {

    const cliente = await Cliente.findByPk(
      datos.id_cliente,
      { transaction }
    );

    if (!cliente) {
      throw errorVenta("El cliente no existe", 404);
    }

    const empleado = await Empleado.findByPk(
      datos.id_empleado,
      { transaction }
    );

    if (!empleado) {
      throw errorVenta("El empleado no existe", 404);
    }

    // Bloquear productos en orden fijo
    const productosOrdenados = [...datos.productos].sort(
      (a, b) =>
        Number(a.id_producto) - Number(b.id_producto)
    );

    const detalles = [];
    const productosBloqueados = [];
    let totalCentimos = 0;

    for (const item of productosOrdenados) {
      const idProducto = Number(item.id_producto);
      const cantidad = Number(item.cantidad);

      const producto = await Producto.findByPk(idProducto, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!producto) {
        throw errorVenta(
          `No existe el producto ${idProducto}`,
          404
        );
      }

      if (producto.estado !== "Activo") {
        throw errorVenta(
          `El producto ${producto.nombre} está inactivo`,
          400
        );
      }

      if (producto.fecha_vencimiento) {
        const fechaTexto = String(
          producto.fecha_vencimiento
        ).slice(0, 10);

        // Comparación de fechas calendario
        const hoy = new Date();
        const fechaHoy = [
          hoy.getFullYear(),
          String(hoy.getMonth() + 1).padStart(2, "0"),
          String(hoy.getDate()).padStart(2, "0")
        ].join("-");

        if (fechaTexto < fechaHoy) {
          throw errorVenta(
            `El producto ${producto.nombre} está vencido`,
            400
          );
        }
      }

      if (producto.stock < cantidad) {
        throw errorVenta(
          `Stock insuficiente de ${producto.nombre}. ` +
          `Disponible: ${producto.stock}`,
          400
        );
      }

      const precioCentimos = Math.round(
        Number(producto.precio) * 100
      );

      const subtotalCentimos =
        precioCentimos * cantidad;

      totalCentimos += subtotalCentimos;

      detalles.push({
        id_producto: idProducto,
        cantidad,
        precio: precioCentimos / 100,
        subtotal: subtotalCentimos / 100
      });

      productosBloqueados.push({
        producto,
        cantidad
      });
    }

    const total = totalCentimos / 100;

    // Crear cabecera
    const venta = await Venta.create({
      id_cliente: datos.id_cliente,
      id_empleado: datos.id_empleado,
      total,
      estado: "Pendiente"
    }, { transaction });

    // Registrar detalles
    for (const item of detalles) {
      await DetalleVenta.create({
        id_venta: venta.id_venta,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.subtotal
      }, { transaction });
    }

    // Descontar stock de los productos bloqueados
    for (const item of productosBloqueados) {
      await item.producto.decrement(
        "stock",
        {
          by: item.cantidad,
          transaction
        }
      );
    }

    return {
      id_venta: venta.id_venta,
      total,
      productos: detalles
    };
  });
};


 // =====================================
 // 4. ANULAR VENTA CON TRANSACCIÓN
 // =====================================
 const anularConTransaccion = async (id) => {
   return sequelize.transaction(async (transaction) => {

     // 1. Buscar y bloquear la venta
     const venta = await Venta.findByPk(id, {
       transaction,
       lock: transaction.LOCK.UPDATE
     });

     if (!venta) {
       throw errorVenta("Venta no encontrada", 404);
     }

     if (venta.estado === "Anulada") {
       throw errorVenta(
         "Esta venta ya está anulada",
         400
       );
     }

     // 2. Comprobar pagos confirmados
         const pagosConfirmados = await Pago.count({
         where: {
         id_venta: id,
         estado: "Confirmado"
       },
       transaction
     });

     if (pagosConfirmados > 0) {
       throw errorVenta(
         "La venta tiene pagos confirmados. " +
         "Anula primero los pagos correspondientes.",
         400
       );
     }
    
     // 3. Obtener los detalles de la venta
     const detalles = await DetalleVenta.findAll({
       where: { id_venta: id },
       order: [["id_producto", "ASC"]],
       transaction
     });

     // 4. Devolver stock
     for (const detalle of detalles) {
       const producto = await Producto.findByPk(
         detalle.id_producto,
         {
           transaction,
           lock: transaction.LOCK.UPDATE
         }
       );

       if (!producto) {
         throw errorVenta(
           `No existe el producto ${detalle.id_producto}`,
           404
         );
       }

       await producto.increment("stock", {
         by: detalle.cantidad,
         transaction
       });
     }

     // 5. Anular la venta
     await venta.update(
       { estado: "Anulada" },
       { transaction }
     );

     return true;
   });
 };

 // =====================================
 // 5. HISTORIAL DE PAGOS DE UNA VENTA
 // =====================================
 const obtenerHistorialPagos = async (id) => {
   const venta = await Venta.findByPk(id);

   if (!venta) {
     throw errorVenta("Venta no encontrada", 404);
   }

   const pagos = await Pago.findAll({
     where: {
       id_venta: id
     },
     order: [
       ["fecha_pago", "DESC"],
       ["id_pago", "DESC"]
     ]
   });

   // Convertir importes a céntimos
   const aCentimos = (valor) => {
     return Math.round(Number(valor) * 100);
   };

   const totalCentimos = aCentimos(venta.total);

   const pagadoCentimos = pagos
     .filter(pago => pago.estado === "Confirmado")
     .reduce(
       (suma, pago) => suma + aCentimos(pago.monto),
       0
     );

   return {
     id_venta: venta.id_venta,
     estado: venta.estado,
     total: totalCentimos / 100,
     pagado: pagadoCentimos / 100,
     pendiente: Math.max(
       0,
       totalCentimos - pagadoCentimos
     ) / 100,
     pagos: pagos.map(pago => pago.toJSON())
   };
 };


module.exports = {
  obtenerTodos,
  obtenerPorId,
  crearConTransaccion,
  anularConTransaccion,
  obtenerHistorialPagos
};
