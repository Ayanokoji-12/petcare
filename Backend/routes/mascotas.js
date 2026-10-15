
const express = require("express");

const router = express.Router();

const mascotasController = require(
    "../controllers/mascotasController"
);

// LISTAR MASCOTAS
router.get(
    "/",
    mascotasController.listarMascotas
);

// BUSCAR MASCOTA
router.get(
    "/:id",
    mascotasController.obtenerMascota
);

// REGISTRAR MASCOTA
router.post(
    "/",
    mascotasController.crearMascota
);

// ACTUALIZAR MASCOTA
router.put(
    "/:id",
    mascotasController.actualizarMascota
);

// ELIMINAR MASCOTA
router.delete(
    "/:id",
    mascotasController.eliminarMascota
);

module.exports = router;
