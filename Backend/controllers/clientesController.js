
const db = require("../db");

// ========================================
// 1. LISTAR TODOS LOS CLIENTES
// ========================================
exports.listarClientes = async (req, res) => {
    try {
        const [clientes] = await db.query(
            "SELECT * FROM cliente ORDER BY id_cliente DESC"
        );

        res.status(200).json({
            mensaje: "Clientes obtenidos correctamente",
            total: clientes.length,
            datos: clientes
        });

    } catch (error) {
        console.error("Error al listar:", error);

        res.status(500).json({
            mensaje: "Error al obtener los clientes"
        });
    }
};

// ========================================
// 2. BUSCAR CLIENTE POR ID
// ========================================
exports.obtenerCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const [clientes] = await db.query(
            "SELECT * FROM cliente WHERE id_cliente = ?",
            [id]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        res.status(200).json({
            datos: clientes[0]
        });

    } catch (error) {
        console.error("Error al buscar:", error);

        res.status(500).json({
            mensaje: "Error al buscar cliente"
        });
    }
};

// ========================================
// 3. REGISTRAR UN CLIENTE
// ========================================
exports.crearCliente = async (req, res) => {
    try {
        const {
            nombres,
            apellidos,
            dni,
            telefono,
            correo,
            direccion
        } = req.body;

        if (
            typeof nombres !== "string" ||
            !nombres.trim() ||
            typeof apellidos !== "string" ||
            !apellidos.trim()
        ) {
            return res.status(400).json({
                mensaje: "Nombres y apellidos son obligatorios"
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO cliente
            (nombres, apellidos, dni, telefono, correo, direccion)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nombres.trim(),
                apellidos.trim(),
                dni || null,
                telefono || null,
                correo || null,
                direccion || null
            ]
        );

        res.status(201).json({
            mensaje: "Cliente registrado correctamente",
            id_cliente: resultado.insertId
        });

    } catch (error) {
        console.error("Error al registrar:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensaje: "El DNI ya está registrado"
            });
        }

        res.status(500).json({
            mensaje: "Error al registrar cliente"
        });
    }
};

// ========================================
// 4. ACTUALIZAR UN CLIENTE
// ========================================
exports.actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombres,
            apellidos,
            dni,
            telefono,
            correo,
            direccion
        } = req.body;

        if (
            typeof nombres !== "string" ||
            !nombres.trim() ||
            typeof apellidos !== "string" ||
            !apellidos.trim()
        ) {
            return res.status(400).json({
                mensaje: "Nombres y apellidos son obligatorios"
            });
        }

        const [resultado] = await db.query(
            `UPDATE cliente SET
                nombres = ?,
                apellidos = ?,
                dni = ?,
                telefono = ?,
                correo = ?,
                direccion = ?
            WHERE id_cliente = ?`,
            [
                nombres.trim(),
                apellidos.trim(),
                dni || null,
                telefono || null,
                correo || null,
                direccion || null,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Cliente actualizado correctamente"
        });

    } catch (error) {
        console.error("Error al actualizar:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensaje: "El DNI ya está registrado"
            });
        }

        res.status(500).json({
            mensaje: "Error al actualizar cliente"
        });
    }
};

// ========================================
// 5. ELIMINAR UN CLIENTE
// ========================================
exports.eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            "DELETE FROM cliente WHERE id_cliente = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Cliente no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Cliente eliminado correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar:", error);

        if (
            error.code === "ER_ROW_IS_REFERENCED_2" ||
            error.code === "ER_ROW_IS_REFERENCED"
        ) {
            return res.status(409).json({
                mensaje:
                    "No puedes eliminar este cliente porque tiene registros relacionados"
            });
        }

        res.status(500).json({
            mensaje: "Error al eliminar cliente"
        });
    }
};
