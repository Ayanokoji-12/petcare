
const express = require("express");
const router = express.Router();

const controller = require(
    "../controllers/serviciosController"
);

router.get("/", controller.listarServicios);

router.get("/:id", controller.obtenerServicio);

router.post("/", controller.crearServicio);

router.put("/:id", controller.actualizarServicio);

router.delete("/:id", controller.eliminarServicio);

module.exports = router;
