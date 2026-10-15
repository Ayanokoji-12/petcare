
const jwt = require("jsonwebtoken");
const db = require("../db");

const verificarToken = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith("Bearer ")) {
            return res.status(401).json({
                mensaje: "Token requerido"
            });
        }

        const token = authorization.split(" ")[1];

        const datos = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        const [usuarios] = await db.query(`
            SELECT
                u.id_usuario,
                u.id_empleado,
                u.correo,
                u.rol,
                u.estado,
                e.nombres,
                e.apellidos,
                e.estado AS estado_empleado
            FROM usuario u
            INNER JOIN empleado e
                ON u.id_empleado = e.id_empleado
            WHERE u.id_usuario = ?
        `, [datos.id_usuario]);

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const usuario = usuarios[0];

        if (
            usuario.estado !== "Activo" ||
            usuario.estado_empleado !== "Activo"
        ) {
            return res.status(403).json({
                mensaje: "Cuenta inactiva"
            });
        }

        req.usuario = {
            id_usuario: usuario.id_usuario,
            id_empleado: usuario.id_empleado,
            correo: usuario.correo,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            rol: usuario.rol
        };

        next();

    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                mensaje: "Token inválido o vencido"
            });
        }

        console.error(error);

        res.status(500).json({
            mensaje: "Error al verificar token"
        });
    }
};

const permitirRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.usuario || !roles.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: "Acceso denegado"
            });
        }

        next();
    };
};

module.exports = {
    verificarToken,
    permitirRoles
};
