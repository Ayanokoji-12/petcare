
const db = require("../db");

// ==========================================
// VALIDAR DATOS
// ==========================================
function validarConsulta(datos) {
    const {
        id_cita,
        diagnostico,
        tratamiento,
        observaciones
    } = datos;

    if (
        !Number.isInteger(Number(id_cita)) ||
        Number(id_cita) <= 0
    ) {
        return "Debes seleccionar una cita válida";
    }

    if (
        typeof diagnostico !== "string" ||
        !diagnostico.trim()
    ) {
        return "El diagnóstico es obligatorio";
    }

    if (
        tratamiento != null &&
        typeof tratamiento !== "string"
    ) {
        return "El tratamiento debe ser texto";
    }

    if (
        observaciones != null &&
        typeof observaciones !== "string"
    ) {
        return "Las observaciones deben ser texto";
    }

    return null;
}

// ==========================================
// 1. LISTAR CONSULTAS
// ==========================================
exports.listarConsultas = async (req, res) => {
    try {
        const [consultas] = await db.query(`
            SELECT
                co.id_consulta,
                co.id_cita,
                co.diagnostico,
                co.tratamiento,
                co.observaciones,
                co.fecha_consulta,
                ci.fecha AS fecha_cita,
                m.nombre AS mascota,
                e.nombre AS especie,
                CONCAT(cl.nombres, ' ', cl.apellidos)
                    AS propietario,
                CONCAT(emp.nombres, ' ', emp.apellidos)
                    AS veterinario
            FROM consulta co
            INNER JOIN cita ci
                ON co.id_cita = ci.id_cita
            INNER JOIN mascota m
                ON ci.id_mascota = m.id_mascota
            INNER JOIN especie e
                ON m.id_especie = e.id_especie
            INNER JOIN cliente cl
                ON m.id_cliente = cl.id_cliente
            LEFT JOIN empleado emp
                ON ci.id_empleado = emp.id_empleado
            ORDER BY co.fecha_consulta DESC
        `);

        res.status(200).json({
            mensaje: "Consultas obtenidas correctamente",
            total: consultas.length,
            datos: consultas
        });

    } catch (error) {
        console.error("Error al listar consultas:", error);

        res.status(500).json({
            mensaje: "Error al obtener las consultas"
        });
    }
};

// ==========================================
// 2. OBTENER CONSULTA POR ID
// ==========================================
exports.obtenerConsulta = async (req, res) => {
    try {
        const [consultas] = await db.query(`
            SELECT
                co.*,
                m.nombre AS mascota,
                ci.fecha AS fecha_cita
            FROM consulta co
            INNER JOIN cita ci
                ON co.id_cita = ci.id_cita
            INNER JOIN mascota m
                ON ci.id_mascota = m.id_mascota
            WHERE co.id_consulta = ?
        `, [req.params.id]);

        if (consultas.length === 0) {
            return res.status(404).json({
                mensaje: "Consulta no encontrada"
            });
        }

        res.status(200).json({
            datos: consultas[0]
        });

    } catch (error) {
        console.error("Error al buscar consulta:", error);

        res.status(500).json({
            mensaje: "Error al buscar la consulta"
        });
    }
};

// ==========================================
// 3. CREAR CONSULTA
// ==========================================
exports.crearConsulta = async (req, res) => {
    let conexion;

    try {
        const errorValidacion = validarConsulta(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const {
            id_cita,
            diagnostico,
            tratamiento,
            observaciones
        } = req.body;

        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [citas] = await conexion.query(
            `SELECT id_cita, estado
             FROM cita
             WHERE id_cita = ?
             FOR UPDATE`,
            [id_cita]
        );

        if (citas.length === 0) {
            await conexion.rollback();

            return res.status(404).json({
                mensaje: "La cita no existe"
            });
        }

        if (citas[0].estado === "Cancelada") {
            await conexion.rollback();

            return res.status(400).json({
                mensaje:
                    "No se puede registrar una consulta de una cita cancelada"
            });
        }

        const [existentes] = await conexion.query(
            "SELECT id_consulta FROM consulta WHERE id_cita = ?",
            [id_cita]
        );

        if (existentes.length > 0) {
            await conexion.rollback();

            return res.status(409).json({
                mensaje:
                    "Esta cita ya tiene una consulta registrada"
            });
        }

        const [resultado] = await conexion.query(
            `INSERT INTO consulta
             (id_cita, diagnostico, tratamiento, observaciones)
             VALUES (?, ?, ?, ?)`,
            [
                id_cita,
                diagnostico.trim(),
                tratamiento || null,
                observaciones || null
            ]
        );

        await conexion.query(
            `UPDATE cita
             SET estado = 'Atendida'
             WHERE id_cita = ?`,
            [id_cita]
        );

        await conexion.commit();

        res.status(201).json({
            mensaje: "Consulta registrada correctamente",
            id_consulta: resultado.insertId,
            estado_cita: "Atendida"
        });

    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        console.error("Error al registrar consulta:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensaje: "La cita ya tiene una consulta registrada"
            });
        }

        res.status(500).json({
            mensaje: "Error al registrar la consulta"
        });

    } finally {
        if (conexion) conexion.release();
    }
};

// ==========================================
// 4. ACTUALIZAR CONSULTA
// ==========================================
exports.actualizarConsulta = async (req, res) => {
    try {
        const errorValidacion = validarConsulta(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const {
            id_cita,
            diagnostico,
            tratamiento,
            observaciones
        } = req.body;

        const [resultado] = await db.query(
            `UPDATE consulta SET
                id_cita = ?,
                diagnostico = ?,
                tratamiento = ?,
                observaciones = ?
             WHERE id_consulta = ?`,
            [
                id_cita,
                diagnostico.trim(),
                tratamiento || null,
                observaciones || null,
                req.params.id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Consulta no encontrada"
            });
        }

        res.status(200).json({
            mensaje: "Consulta actualizada correctamente"
        });

    } catch (error) {
        console.error("Error al actualizar consulta:", error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensaje: "La cita ya tiene otra consulta"
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                mensaje: "La cita indicada no existe"
            });
        }

        res.status(500).json({
            mensaje: "Error al actualizar la consulta"
        });
    }
};

// ==========================================
// 5. ELIMINAR CONSULTA
// ==========================================
exports.eliminarConsulta = async (req, res) => {
    let conexion;

    try {
        conexion = await db.getConnection();
        await conexion.beginTransaction();

        const [consultas] = await conexion.query(
            `SELECT id_cita
             FROM consulta
             WHERE id_consulta = ?
             FOR UPDATE`,
            [req.params.id]
        );

        if (consultas.length === 0) {
            await conexion.rollback();

            return res.status(404).json({
                mensaje: "Consulta no encontrada"
            });
        }

        await conexion.query(
            "DELETE FROM consulta WHERE id_consulta = ?",
            [req.params.id]
        );

        await conexion.query(
            `UPDATE cita
             SET estado = 'Confirmada'
             WHERE id_cita = ? AND estado = 'Atendida'`,
            [consultas[0].id_cita]
        );

        await conexion.commit();

        res.status(200).json({
            mensaje: "Consulta eliminada correctamente"
        });

    } catch (error) {
        if (conexion) {
            await conexion.rollback();
        }

        console.error("Error al eliminar consulta:", error);

        res.status(500).json({
            mensaje: "Error al eliminar la consulta"
        });

    } finally {
        if (conexion) conexion.release();
    }
};
