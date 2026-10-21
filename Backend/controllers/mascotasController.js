
const mascotaRepository = require(
  "../repositories/mascotaRepository"
);

// =====================================
// VALIDAR DATOS DE LA MASCOTA
// =====================================
function validarMascota(datos) {
  const {
    id_cliente,
    id_especie,
    nombre,
    peso,
    sexo,
    fecha_nacimiento
  } = datos;

  if (
    !Number.isInteger(Number(id_cliente)) ||
    Number(id_cliente) <= 0
  ) {
    return "El cliente no es válido";
  }

  if (
    !Number.isInteger(Number(id_especie)) ||
    Number(id_especie) <= 0
  ) {
    return "La especie no es válida";
  }

  if (
    typeof nombre !== "string" ||
    !nombre.trim()
  ) {
    return "El nombre de la mascota es obligatorio";
  }

  if (
    peso != null &&
    peso !== "" &&
    (
      !Number.isFinite(Number(peso)) ||
      Number(peso) < 0
    )
  ) {
    return "El peso debe ser un número válido";
  }

  if (
    sexo != null &&
    sexo !== "" &&
    !["Macho", "Hembra"].includes(sexo)
  ) {
    return "El sexo no es válido";
  }

  if (
    fecha_nacimiento &&
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)
  ) {
    return "La fecha debe tener formato YYYY-MM-DD";
  }

  return null;
}

// =====================================
// PREPARAR DATOS
// =====================================
function prepararDatos(datos) {
  return {
    id_cliente: Number(datos.id_cliente),
    id_especie: Number(datos.id_especie),
    nombre: datos.nombre.trim(),
    raza: datos.raza || null,
    sexo: datos.sexo || null,
    fecha_nacimiento: datos.fecha_nacimiento || null,
    peso: datos.peso === ""
      ? null
      : (datos.peso ?? null),
    observaciones: datos.observaciones || null
  };
}

// =====================================
// VERIFICAR CLIENTE Y ESPECIE
// =====================================
async function verificarRelaciones(datos) {
  const clienteExiste =
    await mascotaRepository.existeCliente(datos.id_cliente);

  if (!clienteExiste) {
    return "El cliente no existe";
  }

  const especieExiste =
    await mascotaRepository.existeEspecie(datos.id_especie);

  if (!especieExiste) {
    return "La especie no existe";
  }

  return null;
}

// =====================================
// 1. LISTAR MASCOTAS
// =====================================
exports.listarMascotas = async (req, res) => {
  try {
    const mascotas = await mascotaRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Mascotas obtenidas correctamente",
      total: mascotas.length,
      datos: mascotas
    });

  } catch (error) {
    console.error("Error al listar mascotas:", error);

    return res.status(500).json({
      mensaje: "Error al obtener las mascotas"
    });
  }
};

// =====================================
// 2. BUSCAR MASCOTA POR ID
// =====================================
exports.obtenerMascota = async (req, res) => {
  try {
    const mascota = await mascotaRepository.obtenerPorId(
      req.params.id
    );

    if (!mascota) {
      return res.status(404).json({
        mensaje: "Mascota no encontrada"
      });
    }

    return res.status(200).json({
      datos: mascota
    });

  } catch (error) {
    console.error("Error al buscar mascota:", error);

    return res.status(500).json({
      mensaje: "Error al buscar la mascota"
    });
  }
};

// =====================================
// 3. REGISTRAR MASCOTA
// =====================================
exports.crearMascota = async (req, res) => {
  try {
    const errorValidacion = validarMascota(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const errorRelacion = await verificarRelaciones(req.body);

    if (errorRelacion) {
      return res.status(404).json({
        mensaje: errorRelacion
      });
    }

    const mascota = await mascotaRepository.crear(
      prepararDatos(req.body)
    );

    return res.status(201).json({
      mensaje: "Mascota registrada correctamente",
      id_mascota: mascota.id_mascota
    });

  } catch (error) {
    console.error("Error al registrar mascota:", error);

    return res.status(500).json({
      mensaje: "Error al registrar la mascota"
    });
  }
};

// =====================================
// 4. ACTUALIZAR MASCOTA
// =====================================
exports.actualizarMascota = async (req, res) => {
  try {
    const mascotaActual =
      await mascotaRepository.obtenerPorId(req.params.id);

    if (!mascotaActual) {
      return res.status(404).json({
        mensaje: "Mascota no encontrada"
      });
    }

    const errorValidacion = validarMascota(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const errorRelacion = await verificarRelaciones(req.body);

    if (errorRelacion) {
      return res.status(404).json({
        mensaje: errorRelacion
      });
    }

    await mascotaRepository.actualizar(
      req.params.id,
      prepararDatos(req.body)
    );

    return res.status(200).json({
      mensaje: "Mascota actualizada correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar mascota:", error);

    return res.status(500).json({
      mensaje: "Error al actualizar la mascota"
    });
  }
};

// =====================================
// 5. ELIMINAR MASCOTA
// =====================================
exports.eliminarMascota = async (req, res) => {
  try {
    const eliminado = await mascotaRepository.eliminar(
      req.params.id
    );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Mascota no encontrada"
      });
    }

    return res.status(200).json({
      mensaje: "Mascota eliminada correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar mascota:", error);

    const codigo =
      error.parent?.code || error.original?.code;

    if (
      codigo === "ER_ROW_IS_REFERENCED_2" ||
      codigo === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        mensaje:
          "No puedes eliminar esta mascota porque tiene citas o remisiones relacionadas"
      });
    }

    return res.status(500).json({
      mensaje: "Error al eliminar la mascota"
    });
  }
};
