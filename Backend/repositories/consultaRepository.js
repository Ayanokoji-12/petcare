
const sequelize = require("../config/database");

const {
  Consulta,
  Cita,
  Mascota,
  Especie,
  Cliente,
  Empleado
} = require("../modelos/asociaciones");

// =====================================
// RELACIONES PARA CONSULTAS
// =====================================
const relaciones = [
  {
    model: Cita,
    as: "citaInfo",
    required: true,
    include: [
      {
        model: Mascota,
        as: "mascotaInfo",
        required: true,
        include: [
          {
            model: Especie,
            as: "especieInfo",
            required: true
          },
          {
            model: Cliente,
            as: "cliente",
            required: true
          }
        ]
      },
      {
        model: Empleado,
        as: "empleadoInfo",
        required: false
      }
    ]
  }
];

// =====================================
// FORMATEAR RESPUESTA
// =====================================
function formatearConsulta(registro, detallada = true) {
  if (!registro) return null;

  const {
    citaInfo,
    ...campos
  } = registro.toJSON();

  const mascota = citaInfo?.mascotaInfo;
  const cliente = mascota?.cliente;
  const especie = mascota?.especieInfo;
  const empleado = citaInfo?.empleadoInfo;

  const resultado = {
    ...campos,
    mascota: mascota?.nombre ?? null,
    fecha_cita: citaInfo?.fecha ?? null
  };

  if (detallada) {
    resultado.especie = especie?.nombre ?? null;

    resultado.propietario = cliente
      ? `${cliente.nombres} ${cliente.apellidos}`
      : null;

    resultado.veterinario = empleado
      ? `${empleado.nombres} ${empleado.apellidos}`
      : null;
  }

  return resultado;
}

// =====================================
// 1. LISTAR CONSULTAS
// =====================================
const obtenerTodos = async () => {
  const consultas = await Consulta.findAll({
    include: relaciones,
    order: [["fecha_consulta", "DESC"]]
  });

  return consultas.map(c => formatearConsulta(c));
};

// =====================================
// 2. OBTENER CONSULTA POR ID
// =====================================
const obtenerPorId = async (id) => {
  const consulta = await Consulta.findByPk(id, {
    include: relaciones
  });

  return formatearConsulta(consulta, false);
};

// =====================================
// 3. CREAR CONSULTA CON TRANSACCIÓN
// =====================================
const crearConTransaccion = async (datos) => {
  return sequelize.transaction(async (transaction) => {

    const cita = await Cita.findByPk(datos.id_cita, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!cita) {
      const error = new Error("La cita no existe");
      error.status = 404;
      throw error;
    }

    if (cita.estado === "Cancelada") {
      const error = new Error(
        "No se puede registrar una consulta de una cita cancelada"
      );
      error.status = 400;
      throw error;
    }

    const existente = await Consulta.findOne({
      where: { id_cita: datos.id_cita },
      transaction
    });

    if (existente) {
      const error = new Error(
        "Esta cita ya tiene una consulta registrada"
      );
      error.status = 409;
      throw error;
    }

    const consulta = await Consulta.create({
      id_cita: datos.id_cita,
      diagnostico: datos.diagnostico.trim(),
      tratamiento: datos.tratamiento || null,
      observaciones: datos.observaciones || null
    }, { transaction });

    await cita.update({
      estado: "Atendida"
    }, { transaction });

    return consulta;
  });
};

// =====================================
// 4. ACTUALIZAR CONSULTA
// =====================================

const actualizar = async (id, datos) => {
  const consulta = await Consulta.findByPk(id);

  if (!consulta) {
    return null;
  }

  // Solo permitimos actualizar información médica.
  // No se permite modificar id_cita ni fecha_consulta.
  await consulta.update({
    diagnostico: datos.diagnostico.trim(),
    tratamiento: datos.tratamiento || null,
    observaciones: datos.observaciones || null
  });

  return consulta;
};


// =====================================
// 5. ELIMINAR CONSULTA CON TRANSACCIÓN
// =====================================
const eliminarConTransaccion = async (id) => {
  return sequelize.transaction(async (transaction) => {

    const consulta = await Consulta.findByPk(id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!consulta) return false;

    const idCita = consulta.id_cita;

    await consulta.destroy({ transaction });

    await Cita.update(
      { estado: "Confirmada" },
      {
        where: {
          id_cita: idCita,
          estado: "Atendida"
        },
        transaction
      }
    );

    return true;
  });
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crearConTransaccion,
  actualizar,
  eliminarConTransaccion
};
