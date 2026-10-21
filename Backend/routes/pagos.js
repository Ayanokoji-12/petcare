
const express = require("express");
const router = express.Router();

const pagosController = require("../controllers/pagosController");

// =====================================
// 1. LISTAR TODOS LOS PAGOS
// =====================================
router.get("/", pagosController.listarPagos);

// =====================================
// 2. OBTENER PAGO POR ID
// =====================================
router.get("/:id", pagosController.obtenerPago);

// =====================================
// 3. REGISTRAR PAGO
// =====================================
router.post("/", pagosController.crearPago);

// =====================================
// 4. ANULAR PAGO
// =====================================
router.put("/:id/anular", pagosController.anularPago);

module.exports = router;
