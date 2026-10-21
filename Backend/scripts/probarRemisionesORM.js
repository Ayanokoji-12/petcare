
const sequelize = require("../config/database");

const remisionRepository = require(
  "../repositories/remisionRepository"
);

async function probarRemisiones() {
  try {
    await sequelize.authenticate();

    console.log("✅ Sequelize conectado correctamente");

    const remisiones = await remisionRepository.obtenerTodos();

    console.log(
      "✅ Remisiones encontradas:",
      remisiones.length
    );

    console.table(remisiones);

  } catch (error) {
    console.error("❌ Error al probar remisiones:", error);
    process.exitCode = 1;

  } finally {
    await sequelize.close();
  }
}

probarRemisiones();
