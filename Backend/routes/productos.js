
const express = require("express");

const router = express.Router();

// CONTROLADOR DE PRODUCTOS
const controller = require(
    "../controllers/productosController"
);

// MIDDLEWARE DE AUTENTICACIÓN Y PERMISOS
const {
    verificarToken,
    permitirRoles
} = require("../middlewares/authMiddleware");

// PROTEGER TODAS LAS RUTAS DE PRODUCTOS
// Solo pueden acceder usuarios con rol Administrador
router.use(
    verificarToken,
    permitirRoles("Administrador")
);

// LISTAR PRODUCTOS
router.get("/", controller.listarProductos);

// PRODUCTOS CON STOCK BAJO
router.get(
    "/stock-bajo",
    controller.productosStockBajo
);

// BUSCAR PRODUCTO POR ID
router.get("/:id", controller.obtenerProducto);

// REGISTRAR PRODUCTO
router.post("/", controller.crearProducto);

// ACTUALIZAR PRODUCTO
router.put("/:id", controller.actualizarProducto);

// ELIMINAR PRODUCTO
router.delete("/:id", controller.eliminarProducto);

// EXPORTAR RUTAS
module.exports = router;
