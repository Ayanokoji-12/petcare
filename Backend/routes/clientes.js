
const express = require("express");

const router = express.Router();

const {
    verificarToken,
    permitirRoles
} = require("../middlewares/authMiddleware");

router.use(
    verificarToken,
    permitirRoles("Administrador")
);


const clientesController = require(
    "../controllers/clientesController"
);

// LISTAR CLIENTES
router.get(
    "/",
    clientesController.listarClientes
);

// BUSCAR CLIENTE
router.get(
    "/:id",
    clientesController.obtenerCliente
);

// REGISTRAR CLIENTE
router.post(
    "/",
    clientesController.crearCliente
);

// ACTUALIZAR CLIENTE
router.put(
    "/:id",
    clientesController.actualizarCliente
);

// ELIMINAR CLIENTE
router.delete(
    "/:id",
    clientesController.eliminarCliente
);

module.exports = router;
