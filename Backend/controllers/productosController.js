
const productoRepository = require(
  "../repositories/productoRepository"
);

// =======================================
// VALIDAR DATOS DEL PRODUCTO
// =======================================
function validarProducto(datos) {
  const {
    nombre,
    precio,
    stock,
    fecha_vencimiento,
    estado
  } = datos;

  if (typeof nombre !== "string" || !nombre.trim()) {
    return "El nombre del producto es obligatorio";
  }

  if (
    precio === null ||
    precio === undefined ||
    precio === "" ||
    !Number.isFinite(Number(precio)) ||
    Number(precio) < 0
  ) {
    return "El precio debe ser un número válido";
  }

  if (
    stock === null ||
    stock === undefined ||
    stock === "" ||
    !Number.isInteger(Number(stock)) ||
    Number(stock) < 0
  ) {
    return "El stock debe ser un número entero mayor o igual a cero";
  }

  if (
    fecha_vencimiento != null &&
    fecha_vencimiento !== "" &&
    (
      typeof fecha_vencimiento !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(fecha_vencimiento) ||
      !Number.isFinite(
        Date.parse(fecha_vencimiento + "T00:00:00Z")
      )
    )
  ) {
    return "La fecha debe tener formato YYYY-MM-DD";
  }

  if (
    estado !== undefined &&
    !["Activo", "Inactivo"].includes(estado)
  ) {
    return "El estado debe ser Activo o Inactivo";
  }

  return null;
}

// =======================================
// PREPARAR DATOS
// =======================================
function prepararDatos(datos) {
  return {
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion || null,
    categoria: datos.categoria || null,
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    fecha_vencimiento: datos.fecha_vencimiento || null,
    estado: datos.estado ?? "Activo"
  };
}

// =======================================
// 1. LISTAR PRODUCTOS
// =======================================
exports.listarProductos = async (req, res) => {
  try {
    const productos = await productoRepository.obtenerTodos();

    return res.status(200).json({
      mensaje: "Productos obtenidos correctamente",
      total: productos.length,
      datos: productos
    });

  } catch (error) {
    console.error("Error al listar productos:", error);

    return res.status(500).json({
      mensaje: "Error al obtener productos"
    });
  }
};

// =======================================
// 2. BUSCAR PRODUCTO POR ID
// =======================================
exports.obtenerProducto = async (req, res) => {
  try {
    const producto = await productoRepository.obtenerPorId(
      req.params.id
    );

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    return res.status(200).json({
      datos: producto
    });

  } catch (error) {
    console.error("Error al buscar producto:", error);

    return res.status(500).json({
      mensaje: "Error al buscar producto"
    });
  }
};

// =======================================
// 3. REGISTRAR PRODUCTO
// =======================================
exports.crearProducto = async (req, res) => {
  try {
    const errorValidacion = validarProducto(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const datos = prepararDatos(req.body);

    const producto = await productoRepository.crear(datos);

    return res.status(201).json({
      mensaje: "Producto registrado correctamente",
      id_producto: producto.id_producto
    });

  } catch (error) {
    console.error("Error al registrar producto:", error);

    return res.status(500).json({
      mensaje: "Error al registrar producto"
    });
  }
};

// =======================================
// 4. ACTUALIZAR PRODUCTO
// =======================================
exports.actualizarProducto = async (req, res) => {
  try {
    const errorValidacion = validarProducto(req.body);

    if (errorValidacion) {
      return res.status(400).json({
        mensaje: errorValidacion
      });
    }

    const datos = prepararDatos(req.body);

    const producto = await productoRepository.actualizar(
      req.params.id,
      datos
    );

    if (!producto) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Producto actualizado correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar producto:", error);

    return res.status(500).json({
      mensaje: "Error al actualizar producto"
    });
  }
};

// =======================================
// 5. ELIMINAR PRODUCTO
// =======================================
exports.eliminarProducto = async (req, res) => {
  try {
    const eliminado = await productoRepository.eliminar(
      req.params.id
    );

    if (!eliminado) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    return res.status(200).json({
      mensaje: "Producto eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar producto:", error);

    const codigo = error.parent?.code ||
      error.original?.code;

    if (
      codigo === "ER_ROW_IS_REFERENCED_2" ||
      codigo === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        mensaje:
          "No se puede eliminar este producto porque tiene ventas relacionadas"
      });
    }

    return res.status(500).json({
      mensaje: "Error al eliminar producto"
    });
  }
};

// =======================================
// 6. PRODUCTOS CON STOCK BAJO
// =======================================
exports.productosStockBajo = async (req, res) => {
  try {
    const productos =
      await productoRepository.obtenerStockBajo(5);

    return res.status(200).json({
      mensaje: "Productos con stock bajo",
      total: productos.length,
      datos: productos
    });

  } catch (error) {
    console.error("Error al consultar stock:", error);

    return res.status(500).json({
      mensaje: "Error al consultar stock bajo"
    });
  }
};
