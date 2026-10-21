
const sequelize = require("../config/database");
const citaRepository = require(
  "../repositories/citaRepository"
);

async function probarCitas() {
  try {
    await sequelize.authenticate();

    console.log("✅ Sequelize conectado correctamente");

    const citas = await citaRepository.obtenerTodos();

    console.log("✅ Citas encontradas:", citas.length);

    console.table(citas);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;

  } finally {
    await sequelize.close();
  }
}

probarCitas();
