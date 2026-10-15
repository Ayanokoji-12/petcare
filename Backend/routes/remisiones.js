
const express = require("express");

const router = express.Router();

const controller = require(
    "../controllers/remisionesController"
);

// LISTAR
router.get("/", controller.listarRemisiones);

// BUSCAR
router.get("/:id", controller.obtenerRemision);

// REGISTRAR
router.post("/", controller.crearRemision);

// ACTUALIZAR
router.put("/:id", controller.actualizarRemision);

// ELIMINAR
router.delete("/:id", controller.eliminarRemision);

module.exports = router;
