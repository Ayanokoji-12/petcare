
const db = require("../db");

// =======================================
// VALIDAR DATOS DEL PRODUCTO
// =======================================
function validarProducto(datos) {
    const {
        nombre,
        precio,
        stock,
        fecha_vencimiento,
        estado
    } = datos;

    if (typeof nombre !== "string" || !nombre.trim()) {
        return "El nombre del producto es obligatorio";
    }

    if (
        precio === null ||
        precio === undefined ||
        precio === "" ||
        !Number.isFinite(Number(precio)) ||
        Number(precio) < 0
    ) {
        return "El precio debe ser un número válido";
    }

    if (
        stock === null ||
        stock === undefined ||
        stock === "" ||
        !Number.isInteger(Number(stock)) ||
        Number(stock) < 0
    ) {
        return "El stock debe ser un número entero mayor o igual a cero";
    }

    if (
        fecha_vencimiento != null &&
        fecha_vencimiento !== "" &&
        (
            typeof fecha_vencimiento !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(fecha_vencimiento) ||
            !Number.isFinite(
                Date.parse(fecha_vencimiento + "T00:00:00Z")
            )
        )
    ) {
        return "La fecha debe tener formato YYYY-MM-DD";
    }

    if (
        estado !== undefined &&
        !["Activo", "Inactivo"].includes(estado)
    ) {
        return "El estado debe ser Activo o Inactivo";
    }

    return null;
}

// =======================================
// 1. LISTAR TODOS LOS PRODUCTOS
// =======================================
exports.listarProductos = async (req, res) => {
    try {
        const [productos] = await db.query(`
            SELECT *
            FROM producto
            ORDER BY id_producto DESC
        `);

        res.status(200).json({
            mensaje: "Productos obtenidos correctamente",
            total: productos.length,
            datos: productos
        });

    } catch (error) {
        console.error("Error al listar productos:", error);

        res.status(500).json({
            mensaje: "Error al obtener productos"
        });
    }
};

// =======================================
// 2. BUSCAR PRODUCTO POR ID
// =======================================
exports.obtenerProducto = async (req, res) => {
    try {
        const [productos] = await db.query(
            "SELECT * FROM producto WHERE id_producto = ?",
            [req.params.id]
        );

        if (productos.length === 0) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.status(200).json({
            datos: productos[0]
        });

    } catch (error) {
        console.error("Error al buscar producto:", error);

        res.status(500).json({
            mensaje: "Error al buscar producto"
        });
    }
};

// =======================================
// 3. REGISTRAR PRODUCTO
// =======================================
exports.crearProducto = async (req, res) => {
    try {
        const errorValidacion = validarProducto(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const {
            nombre,
            descripcion,
            categoria,
            precio,
            stock,
            fecha_vencimiento,
            estado = "Activo"
        } = req.body;

        const [resultado] = await db.query(`
            INSERT INTO producto
            (
                nombre,
                descripcion,
                categoria,
                precio,
                stock,
                fecha_vencimiento,
                estado
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            nombre.trim(),
            descripcion || null,
            categoria || null,
            Number(precio),
            Number(stock),
            fecha_vencimiento || null,
            estado
        ]);

        res.status(201).json({
            mensaje: "Producto registrado correctamente",
            id_producto: resultado.insertId
        });

    } catch (error) {
        console.error("Error al registrar producto:", error);

        res.status(500).json({
            mensaje: "Error al registrar producto"
        });
    }
};

// =======================================
// 4. ACTUALIZAR PRODUCTO
// =======================================
exports.actualizarProducto = async (req, res) => {
    try {
        const errorValidacion = validarProducto(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const {
            nombre,
            descripcion,
            categoria,
            precio,
            stock,
            fecha_vencimiento,
            estado = "Activo"
        } = req.body;

        const [resultado] = await db.query(`
            UPDATE producto SET
                nombre = ?,
                descripcion = ?,
                categoria = ?,
                precio = ?,
                stock = ?,
                fecha_vencimiento = ?,
                estado = ?
            WHERE id_producto = ?
        `, [
            nombre.trim(),
            descripcion || null,
            categoria || null,
            Number(precio),
            Number(stock),
            fecha_vencimiento || null,
            estado,
            req.params.id
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Producto actualizado correctamente"
        });

    } catch (error) {
        console.error("Error al actualizar producto:", error);

        res.status(500).json({
            mensaje: "Error al actualizar producto"
        });
    }
};

// =======================================
// 5. ELIMINAR PRODUCTO
// =======================================
exports.eliminarProducto = async (req, res) => {
    try {
        const [resultado] = await db.query(
            "DELETE FROM producto WHERE id_producto = ?",
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Producto no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Producto eliminado correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar producto:", error);

        if (
            error.code === "ER_ROW_IS_REFERENCED_2" ||
            error.code === "ER_ROW_IS_REFERENCED"
        ) {
            return res.status(409).json({
                mensaje:
                    "No se puede eliminar este producto porque tiene ventas relacionadas"
            });
        }

        res.status(500).json({
            mensaje: "Error al eliminar producto"
        });
    }
};

// =======================================
// 6. PRODUCTOS CON STOCK BAJO
// =======================================
exports.productosStockBajo = async (req, res) => {
    try {
        const [productos] = await db.query(`
            SELECT *
            FROM producto
            WHERE stock <= 5
            ORDER BY stock ASC
        `);

        res.status(200).json({
            mensaje: "Productos con stock bajo",
            total: productos.length,
            datos: productos
        });

    } catch (error) {
        console.error("Error al consultar stock:", error);

        res.status(500).json({
            mensaje: "Error al consultar stock bajo"
        });
    }
};
