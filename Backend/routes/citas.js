
const express = require("express");

const router = express.Router();

const citasController = require(
    "../controllers/citasController"
);

// LISTAR CITAS
router.get("/", citasController.listarCitas);

// BUSCAR CITA
router.get("/:id", citasController.obtenerCita);

// REGISTRAR CITA
router.post("/", citasController.crearCita);

// ACTUALIZAR CITA
router.put("/:id", citasController.actualizarCita);

// ELIMINAR CITA
router.delete("/:id", citasController.eliminarCita);

module.exports = router;
