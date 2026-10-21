
const sequelize = require("../config/database");

const consultaRepository = require(
  "../repositories/consultaRepository"
);

async function probarConsultas() {
  try {
    await sequelize.authenticate();

    console.log("✅ Sequelize conectado correctamente");

    const consultas = await consultaRepository.obtenerTodos();

    console.log(
      "✅ Consultas encontradas:",
      consultas.length
    );

    console.table(consultas);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;

  } finally {
    await sequelize.close();
  }
}

probarConsultas();
