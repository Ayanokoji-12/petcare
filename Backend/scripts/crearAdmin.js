
require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("../db");

async function crearAdmin() {
    try {
        const idEmpleado = 4;
        const correo = "admin@petcare.local";

        const password = process.env.ADMIN_INITIAL_PASSWORD;

        if (!password || password.length < 12) {
            throw new Error(
                "Configura ADMIN_INITIAL_PASSWORD con al menos 12 caracteres en .env"
            );
        }

        const [empleados] = await db.query(
            "SELECT id_empleado FROM empleado WHERE id_empleado = ?",
            [idEmpleado]
        );

        if (empleados.length === 0) {
            throw new Error("No existe el empleado administrador");
        }

        const [usuarios] = await db.query(
            "SELECT id_usuario FROM usuario WHERE id_empleado = ? OR correo = ?",
            [idEmpleado, correo]
        );

        if (usuarios.length > 0) {
            console.log("La cuenta administrativa ya existe");
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [resultado] = await db.query(
            `INSERT INTO usuario
             (id_empleado, correo, password_hash, rol, estado)
             VALUES (?, ?, ?, 'Administrador', 'Activo')`,
            [idEmpleado, correo, passwordHash]
        );

        console.log("Administrador creado correctamente");
        console.log("ID de usuario:", resultado.insertId);
        console.log("Correo:", correo);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await db.end();
    }
}

crearAdmin();
