
const express = require("express");

const router = express.Router();

const controller = require(
    "../controllers/ventasController"
);

const {
    verificarToken,
    permitirRoles
} = require("../middlewares/authMiddleware");

router.use(
    verificarToken,
    permitirRoles("Administrador")
);

// LISTAR VENTAS
router.get("/", controller.listarVentas);

// BUSCAR VENTA
router.get("/:id", controller.obtenerVenta);

// REGISTRAR VENTA
router.post("/", controller.crearVenta);

// ANULAR VENTA
router.put("/:id/anular", controller.anularVenta);

module.exports = router;
