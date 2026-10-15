
const express = require("express");

const router = express.Router();

const controller = require(
    "../controllers/authController"
);

const {
    verificarToken,
    permitirRoles
} = require("../middlewares/authMiddleware");

// INICIO DE SESION
router.post("/login", controller.login);

// PERFIL DEL USUARIO AUTENTICADO
router.get(
    "/perfil",
    verificarToken,
    controller.perfil
);

// RUTA DE PRUEBA PARA ADMINISTRADORES
router.get(
    "/admin",
    verificarToken,
    permitirRoles("Administrador"),
    (req, res) => {
        res.status(200).json({
            mensaje: "Bienvenido al panel administrativo",
            usuario: req.usuario
        });
    }
);

module.exports = router;
