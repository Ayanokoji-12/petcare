
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const {
  Cliente,
  Mascota,
  Especie,
  Servicio,
  Cita
} = require("../modelos/asociaciones");

function limpiar(valor, maximo = 150) {
  return typeof valor === "string"
    ? valor.trim().slice(0, maximo)
    : "";
}

function errorPublico(mensaje, status = 400) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

exports.crearSolicitud = async (req, res) => {
  try {
    const propietario = limpiar(req.body.propietario, 200);
    const telefono = limpiar(req.body.telefono, 20);
    const mascotaNombre = limpiar(req.body.mascota, 100);
    const especieNombre = limpiar(req.body.especie, 100);
    const motivo = limpiar(req.body.motivo, 1000);
    const fecha = limpiar(req.body.fecha, 10);
    const hora = limpiar(req.body.hora, 5);
    const idServicio = Number(req.body.id_servicio);

    if (
      !propietario ||
      !telefono ||
      !mascotaNombre ||
      !especieNombre ||
      !fecha ||
      !hora ||
      !Number.isInteger(idServicio) ||
      idServicio <= 0
    ) {
      throw errorPublico("Completa todos los campos obligatorios.");
    }

    const partesNombre = propietario.split(/\s+/);

    if (partesNombre.length < 2) {
      throw errorPublico(
        "Ingresa al menos un nombre y un apellido del propietario."
      );
    }

    const nombres = partesNombre.slice(0, -1).join(" ");
    const apellidos = partesNombre.at(-1);

    if (!/^\d{9}$/.test(telefono)) {
      throw errorPublico("Ingresa un celular válido de 9 dígitos.");
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)
    ) {
      throw errorPublico("La fecha u hora no tiene un formato válido.");
    }

    const fechaHora = `${fecha} ${hora}:00`;
    const fechaSeleccionada = new Date(`${fecha}T${hora}:00`);

    if (
      Number.isNaN(fechaSeleccionada.getTime()) ||
      fechaSeleccionada <= new Date()
    ) {
      throw errorPublico("Selecciona una fecha y hora futuras.");
    }

    const citaCreada = await sequelize.transaction(async (transaction) => {
      const especie = await Especie.findOne({
        where: {
          nombre: { [Op.like]: especieNombre }
        },
        transaction
      });

      if (!especie) {
        throw errorPublico("La especie seleccionada no existe.");
      }

      const servicio = await Servicio.findOne({
        where: {
          id_servicio: idServicio,
          estado: "Activo"
        },
        transaction
      });

      if (!servicio) {
        throw errorPublico("El servicio seleccionado no está disponible.");
      }

      const cliente = await Cliente.create(
        {
          nombres,
          apellidos,
          telefono
        },
        { transaction }
      );

      const mascota = await Mascota.create(
        {
          id_cliente: cliente.id_cliente,
          id_especie: especie.id_especie,
          nombre: mascotaNombre
        },
        { transaction }
      );

      const cita = await Cita.create(
        {
          id_mascota: mascota.id_mascota,
          id_empleado: null,
          id_servicio: servicio.id_servicio,
          fecha: fechaHora,
          motivo: motivo || null,
          estado: "Pendiente"
        },
        { transaction }
      );

      return cita;
    });

    return res.status(201).json({
      mensaje: "Solicitud de cita registrada correctamente.",
      id_cita: citaCreada.id_cita,
      estado: "Pendiente"
    });
  } catch (error) {
    console.error("Error al registrar solicitud pública:", error);

    return res.status(error.status || 500).json({
      mensaje: error.status
        ? error.message
        : "No se pudo registrar la solicitud de cita."
    });
  }
};
