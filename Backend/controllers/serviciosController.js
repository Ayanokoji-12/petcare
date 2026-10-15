
const db = require("../db");

// VALIDAR DATOS DEL SERVICIO
function validarServicio(datos) {
    const { nombre, precio, estado } = datos;

    if (typeof nombre !== "string" || !nombre.trim()) {
        return "El nombre del servicio es obligatorio";
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
        estado !== undefined &&
        !["Activo", "Inactivo"].includes(estado)
    ) {
        return "El estado no es válido";
    }

    return null;
}

// 1. LISTAR SERVICIOS
exports.listarServicios = async (req, res) => {
    try {
        const [servicios] = await db.query(
            "SELECT * FROM servicio ORDER BY id_servicio DESC"
        );

        res.status(200).json({
            mensaje: "Servicios obtenidos correctamente",
            total: servicios.length,
            datos: servicios
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al listar servicios"
        });
    }
};

// 2. OBTENER SERVICIO POR ID
exports.obtenerServicio = async (req, res) => {
    try {
        const [servicios] = await db.query(
            "SELECT * FROM servicio WHERE id_servicio = ?",
            [req.params.id]
        );

        if (servicios.length === 0) {
            return res.status(404).json({
                mensaje: "Servicio no encontrado"
            });
        }

        res.status(200).json({
            datos: servicios[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al buscar servicio"
        });
    }
};

// 3. CREAR SERVICIO
exports.crearServicio = async (req, res) => {
    try {
        const errorValidacion = validarServicio(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const {
            nombre,
            descripcion,
            precio,
            estado = "Activo"
        } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO servicio
             (nombre, descripcion, precio, estado)
             VALUES (?, ?, ?, ?)`,
            [
                nombre.trim(),
                descripcion || null,
                Number(precio),
                estado
            ]
        );

        res.status(201).json({
            mensaje: "Servicio registrado correctamente",
            id_servicio: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al registrar servicio"
        });
    }
};

// 4. ACTUALIZAR SERVICIO
exports.actualizarServicio = async (req, res) => {
    try {
        const errorValidacion = validarServicio(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const {
            nombre,
            descripcion,
            precio,
            estado = "Activo"
        } = req.body;

        const [resultado] = await db.query(
            `UPDATE servicio
             SET nombre = ?,
                 descripcion = ?,
                 precio = ?,
                 estado = ?
             WHERE id_servicio = ?`,
            [
                nombre.trim(),
                descripcion || null,
                Number(precio),
                estado,
                req.params.id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Servicio no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Servicio actualizado correctamente"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: "Error al actualizar servicio"
        });
    }
};

// 5. ELIMINAR SERVICIO
exports.eliminarServicio = async (req, res) => {
    try {
        const [resultado] = await db.query(
            "DELETE FROM servicio WHERE id_servicio = ?",
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Servicio no encontrado"
            });
        }

        res.status(200).json({
            mensaje: "Servicio eliminado correctamente"
        });
    } catch (error) {
        console.error(error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                mensaje: "No se puede eliminar porque tiene citas o remisiones relacionadas"
            });
        }

        res.status(500).json({
            mensaje: "Error al eliminar servicio"
        });
    }
};
