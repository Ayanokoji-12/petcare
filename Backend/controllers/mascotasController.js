
const db = require("../db");

// =====================================
// FUNCION PARA VALIDAR UNA MASCOTA
// =====================================
function validarMascota(datos) {
    const {
        id_cliente,
        id_especie,
        nombre,
        peso,
        sexo,
        fecha_nacimiento
    } = datos;

    if (!Number.isInteger(Number(id_cliente)) ||
        Number(id_cliente) <= 0) {
        return "El cliente no es válido";
    }

    if (!Number.isInteger(Number(id_especie)) ||
        Number(id_especie) <= 0) {
        return "La especie no es válida";
    }

    if (typeof nombre !== "string" ||
        !nombre.trim()) {
        return "El nombre de la mascota es obligatorio";
    }

    if (peso != null && peso !== "" &&
        (!Number.isFinite(Number(peso)) ||
         Number(peso) < 0)) {
        return "El peso debe ser un número válido";
    }

    if (sexo != null && sexo !== "" &&
        !["Macho", "Hembra"].includes(sexo)) {
        return "El sexo no es válido";
    }

    if (fecha_nacimiento &&
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)) {
        return "La fecha debe tener formato YYYY-MM-DD";
    }

    return null;
}

// =====================================
// 1. LISTAR TODAS LAS MASCOTAS
// =====================================
exports.listarMascotas = async (req, res) => {
    try {
        const [mascotas] = await db.query(`
            SELECT
                m.id_mascota,
                m.nombre,
                m.raza,
                m.sexo,
                m.fecha_nacimiento,
                m.peso,
                m.observaciones,
                m.id_cliente,
                m.id_especie,
                e.nombre AS especie,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS propietario
            FROM mascota m
            INNER JOIN cliente c
                ON m.id_cliente = c.id_cliente
            INNER JOIN especie e
                ON m.id_especie = e.id_especie
            ORDER BY m.id_mascota DESC
        `);

        res.status(200).json({
            mensaje: "Mascotas obtenidas correctamente",
            total: mascotas.length,
            datos: mascotas
        });

    } catch (error) {
        console.error("Error al listar mascotas:", error);

        res.status(500).json({
            mensaje: "Error al obtener las mascotas"
        });
    }
};

// =====================================
// 2. BUSCAR MASCOTA POR ID
// =====================================
exports.obtenerMascota = async (req, res) => {
    try {
        const { id } = req.params;

        const [mascotas] = await db.query(`
            SELECT
                m.*,
                e.nombre AS especie,
                CONCAT(c.nombres, ' ', c.apellidos)
                    AS propietario
            FROM mascota m
            INNER JOIN cliente c
                ON m.id_cliente = c.id_cliente
            INNER JOIN especie e
                ON m.id_especie = e.id_especie
            WHERE m.id_mascota = ?
        `, [id]);

        if (mascotas.length === 0) {
            return res.status(404).json({
                mensaje: "Mascota no encontrada"
            });
        }

        res.status(200).json({
            datos: mascotas[0]
        });

    } catch (error) {
        console.error("Error al buscar mascota:", error);

        res.status(500).json({
            mensaje: "Error al buscar la mascota"
        });
    }
};

// =====================================
// 3. REGISTRAR UNA MASCOTA
// =====================================
exports.crearMascota = async (req, res) => {
    try {
        const errorValidacion = validarMascota(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const {
            id_cliente,
            id_especie,
            nombre,
            raza,
            sexo,
            fecha_nacimiento,
            peso,
            observaciones
        } = req.body;

        const [clientes] = await db.query(
            "SELECT id_cliente FROM cliente WHERE id_cliente = ?",
            [id_cliente]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                mensaje: "El cliente no existe"
            });
        }

        const [especies] = await db.query(
            "SELECT id_especie FROM especie WHERE id_especie = ?",
            [id_especie]
        );

        if (especies.length === 0) {
            return res.status(404).json({
                mensaje: "La especie no existe"
            });
        }

        const [resultado] = await db.query(`
            INSERT INTO mascota
            (
                id_cliente,
                id_especie,
                nombre,
                raza,
                sexo,
                fecha_nacimiento,
                peso,
                observaciones
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id_cliente,
            id_especie,
            nombre.trim(),
            raza || null,
            sexo || null,
            fecha_nacimiento || null,
            peso === "" ? null : (peso ?? null),
            observaciones || null
        ]);

        res.status(201).json({
            mensaje: "Mascota registrada correctamente",
            id_mascota: resultado.insertId
        });

    } catch (error) {
        console.error("Error al registrar mascota:", error);

        res.status(500).json({
            mensaje: "Error al registrar la mascota"
        });
    }
};

// =====================================
// 4. ACTUALIZAR UNA MASCOTA
// =====================================
exports.actualizarMascota = async (req, res) => {
    try {
        const { id } = req.params;

        const errorValidacion = validarMascota(req.body);

        if (errorValidacion) {
            return res.status(400).json({
                mensaje: errorValidacion
            });
        }

        const {
            id_cliente,
            id_especie,
            nombre,
            raza,
            sexo,
            fecha_nacimiento,
            peso,
            observaciones
        } = req.body;

        const [mascotas] = await db.query(
            "SELECT id_mascota FROM mascota WHERE id_mascota = ?",
            [id]
        );

        if (mascotas.length === 0) {
            return res.status(404).json({
                mensaje: "Mascota no encontrada"
            });
        }

        const [clientes] = await db.query(
            "SELECT id_cliente FROM cliente WHERE id_cliente = ?",
            [id_cliente]
        );

        if (clientes.length === 0) {
            return res.status(404).json({
                mensaje: "El cliente no existe"
            });
        }

        const [especies] = await db.query(
            "SELECT id_especie FROM especie WHERE id_especie = ?",
            [id_especie]
        );

        if (especies.length === 0) {
            return res.status(404).json({
                mensaje: "La especie no existe"
            });
        }

        await db.query(`
            UPDATE mascota SET
                id_cliente = ?,
                id_especie = ?,
                nombre = ?,
                raza = ?,
                sexo = ?,
                fecha_nacimiento = ?,
                peso = ?,
                observaciones = ?
            WHERE id_mascota = ?
        `, [
            id_cliente,
            id_especie,
            nombre.trim(),
            raza || null,
            sexo || null,
            fecha_nacimiento || null,
            peso === "" ? null : (peso ?? null),
            observaciones || null,
            id
        ]);

        res.status(200).json({
            mensaje: "Mascota actualizada correctamente"
        });

    } catch (error) {
        console.error("Error al actualizar mascota:", error);

        res.status(500).json({
            mensaje: "Error al actualizar la mascota"
        });
    }
};

// =====================================
// 5. ELIMINAR UNA MASCOTA
// =====================================
exports.eliminarMascota = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            "DELETE FROM mascota WHERE id_mascota = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "Mascota no encontrada"
            });
        }

        res.status(200).json({
            mensaje: "Mascota eliminada correctamente"
        });

    } catch (error) {
        console.error("Error al eliminar mascota:", error);

        if (
            error.code === "ER_ROW_IS_REFERENCED_2" ||
            error.code === "ER_ROW_IS_REFERENCED"
        ) {
            return res.status(409).json({
                mensaje:
                    "No puedes eliminar esta mascota porque tiene citas o remisiones relacionadas"
            });
        }

        res.status(500).json({
            mensaje: "Error al eliminar la mascota"
        });
    }
};
