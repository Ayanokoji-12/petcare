
const db = require("../db");

// ==========================================
// VALIDAR DATOS DE UNA CITA
// ==========================================
function validarCita(datos) {
    const {
        id_mascota,
        id_empleado,
        id_servicio,
        fecha,
        estado
    } = datos;

    if (!Number.isInteger(Number(id_mascota)) ||
        Number(id_mascota) <= 0) {
        return "Selecciona una mascota válida";
    }

    if (!Number.isInteger(Number(id_servicio)) ||
        Number(id_servicio) <= 0) {
        return "Selecciona un servicio válido";
    }

    if (id_empleado != null && id_empleado !== "" &&
        (!Number.isInteger(Number(id_empleado)) ||
         Number(id_empleado) <= 0)) {
        return "El veterinario no es válido";
    }

    if (typeof fecha !== "string" ||
        !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(fecha)) {
        return "La fecha debe tener formato YYYY-MM-DD HH:MM:SS";
    }

    const estados = [
        "Pendiente",
        "Confirmada",
        "Atendida",
        "Cancelada"
    ];

    if (estado !== undefined && !estados.includes(estado)) {
        return "El estado de la cita no es válido";
    }

    return null;
}

// ==========================================
// VERIFICAR RELACIONES
// ==========================================
async function verificarRelaciones(datos) {
    const [mascotas] = await db.query(
        "SELECT id_mascota FROM mascota WHERE id_mascota = ?",
        [datos.id_mascota]
    );

    if (mascotas.length === 0) {
        return "La mascota no existe";
    }

    const [servicios] = await db.query(
        `SELECT id_servicio FROM servicio
         WHERE id_servicio = ? AND estado = 'Activo'`,
        [datos.id_servicio]
    );

    if (servicios.length === 0) {
        return "El servicio no existe o está inactivo";
    }

    if (datos.id_empleado != null &&
        datos.id_empleado !== "") {
        const [empleados] = await db.query(
            `SELECT id_empleado FROM empleado
             WHERE id_empleado = ? AND estado = 'Activo'`,
            [datos.id_empleado]
        );

        if (empleados.length === 0) {
            return "El empleado no existe o está inactivo";
        }
    }

    return null;
}

// ==========================================
// 1. LISTAR CITAS
// ==========================================
exports.listarCitas = async (req, res) => {
    try {
        const [citas] = await db.query(`
            SELECT
                c.id_cita,
                c.id_mascota,
                c.id_empleado,
                c.id_servicio,
                c.fecha,
                c.motivo,
                c.estado,
                m.nombre AS mascota,
                CONCAT(cl.nombres, ' ', cl.apellidos)
                    AS propietario,
                s.nombre AS servicio,
                CONCAT(e.nombres, ' ', e.apellidos)
                    AS veterinario
            FROM cita c
            INNER JOIN mascota m
                ON c.id_mascota = m.id_mascota
            INNER JOIN cliente cl
                ON m.id_cliente = cl.id_cliente
            INNER JOIN servicio s
                ON c.id_servicio = s.id_servicio
            LEFT JOIN empleado e
                ON c.id_empleado = e.id_empleado
            ORDER BY c.fecha DESC
        `);

        res.status(200).json({
            mensaje: "Citas obtenidas correctamente",
            total: citas.length,
            datos: citas
        });

    } catch (error) {
        console.error("Error al listar citas:", error);

        res.status(500).json({
            mensaje: "Error al obtener las citas"
        });
    }
};

// ==========================================
// 2. OBTENER CITA POR ID
// ==========================================
exports.obtenerCita = async (req, res) => {
    try {
        const [citas] = await db.query(`
            SELECT
                c.*,
                m.nombre AS mascota,
                s.nombre AS servicio,
                CONCAT(e.nombres, ' ', e.apellidos)
                    AS veterinario
            FROM cita c
            INNER JOIN mascota m
                ON c.id_mascota = m.id_mascota
            INNER JOIN servicio s
                ON c.id_servicio = s.id_servicio
            LEFT JOIN empleado e
                ON c.id_empleado = e.id_empleado
            WHERE c.id_cita = ?
        `, [req.params.id]);

        if (citas.length === 0) {
            return res.status(404).json({
                mensaje: "Cita no encontrada"
            });
        }

        res.status(200).json({
            datos: citas[0]
        });

    } catch (error) {
        console.error("Error al buscar cita:", error);

        res.status(500).json({
            mensaje: "Error al buscar la cita"
        });
    }
};

// ==========================================
// 3. CREAR CITA
// ==========================================
exports.crearCita = async (req, res) => {
    try {
        const errorValidacion = validarCita(req.body);

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
            id_empleado,
            id_servicio,
            fecha,
            motivo,
            estado = "Pendiente"
        } = req.body;

        const [resultado] = await db.query(`
            INSERT INTO cita
            (
                id_mascota,
                id_empleado,
                id_servicio,
                fecha,
                motivo,
                estado
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            id_mascota,
            id_empleado || null,
            id_servicio,
            fecha,
            motivo || null,
            estado
        ]);

        res.status(201).json({
            mensaje: "Cita registrada correctamente",
            id_cita: resultado.insertId
        });

    } catch (error) {
        console.error("Error al crear cita:", error);

        res.status(500).json({
            mensaje: "Error al registrar la cita"
        });
    }
};

// ==========================================
// 4. ACTUALIZAR CITA
// ==========================================
exports.actualizarCita = async (req, res) => {
    try {
        const errorValidacion = validarCita(req.body);

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
            id_empleado,
            id_servicio,
            fecha,
            motivo,
            estado = "Pendiente"
        } = req.body;

        const [resultado] = await db.query(`
            UPDATE cita SET
                id_mascota = ?,
                id_empleado = ?,
                id_servicio = ?,
                fecha = ?,
                motivo = ?,
                estado = ?
            WHERE id_cita = ?
        `, [
            id_mascota,
            id_empleado || null,
            id_servicio,
            fecha,
            motivo || null,
            estado,
            req.params.id
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Cita no encontrada"
            });
        }

        res.status(200).json({
            mensaje: "Cita actualizada correctamente"
        });

    } catch (error) {
        console.error("Error al actualizar cita:", error);

        res.status(500).json({
            mensaje: "Error al actualizar la cita"
        });
    }
};

// ==========================================
// 5. ELIMINAR CITA
// ==========================================
exports.eliminarCita = async (req, res) => {
    try {
        const [resultado] = await db.query(
            "DELETE FROM cita WHERE id_cita = ?",
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Cita no encontrada"
            });
        }

        res.status(200).json({
            mensaje: "Cita eliminada correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar cita:", error);

        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                mensaje:
                    "No se puede eliminar esta cita porque tiene una consulta médica relacionada"
            });
        }

        res.status(500).json({
            mensaje: "Error al eliminar la cita"
        });
    }
};
