
const express = require("express");
const router = express.Router();
const db = require("../db");

// Listar empleados registrados
router.get("/", async (req, res) => {
    try {
        const [empleados] = await db.query(`
            SELECT
                id_empleado,
                nombres,
                apellidos
            FROM empleado
            ORDER BY nombres ASC
        `);

        res.status(200).json({
            mensaje: "Empleados obtenidos correctamente",
            total: empleados.length,
            datos: empleados
        });

    } catch (error) {
        console.error("Error al listar empleados:", error);

        res.status(500).json({
            mensaje: "Error al obtener empleados"
        });
    }
});

module.exports = router;
