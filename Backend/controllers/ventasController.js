
const db = require("../db");

// =====================================
// VALIDAR DATOS DE VENTA
// =====================================
function validarVenta(datos) {
    const { id_cliente, id_empleado, productos } = datos;

    if (!Number.isInteger(Number(id_cliente)) ||
        Number(id_cliente) <= 0) {
        return "El cliente no es válido";
    }

    if (!Number.isInteger(Number(id_empleado)) ||
        Number(id_empleado) <= 0) {
        return "El empleado no es válido";
    }

    if (!Array.isArray(productos) ||
        productos.length === 0) {
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
        const [ventas] = await db.query(`
            SELECT
                v.id_venta,
                v.id_cliente,
                v.id_empleado,
                v.fecha,
                v.total,
                v.estado,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS cliente,
                CONCAT(e.nombres, ' ', e.apellidos)
                    AS empleado
            FROM venta v
            INNER JOIN cliente c
                ON v.id_cliente = c.id_cliente
            INNER JOIN empleado e
                ON v.id_empleado = e.id_empleado
            ORDER BY v.id_venta DESC
        `);

        res.status(200).json({
            mensaje: "Ventas obtenidas correctamente",
            total: ventas.length,
            datos: ventas
        });

    } catch (error) {
        console.error("Error al listar ventas:", error);

        res.status(500).json({
            mensaje: "Error al obtener las ventas"
        });
    }
};

// =====================================
// 2. OBTENER VENTA CON SUS PRODUCTOS
// =====================================
exports.obtenerVenta = async (req, res) => {
    try {
        const [ventas] = await db.query(`
            SELECT
                v.*,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS cliente,
                CONCAT(e.nombres, ' ', e.apellidos)
                    AS empleado
            FROM venta v
            INNER JOIN cliente c
                ON v.id_cliente = c.id_cliente
            INNER JOIN empleado e
                ON v.id_empleado = e.id_empleado
            WHERE v.id_venta = ?
        `, [req.params.id]);

        if (ventas.length === 0) {
            return res.status(404).json({
                mensaje: "Venta no encontrada"
            });
        }

        const [detalles] = await db.query(`
            SELECT
                d.id_detalle,
                d.id_producto,
                p.nombre AS producto,
                d.cantidad,
                d.precio_unitario,
                d.subtotal
            FROM detalle_venta d
            INNER JOIN producto p
                ON d.id_producto = p.id_producto
            WHERE d.id_venta = ?
        `, [req.params.id]);

        res.status(200).json({
            mensaje: "Venta encontrada",
            venta: ventas[0],
            productos: detalles
        });

    } catch (error) {
        console.error("Error al buscar venta:", error);

        res.status(500).json({
            mensaje: "Error al obtener la venta"
        });
    }
};

