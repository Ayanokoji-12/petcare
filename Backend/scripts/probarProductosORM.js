
const sequelize = require("../config/database");

const productoRepository = require(
  "../repositories/productoRepository"
);

async function probarProductos() {
  try {
    await sequelize.authenticate();

    console.log("✅ Conexión con Sequelize correcta");

    const productos =
      await productoRepository.obtenerTodos();

    console.log("✅ Productos encontrados:", productos.length);

    console.table(productos);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;

  } finally {
    await sequelize.close();
  }
}

probarProductos();
