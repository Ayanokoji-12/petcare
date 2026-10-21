
const express = require("express");
const router = express.Router();

const empleadosController = require(
  "../controllers/empleadosController"
);

// LISTAR EMPLEADOS
router.get("/", empleadosController.listarEmpleados);

// OBTENER EMPLEADO POR ID
router.get("/:id", empleadosController.obtenerEmpleado);

// REGISTRAR EMPLEADO
router.post("/", empleadosController.crearEmpleado);

// ACTUALIZAR EMPLEADO
router.put("/:id", empleadosController.actualizarEmpleado);

// ELIMINAR EMPLEADO
router.delete("/:id", empleadosController.eliminarEmpleado);

module.exports = router;
