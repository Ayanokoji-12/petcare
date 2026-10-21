
const sequelize = require("../config/database");

const {
  Venta,
  DetalleVenta,
  Producto,
  Cliente,
  Empleado
} = require("../modelos/asociaciones");

async function probarVentas() {
  try {
    await sequelize.authenticate();

    console.log("✅ Conexión Sequelize correcta");

    const ventas = await Venta.findAll({
      include: [
        {
          model: Cliente,
          as: "clienteInfo",
          attributes: ["id_cliente", "nombres", "apellidos"]
        },
        {
          model: Empleado,
          as: "empleadoInfo",
          attributes: ["id_empleado", "nombres", "apellidos"]
        },
        {
          model: DetalleVenta,
          as: "detalles",
          include: [
            {
              model: Producto,
              as: "productoInfo",
              attributes: ["id_producto", "nombre", "precio"]
            }
          ]
        }
      ],
      order: [["id_venta", "DESC"]]
    });

    console.log("✅ Ventas encontradas:", ventas.length);

    for (const venta of ventas) {
      console.log(
        JSON.stringify(venta.toJSON(), null, 2)
      );
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;

  } finally {
    await sequelize.close();
  }
}

probarVentas();
