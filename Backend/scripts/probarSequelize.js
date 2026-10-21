
const sequelize = require("../config/database");

async function probarConexion() {
  try {
    await sequelize.authenticate();

    console.log("✅ Sequelize conectado correctamente");
    console.log("✅ Base de datos PETCARE+ disponible");
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

probarConexion();
