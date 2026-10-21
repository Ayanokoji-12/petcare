
const Mascota = require("./Mascota");
const Cliente = require("./Cliente");
const Especie = require("./Especie");
const Cita = require("./Cita");
const Servicio = require("./Servicio");
const Empleado = require("./Empleado");
const Producto = require("./Producto");
const Usuario = require("./Usuario");

// =====================================
// RELACIONES DE MASCOTAS
// =====================================

Mascota.belongsTo(Cliente, {
  foreignKey: "id_cliente",
  as: "cliente"
});

Cliente.hasMany(Mascota, {
  foreignKey: "id_cliente",
  as: "mascotas"
});

Mascota.belongsTo(Especie, {
  foreignKey: "id_especie",
  as: "especieInfo"
});

Especie.hasMany(Mascota, {
  foreignKey: "id_especie",
  as: "mascotas"
});

// =====================================
// RELACIONES DE CITAS
// =====================================

// Cada cita pertenece a una mascota
Cita.belongsTo(Mascota, {
  foreignKey: "id_mascota",
  as: "mascotaInfo"
});

Mascota.hasMany(Cita, {
  foreignKey: "id_mascota",
  as: "citas"
});

// Cada cita corresponde a un servicio
Cita.belongsTo(Servicio, {
  foreignKey: "id_servicio",
  as: "servicioInfo"
});

Servicio.hasMany(Cita, {
  foreignKey: "id_servicio",
  as: "citas"
});

// Una cita puede tener un veterinario asignado
Cita.belongsTo(Empleado, {
  foreignKey: "id_empleado",
  as: "empleadoInfo"
});

Empleado.hasMany(Cita, {
  foreignKey: "id_empleado",
  as: "citas"
});

// =====================================
// RELACIONES DE CONSULTAS MÉDICAS
// =====================================

const Consulta = require("./Consulta");

// Cada consulta pertenece a una cita
Consulta.belongsTo(Cita, {
  foreignKey: "id_cita",
  as: "citaInfo"
});

// Cada cita puede tener una consulta
Cita.hasOne(Consulta, {
  foreignKey: "id_cita",
  as: "consultaInfo"
});

// =====================================
// RELACIONES DE REMISIONES
// =====================================

const Remision = require("./Remision");

// Una remisión pertenece a una mascota
Remision.belongsTo(Mascota, {
  foreignKey: "id_mascota",
  as: "mascotaInfo"
});

Mascota.hasMany(Remision, {
  foreignKey: "id_mascota",
  as: "remisiones"
});

// Una remisión corresponde a un servicio
Remision.belongsTo(Servicio, {
  foreignKey: "id_servicio",
  as: "servicioInfo"
});

Servicio.hasMany(Remision, {
  foreignKey: "id_servicio",
  as: "remisiones"
});

// Una remisión puede tener un empleado de origen
Remision.belongsTo(Empleado, {
  foreignKey: "id_empleado_origen",
  as: "empleadoOrigen"
});

Empleado.hasMany(Remision, {
  foreignKey: "id_empleado_origen",
  as: "remisionesOrigen"
});

// =====================================
// RELACIONES DE VENTAS
// =====================================

const Venta = require("./Venta");

// Cada venta pertenece a un cliente
Venta.belongsTo(Cliente, {
  foreignKey: "id_cliente",
  as: "clienteInfo"
});

Cliente.hasMany(Venta, {
  foreignKey: "id_cliente",
  as: "ventas"
});

// Cada venta pertenece a un empleado
Venta.belongsTo(Empleado, {
  foreignKey: "id_empleado",
  as: "empleadoInfo"
});

Empleado.hasMany(Venta, {
  foreignKey: "id_empleado",
  as: "ventas"
});

// =====================================
// RELACIONES DE DETALLES DE VENTA
// =====================================

const DetalleVenta = require("./DetalleVenta");

// Una venta tiene varios detalles
Venta.hasMany(DetalleVenta, {
  foreignKey: "id_venta",
  as: "detalles"
});

// Cada detalle pertenece a una venta
DetalleVenta.belongsTo(Venta, {
  foreignKey: "id_venta",
  as: "ventaInfo"
});

// Cada detalle corresponde a un producto
DetalleVenta.belongsTo(Producto, {
  foreignKey: "id_producto",
  as: "productoInfo"
});

// Un producto puede aparecer en muchos detalles
Producto.hasMany(DetalleVenta, {
  foreignKey: "id_producto",
  as: "detallesVenta"
});
 

// =====================================
// RELACIONES DE PAGOS
// =====================================

const Pago = require("./Pagos");

// Una venta puede tener varios pagos
Venta.hasMany(Pago, {
  foreignKey: "id_venta",
  as: "pagos"
});

// Cada pago pertenece a una venta
Pago.belongsTo(Venta, {
  foreignKey: "id_venta",
  as: "ventaInfo"
});
// =====================================
// RELACIONES DE USUARIOS
// =====================================

Usuario.belongsTo(Empleado, {
  foreignKey: "id_empleado",
  as: "empleadoInfo"
});

Empleado.hasOne(Usuario, {
  foreignKey: "id_empleado",
  as: "usuarioInfo"
});

module.exports = {
  Producto,
  Mascota,
  Cliente,
  Especie,
  Cita,
  Servicio,
  Empleado,
  Consulta,
  Remision,
  Venta,
  DetalleVenta,
  Pago,
  Usuario
};
