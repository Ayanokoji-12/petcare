const express = require("express");
const router = express.Router();

const especiesController = require("../controllers/especiesController");

// LISTAR ESPECIES
router.get("/", especiesController.listarEspecies);

// OBTENER ESPECIE POR ID
router.get("/:id", especiesController.obtenerEspecie);

// REGISTRAR ESPECIE
router.post("/", especiesController.crearEspecie);

// ACTUALIZAR ESPECIE
router.put("/:id", especiesController.actualizarEspecie);

// ELIMINAR ESPECIE
router.delete("/:id", especiesController.eliminarEspecie);

module.exports = router;