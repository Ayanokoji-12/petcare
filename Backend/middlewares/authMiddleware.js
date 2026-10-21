
const jwt = require("jsonwebtoken");

const usuarioRepository = require("../repositories/usuarioRepository");

// ====================================
// VERIFICAR TOKEN JWT
// ====================================
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

    const usuario = await usuarioRepository.buscarPorId(
      datos.id_usuario
    );

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Usuario no encontrado"
      });
    }

    const empleado = usuario.empleadoInfo;

    if (
      usuario.estado !== "Activo" ||
      empleado.estado !== "Activo"
    ) {
      return res.status(403).json({
        mensaje: "Cuenta inactiva"
      });
    }

    req.usuario = {
      id_usuario: usuario.id_usuario,
      id_empleado: usuario.id_empleado,
      correo: usuario.correo,
      nombres: empleado.nombres,
      apellidos: empleado.apellidos,
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

    console.error("Error al verificar token:", error);

    return res.status(500).json({
      mensaje: "Error al verificar token"
    });
  }
};

// ====================================
// PERMISOS SEGÚN ROL
// ====================================
const permitirRoles = (...roles) => {
  return (req, res, next) => {
    if (
      !req.usuario ||
      !roles.includes(req.usuario.rol)
    ) {
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
