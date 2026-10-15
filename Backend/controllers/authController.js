
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ====================================
// INICIAR SESION
// ====================================
exports.login = async (req, res) => {
    try {
        const { correo, password } = req.body || {};

        if (
            typeof correo !== "string" ||
            typeof password !== "string" ||
            !correo.trim() ||
            !password
        ) {
            return res.status(400).json({
                mensaje: "Correo y contraseña son obligatorios"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("Falta JWT_SECRET en .env");
            return res.status(500).json({
                mensaje: "Error de configuración del servidor"
            });
        }

        const [usuarios] = await db.query(`
            SELECT
                u.id_usuario,
                u.id_empleado,
                u.correo,
                u.password_hash,
                u.rol,
                u.estado,
                e.nombres,
                e.apellidos,
                e.estado AS estado_empleado
            FROM usuario u
            INNER JOIN empleado e
                ON u.id_empleado = e.id_empleado
            WHERE u.correo = ?
            LIMIT 1
        `, [correo.trim()]);

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensaje: "Credenciales incorrectas"
            });
        }

        const usuario = usuarios[0];

        if (
            usuario.estado !== "Activo" ||
            usuario.estado_empleado !== "Activo"
        ) {
            return res.status(403).json({
                mensaje: "Cuenta desactivada"
            });
        }

        const passwordCorrecta = await bcrypt.compare(
            password,
            usuario.password_hash
        );

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: "Credenciales incorrectas"
            });
        }

        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "2h",
                algorithm: "HS256"
            }
        );

        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso",
            token,
            usuario: {
                id_usuario: usuario.id_usuario,
                id_empleado: usuario.id_empleado,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("Error en login:", error);

        return res.status(500).json({
            mensaje: "Error al iniciar sesión"
        });
    }
};

// ====================================
// OBTENER PERFIL
// ====================================
exports.perfil = (req, res) => {
    res.status(200).json({
        mensaje: "Usuario autenticado",
        usuario: req.usuario
    });
};
