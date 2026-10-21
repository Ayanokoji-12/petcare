
const sequelize = require("../config/database");

const mascotaRepository = require(
  "../repositories/mascotaRepository"
);

async function probarMascotas() {
  try {
    await sequelize.authenticate();

    console.log("✅ Sequelize conectado correctamente");

    const mascotas = await mascotaRepository.obtenerTodos();

    console.log("✅ Mascotas encontradas:", mascotas.length);

    console.table(mascotas);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;

  } finally {
    await sequelize.close();
  }
}

probarMascotas();
