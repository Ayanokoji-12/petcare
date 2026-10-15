
require("dotenv").config();

const bcrypt = require("bcrypt");
const db = require("../db");

async function establecerPassword() {
    try {
        const password = process.env.ADMIN_INITIAL_PASSWORD;

        if (!password || password.length < 12) {
            throw new Error(
                "La contraseña debe tener al menos 12 caracteres"
            );
        }

        const hash = await bcrypt.hash(password, 12);

        const [resultado] = await db.query(
            `UPDATE usuario
             SET password_hash = ?
             WHERE id_empleado = 4
               AND correo = 'admin@petcare.local'
               AND rol = 'Administrador'`,
            [hash]
        );

        if (resultado.affectedRows === 0) {
            console.log("No se encontró la cuenta administradora");
            return;
        }

        console.log(
            "Contraseña del administrador configurada correctamente"
        );

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await db.end();
    }
}

establecerPassword();
