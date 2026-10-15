
const express = require("express");
const db = require("../db");

const router = express.Router();

// LISTAR ESPECIES
router.get("/", async (req, res) => {
    try {
        const [especies] = await db.query(
            "SELECT * FROM especie ORDER BY nombre ASC"
        );

        res.status(200).json({
            mensaje: "Especies obtenidas correctamente",
            total: especies.length,
            datos: especies
        });

    } catch (error) {
        console.error("Error al listar especies:", error);

        res.status(500).json({
            mensaje: "Error al obtener especies"
        });
    }
});

module.exports = router;