// =====================================
// 3. REGISTRAR VENTA Y DESCONTAR STOCK
// =====================================
exports.crearVenta = async (req, res) => {
    let conexion;

    try {
        const errorValidacion = validarVenta(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const {
            id_cliente,
            id_empleado,
            productos
        } = req.body;

        conexion = await db.getConnection();
        await conexion.beginTransaction();

        // VERIFICAR CLIENTE
        const [clientes] = await conexion.query(
            "SELECT id_cliente FROM cliente WHERE id_cliente = ?",
            [id_cliente]
        );

        if (clientes.length === 0) {
            await conexion.rollback();

            return res.status(404).json({
                mensaje: "El cliente no existe"
            });
        }

        // VERIFICAR EMPLEADO
        const [empleados] = await conexion.query(
            "SELECT id_empleado FROM empleado WHERE id_empleado = ?",
            [id_empleado]
        );

        if (empleados.length === 0) {
            await conexion.rollback();

            return res.status(404).json({
                mensaje: "El empleado no existe"
            });
        }

        // ORDENAR PRODUCTOS PARA BLOQUEAR FILAS
        // SIEMPRE EN EL MISMO ORDEN
        const productosOrdenados = [...productos].sort(
            (a, b) =>
                Number(a.id_producto) - Number(b.id_producto)
        );

        const detalles = [];
        let totalCentimos = 0;

        for (const item of productosOrdenados) {
            const idProducto = Number(item.id_producto);
            const cantidad = Number(item.cantidad);

            // BLOQUEAR PRODUCTO DURANTE LA VENTA
            const [filas] = await conexion.query(
                `SELECT id_producto, nombre, precio, stock,
                        estado, fecha_vencimiento
                 FROM producto
                 WHERE id_producto = ?
                 FOR UPDATE`,
                [idProducto]
            );

            if (filas.length === 0) {
                await conexion.rollback();

                return res.status(404).json({
                    mensaje: `No existe el producto ${idProducto}`
                });
            }

            const producto = filas[0];

            if (producto.estado !== "Activo") {
                await conexion.rollback();

                return res.status(400).json({
                    mensaje:
                        `El producto ${producto.nombre} está inactivo`
                });
            }

            if (producto.fecha_vencimiento) {
                const fecha = new Date(
                    producto.fecha_vencimiento
                );

                const hoy = new Date();
                fecha.setHours(23, 59, 59, 999);

                if (fecha < hoy) {
                    await conexion.rollback();

                    return res.status(400).json({
                        mensaje:
                            `El producto ${producto.nombre} está vencido`
                    });
                }
            }

            if (producto.stock < cantidad) {
                await conexion.rollback();

                return res.status(400).json({
                    mensaje:
                        `Stock insuficiente de ${producto.nombre}. ` +
                        `Disponible: ${producto.stock}`
                });
            }

            // TRABAJAR CON CENTIMOS
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
        }

        const total = totalCentimos / 100;

        // REGISTRAR CABECERA DE VENTA
        const [resultado] = await conexion.query(
            `INSERT INTO venta
             (id_cliente, id_empleado, total, estado)
             VALUES (?, ?, ?, 'Pagada')`,
            [id_cliente, id_empleado, total]
        );

        const idVenta = resultado.insertId;

        // REGISTRAR DETALLES Y DESCONTAR STOCK
        for (const item of detalles) {
            await conexion.query(
                `INSERT INTO detalle_venta
                 (
                     id_venta,
                     id_producto,
                     cantidad,
                     precio_unitario,
                     subtotal
                 )
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    idVenta,
                    item.id_producto,
                    item.cantidad,
                    item.precio,
                    item.subtotal
                ]
            );

            await conexion.query(
                `UPDATE producto
                 SET stock = stock - ?
                 WHERE id_producto = ?`,
                [item.cantidad, item.id_producto]
            );
        }

        // CONFIRMAR TODA LA TRANSACCION
        await conexion.commit();

        res.status(201).json({
            mensaje: "Venta registrada correctamente",
            id_venta: idVenta,
            total,
            productos: detalles
        });

    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        console.error("Error al registrar venta:", error);

        res.status(500).json({
            mensaje: "Error al registrar la venta"
        });

    } finally {
        if (conexion) conexion.release();
    }
};

// =====================================
// 4. ANULAR VENTA Y DEVOLVER STOCK
// =====================================
exports.anularVenta = async (req, res) => {
    let conexion;

    try {
        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [ventas] = await conexion.query(
            `SELECT id_venta, estado
             FROM venta
             WHERE id_venta = ?
             FOR UPDATE`,
            [req.params.id]
        );

        if (ventas.length === 0) {
            await conexion.rollback();

            return res.status(404).json({
                mensaje: "Venta no encontrada"
            });
        }

        if (ventas[0].estado === "Anulada") {
            await conexion.rollback();

            return res.status(400).json({
                mensaje: "Esta venta ya está anulada"
            });
        }

        const [detalles] = await conexion.query(
            `SELECT id_producto, cantidad
             FROM detalle_venta
             WHERE id_venta = ?
             ORDER BY id_producto ASC`,
            [req.params.id]
        );

        // DEVOLVER STOCK
        for (const item of detalles) {
            await conexion.query(
                `UPDATE producto
                 SET stock = stock + ?
                 WHERE id_producto = ?`,
                [item.cantidad, item.id_producto]
            );
        }

        await conexion.query(
            `UPDATE venta
             SET estado = 'Anulada'
             WHERE id_venta = ?`,
            [req.params.id]
        );

        await conexion.commit();

        res.status(200).json({
            mensaje:
                "Venta anulada y stock restaurado correctamente"
        });

    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        console.error("Error al anular venta:", error);

        res.status(500).json({
            mensaje: "Error al anular la venta"
        });

    } finally {
        if (conexion) conexion.release();
    }
};
