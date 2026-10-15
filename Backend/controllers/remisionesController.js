
const db = require("../db");

// =====================================
// VALIDAR DATOS
// =====================================
function validarRemision(datos) {
    const {
        id_mascota,
        id_servicio,
        id_empleado_origen,
        motivo
    } = datos;

    if (!Number.isInteger(Number(id_mascota)) ||
        Number(id_mascota) <= 0) {
        return "La mascota no es válida";
    }

    if (!Number.isInteger(Number(id_servicio)) ||
        Number(id_servicio) <= 0) {
        return "El servicio es obligatorio";
    }

    if (id_empleado_origen != null &&
        (!Number.isInteger(Number(id_empleado_origen)) ||
         Number(id_empleado_origen) <= 0)) {
        return "El empleado de origen no es válido";
    }

    if (typeof motivo !== "string" || !motivo.trim()) {
        return "El motivo es obligatorio";
    }

    return null;
}

// =====================================
// VERIFICAR RELACIONES
// =====================================
async function verificarRelaciones(datos) {
    const [mascotas] = await db.query(
        "SELECT id_mascota FROM mascota WHERE id_mascota = ?",
        [datos.id_mascota]
    );

    if (mascotas.length === 0) {
        return "La mascota no existe";
    }

    const [servicios] = await db.query(
        "SELECT id_servicio FROM servicio WHERE id_servicio = ?",
        [datos.id_servicio]
    );

    if (servicios.length === 0) {
        return "El servicio no existe";
    }

    if (datos.id_empleado_origen != null) {
        const [empleados] = await db.query(
            "SELECT id_empleado FROM empleado WHERE id_empleado = ?",
            [datos.id_empleado_origen]
        );

        if (empleados.length === 0) {
            return "El empleado de origen no existe";
        }
    }

    return null;
}

// =====================================
// 1. LISTAR REMISIONES
// =====================================
exports.listarRemisiones = async (req, res) => {
    try {
        const [remisiones] = await db.query(`
            SELECT
                r.*,
                m.nombre AS mascota,
                s.nombre AS servicio,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS propietario
            FROM remision r
            INNER JOIN mascota m
                ON r.id_mascota = m.id_mascota
            INNER JOIN servicio s
                ON r.id_servicio = s.id_servicio
            INNER JOIN cliente c
                ON m.id_cliente = c.id_cliente
            ORDER BY r.id_remision DESC
        `);

        res.status(200).json({
            mensaje: "Remisiones obtenidas correctamente",
            total: remisiones.length,
            datos: remisiones
        });

    } catch (error) {
        console.error("Error al listar remisiones:", error);

        res.status(500).json({
            mensaje: "Error al listar remisiones"
        });
    }
};

// =====================================
// 2. OBTENER REMISION POR ID
// =====================================
exports.obtenerRemision = async (req, res) => {
    try {
        const [remisiones] = await db.query(
            "SELECT * FROM remision WHERE id_remision = ?",
            [req.params.id]
        );

        if (remisiones.length === 0) {
            return res.status(404).json({
                mensaje: "Remisión no encontrada"
            });
        }

        res.status(200).json({
            datos: remisiones[0]
        });

    } catch (error) {
        console.error("Error al buscar remisión:", error);

        res.status(500).json({
            mensaje: "Error al buscar remisión"
        });
    }
};

// =====================================
// 3. REGISTRAR REMISION
// =====================================
exports.crearRemision = async (req, res) => {
    try {
        const errorValidacion = validarRemision(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const errorRelacion = await verificarRelaciones(req.body);

        if (errorRelacion) {
            return res.status(400).json({
                mensaje: errorRelacion
            });
        }

        const {
            id_mascota,
            id_empleado_origen,
            id_servicio,
            veterinario_origen,
            telefono_contacto,
            correo_profesional,
            motivo,
            archivo_adjunto
        } = req.body;

        const [resultado] = await db.query(`
            INSERT INTO remision
            (
                id_mascota,
                id_empleado_origen,
                id_servicio,
                veterinario_origen,
                telefono_contacto,
                correo_profesional,
                motivo,
                archivo_adjunto
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id_mascota,
            id_empleado_origen ?? null,
            id_servicio,
            veterinario_origen || null,
            telefono_contacto || null,
            correo_profesional || null,
            motivo.trim(),
            archivo_adjunto || null
        ]);

        res.status(201).json({
            mensaje: "Remisión registrada correctamente",
            id_remision: resultado.insertId
        });

    } catch (error) {
        console.error("Error al registrar remisión:", error);

        res.status(500).json({
            mensaje: "Error al registrar remisión"
        });
    }
};

// =====================================
// 4. ACTUALIZAR REMISION
// =====================================
exports.actualizarRemision = async (req, res) => {
    try {
        const errorValidacion = validarRemision(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const errorRelacion = await verificarRelaciones(req.body);

        if (errorRelacion) {
            return res.status(400).json({
                mensaje: errorRelacion
            });
        }

        const {
            id_mascota,
            id_empleado_origen,
            id_servicio,
            veterinario_origen,
            telefono_contacto,
            correo_profesional,
            motivo,
            archivo_adjunto
        } = req.body;

        const [resultado] = await db.query(`
            UPDATE remision SET
                id_mascota = ?,
                id_empleado_origen = ?,
                id_servicio = ?,
                veterinario_origen = ?,
                telefono_contacto = ?,
                correo_profesional = ?,
                motivo = ?,
                archivo_adjunto = ?
            WHERE id_remision = ?
        `, [
            id_mascota,
            id_empleado_origen ?? null,
            id_servicio,
            veterinario_origen || null,
            telefono_contacto || null,
            correo_profesional || null,
            motivo.trim(),
            archivo_adjunto || null,
            req.params.id
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Remisión no encontrada"
            });
        }

        res.status(200).json({
            mensaje: "Remisión actualizada correctamente"
        });

    } catch (error) {
        console.error("Error al actualizar remisión:", error);

        res.status(500).json({
            mensaje: "Error al actualizar remisión"
        });
    }
};

// =====================================
// 5. ELIMINAR REMISION
// =====================================
exports.eliminarRemision = async (req, res) => {
    try {
        const [resultado] = await db.query(
            "DELETE FROM remision WHERE id_remision = ?",
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Remisión no encontrada"
            });
        }

        res.status(200).json({
            mensaje: "Remisión eliminada correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar remisión:", error);

        res.status(500).json({
            mensaje: "Error al eliminar remisión"
        });
    }
};
