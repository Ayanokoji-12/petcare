
const express = require("express");

const router = express.Router();

const consultasController = require(
    "../controllers/consultasController"
);

// LISTAR CONSULTAS
router.get(
    "/",
    consultasController.listarConsultas
);

// BUSCAR CONSULTA POR ID
router.get(
    "/:id",
    consultasController.obtenerConsulta
);

// REGISTRAR CONSULTA
router.post(
    "/",
    consultasController.crearConsulta
);

// ACTUALIZAR CONSULTA
router.put(
    "/:id",
    consultasController.actualizarConsulta
);

// ELIMINAR CONSULTA
router.delete(
    "/:id",
    consultasController.eliminarConsulta
);

module.exports = router;
