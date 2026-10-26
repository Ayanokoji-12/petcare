
/*
 * PETCARE+ - MÓDULO DE VENTAS
 * Node.js + Express + MySQL
 */

(() => {
    "use strict";

    const $ = id => document.getElementById(id);

    const el = {
        tabla: $("tablaVentas"),
        buscar: $("buscarVenta"),
        filtro: $("filtrarEstadoVenta"),
        cantidad: $("cantidadVentas"),
        mensaje: $("mensajeVentas"),

        pagadas: $("ventasPagadas"),
        ingresos: $("ventasIngresos"),
        anuladas: $("ventasAnuladas"),

        modal: $("modalVenta"),
        form: $("formVenta"),
        cliente: $("ventaCliente"),
        empleado: $("ventaEmpleado"),
        productos: $("listaProductosVenta"),
        agregar: $("agregarProductoVenta"),
        total: $("totalVenta"),
        mensajeForm: $("mensajeFormularioVenta"),
        guardar: $("guardarVenta"),
        nueva: $("nuevaVenta"),
        cerrar: $("cerrarModalVenta"),
        cancelar: $("cancelarVenta"),

        modalDetalle: $("modalDetalleVenta"),
        tituloDetalle: $("tituloDetalleVenta"),
        contenidoDetalle: $("contenidoDetalleVenta"),
        cerrarDetalle: $("cerrarDetalleVenta")
    };

    let ventas = [];
    let catalogo = [];
    let guardando = false;
    let cargandoFormulario = false;

    const soles = valor =>
        new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN"
        }).format(Number(valor) || 0);

    // ==========================================
    // API
    // ==========================================

    async function api(ruta, opciones = {}) {
        const token = sessionStorage.getItem("petcare_token");

        if (!token) {
            window.location.replace("login.html");
            throw new Error("Debes iniciar sesión.");
        }

        let respuesta;

        try {
            respuesta = await fetch("/api" + ruta, {
                ...opciones,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    ...(opciones.headers || {})
                }
            });
        } catch {
            throw new Error("No se pudo conectar con el servidor.");
        }

        if (respuesta.status === 401) {
            sessionStorage.removeItem("petcare_token");
            window.location.replace("login.html");
            throw new Error("La sesión ha vencido.");
        }

        if (respuesta.status === 403) {
            throw new Error("No tienes permisos para esta operación.");
        }

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje || `Error HTTP ${respuesta.status}`
            );
        }

        return datos;
    }

    function lista(respuesta, clave) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.datos)) return respuesta.datos;
        if (Array.isArray(respuesta?.[clave])) return respuesta[clave];

        throw new Error(
            `La API de ${clave} no devolvió una lista válida.`
        );
    }

    function mensaje(texto, error = false) {
        el.mensaje.textContent = texto;
        el.mensaje.style.color = error ? "#b3263e" : "#087f70";
    }

    function errorFormulario(texto) {
        el.mensajeForm.textContent = texto;
        el.mensajeForm.style.color = "#b3263e";
    }

    function fechaLegible(valor) {
        if (!valor) return "—";

        const texto = String(valor);
        const coincidencia = texto.match(
            /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?/
        );

        if (!coincidencia) return texto;

        return `${coincidencia[3]}/${coincidencia[2]}/` +
            `${coincidencia[1]} ${coincidencia[4] || ""}`;
    }

    function celda(fila, texto) {
        const td = document.createElement("td");
        td.textContent = texto ?? "—";
        fila.appendChild(td);
        return td;
    }

    function boton(texto, clase, accion) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = clase;
        btn.textContent = texto;
        btn.addEventListener("click", accion);
        return btn;
    }

    function crearOpcion(valor, texto) {
        const opcion = document.createElement("option");
        opcion.value = valor;
        opcion.textContent = texto;
        return opcion;
    }

    // ==========================================
    // LISTADO Y ESTADÍSTICAS
    // ==========================================

    
// ==========================================
// PETCARE+ | VENTAS ULTRA PREMIUM
// LISTADO Y ESTADÍSTICAS
// ==========================================

function mostrarVentas() {
    const busqueda = el.buscar.value.trim().toLowerCase();
    const estado = el.filtro.value;

    // FILTRAR VENTAS
    const filtradas = ventas.filter(v => {
        const texto = [
            v.id_venta,
            v.cliente,
            v.empleado
        ].map(x => String(x ?? ""))
         .join(" ")
         .toLowerCase();

        return texto.includes(busqueda) &&
            (!estado || v.estado === estado);
    });

    el.tabla.replaceChildren();

    // ESTADÍSTICAS
    const pagadas = ventas.filter(
        v => v.estado === "Pagada"
    );

    const anuladas = ventas.filter(
        v => v.estado === "Anulada"
    );

    const ingresos = pagadas.reduce(
        (total, v) => total + Number(v.total || 0),
        0
    );

    el.pagadas.textContent = pagadas.length;
    el.anuladas.textContent = anuladas.length;
    el.ingresos.textContent = soles(ingresos);

    el.cantidad.textContent =
        `Mostrando ${filtradas.length} de ${ventas.length} ventas`;

    // CREAR ELEMENTOS SEGUROS
    function elemento(tipo, clase, texto) {
        const nodo = document.createElement(tipo);

        if (clase) {
            nodo.className = clase;
        }

        if (texto !== undefined) {
            nodo.textContent = String(texto);
        }

        return nodo;
    }

    // TABLA VACÍA
    if (!filtradas.length) {
        const fila = document.createElement("tr");

        const td = elemento(
            "td",
            "ventas-loading",
            ventas.length
                ? "🔍 No hay ventas que coincidan con los filtros."
                : "🛒 Todavía no hay ventas registradas."
        );

        td.colSpan = 7;

        fila.appendChild(td);
        el.tabla.appendChild(fila);
        return;
    }

    // CREAR FILAS
    filtradas.forEach(v => {
        const fila = document.createElement("tr");

        // 1. NÚMERO DE VENTA
        const tdNumero = document.createElement("td");

        tdNumero.appendChild(
            elemento(
                "span",
                "venta-numero",
                `#${v.id_venta}`
            )
        );

        fila.appendChild(tdNumero);

        // 2. FECHA
        const tdFecha = document.createElement("td");

        tdFecha.appendChild(
            elemento(
                "span",
                "venta-fecha",
                fechaLegible(v.fecha)
            )
        );

        fila.appendChild(tdFecha);

        // 3. CLIENTE
        const tdCliente = document.createElement("td");

        const clienteBox = elemento(
            "div",
            "venta-cliente"
        );

        const avatar = elemento(
            "div",
            "venta-cliente-avatar",
            "👤"
        );

        const clienteInfo = elemento(
            "div",
            "venta-cliente-info"
        );

        clienteInfo.appendChild(
            elemento(
                "strong",
                "",
                v.cliente || "Cliente no registrado"
            )
        );

        clienteBox.append(avatar, clienteInfo);
        tdCliente.appendChild(clienteBox);
        fila.appendChild(tdCliente);

        // 4. EMPLEADO
        const tdEmpleado = document.createElement("td");

        tdEmpleado.appendChild(
            elemento(
                "span",
                "venta-empleado",
                v.empleado || "Sin asignar"
            )
        );

        fila.appendChild(tdEmpleado);

        // 5. TOTAL
        const tdTotal = document.createElement("td");

        tdTotal.appendChild(
            elemento(
                "strong",
                "venta-total",
                soles(v.total)
            )
        );

        fila.appendChild(tdTotal);

        // 6. ESTADO
        const tdEstado = document.createElement("td");

        const esPagada = v.estado === "Pagada";

        const etiqueta = elemento(
            "span",
            esPagada
                ? "venta-estado venta-estado-pagada"
                : "venta-estado venta-estado-anulada",
            esPagada
                ? "✓ Pagada"
                : "✕ Anulada"
        );

        tdEstado.appendChild(etiqueta);
        fila.appendChild(tdEstado);

        // 7. ACCIONES
        const tdAcciones = document.createElement("td");

        const acciones = elemento(
            "div",
            "venta-acciones"
        );

        // VER DETALLE
        const detalle = elemento(
            "button",
            "venta-btn-detalle",
            "👁 Detalle"
        );

        detalle.type = "button";
        detalle.title = "Ver detalle de venta";

        detalle.addEventListener("click", () => {
            verDetalle(v);
        });

        acciones.appendChild(detalle);

        // ANULAR VENTA
        if (esPagada) {
            const anular = elemento(
                "button",
                "venta-btn-anular",
                "↩ Anular"
            );

            anular.type = "button";
            anular.title = "Anular venta";

            anular.addEventListener("click", () => {
                anularVenta(v);
            });

            acciones.appendChild(anular);
        }

        tdAcciones.appendChild(acciones);
        fila.appendChild(tdAcciones);

        // AGREGAR FILA
        el.tabla.appendChild(fila);
      });
  }

    async function cargarVentas() {
        try {
            const respuesta = await api("/ventas");
            ventas = lista(respuesta, "ventas");

            mostrarVentas();
            mensaje("");
        } catch (error) {
            console.error(error);
            mensaje(error.message, true);
        }
    }

    // ==========================================
    // FORMULARIO
    // ==========================================

    function llenarSelect(select, registros, id, nombre, inicial) {
        select.replaceChildren();
        select.appendChild(crearOpcion("", inicial));

        registros.forEach(r => {
            select.appendChild(
                crearOpcion(r[id], nombre(r))
            );
        });
    }

    function productoDisponible(producto) {
        if (producto.estado !== "Activo") return false;
        if (Number(producto.stock) <= 0) return false;

        if (producto.fecha_vencimiento) {
            const fecha = String(producto.fecha_vencimiento).slice(0, 10);
            const ahora = new Date();
            const hoy = [
                ahora.getFullYear(),
                String(ahora.getMonth() + 1).padStart(2, "0"),
                String(ahora.getDate()).padStart(2, "0")
            ].join("-");

            if (fecha < hoy) return false;
        }

        return true;
    }

    async function cargarOpciones() {
        const [resClientes, resProductos, resEmpleados] =
            await Promise.all([
                api("/clientes"),
                api("/productos"),
                api("/empleados")
            ]);

        const clientes = lista(resClientes, "clientes");
        const productos = lista(resProductos, "productos");
        const empleados = lista(resEmpleados, "empleados");

        catalogo = productos.filter(productoDisponible);

        llenarSelect(
            el.cliente,
            clientes,
            "id_cliente",
            c => `${c.nombres} ${c.apellidos}`,
            "Seleccionar cliente"
        );

        llenarSelect(
            el.empleado,
            empleados,
            "id_empleado",
            e => `${e.nombres} ${e.apellidos}`,
            "Seleccionar empleado"
        );

        if (!clientes.length) {
            throw new Error("Primero registra un cliente.");
        }

        if (!empleados.length) {
            throw new Error(
                "No hay empleados disponibles. Revisa /api/empleados."
            );
        }

        if (!catalogo.length) {
            throw new Error(
                "No hay productos activos, vigentes y con stock."
            );
        }
    }

    function crearFilaProducto() {
        const fila = document.createElement("div");
        fila.className = "venta-producto-fila";

        const select = document.createElement("select");
        select.className = "venta-producto-select";
        select.required = true;
        select.appendChild(crearOpcion("", "Seleccionar producto"));

        catalogo.forEach(p => {
            select.appendChild(
                crearOpcion(
                    p.id_producto,
                    `${p.nombre} · ${soles(p.precio)} · Stock: ${p.stock}`
                )
            );
        });

        const cantidad = document.createElement("input");
        cantidad.type = "number";
        cantidad.min = "1";
        cantidad.step = "1";
        cantidad.value = "1";
        cantidad.required = true;
        cantidad.className = "venta-producto-cantidad";
        cantidad.setAttribute("aria-label", "Cantidad");

        const subtotal = document.createElement("strong");
        subtotal.className = "venta-producto-subtotal";
        subtotal.textContent = soles(0);

        const quitar = boton("✕", "btn-delete", () => {
            fila.remove();
            calcularTotal();
        });
        quitar.setAttribute("aria-label", "Quitar producto");

        select.addEventListener("change", calcularTotal);
        cantidad.addEventListener("input", calcularTotal);

        fila.append(select, cantidad, subtotal, quitar);
        el.productos.appendChild(fila);

        calcularTotal();
    }

    function obtenerItems() {
        const filas = [
            ...el.productos.querySelectorAll(".venta-producto-fila")
        ];

        return filas.map(fila => ({
            id_producto: Number(
                fila.querySelector(".venta-producto-select").value
            ),
            cantidad: Number(
                fila.querySelector(".venta-producto-cantidad").value
            )
        }));
    }

    function calcularTotal() {
        const filas = [
            ...el.productos.querySelectorAll(".venta-producto-fila")
        ];

        let totalCentimos = 0;

        filas.forEach(fila => {
            const id = Number(
                fila.querySelector(".venta-producto-select").value
            );

            const cantidad = Number(
                fila.querySelector(".venta-producto-cantidad").value
            );

            const producto = catalogo.find(
                p => Number(p.id_producto) === id
            );

            const subtotalCentimos = producto &&
                Number.isInteger(cantidad) &&
                cantidad > 0
                ? Math.round(Number(producto.precio) * 100) * cantidad
                : 0;

            totalCentimos += subtotalCentimos;

            fila.querySelector(".venta-producto-subtotal")
                .textContent = soles(subtotalCentimos / 100);
        });

        el.total.textContent = soles(totalCentimos / 100);
    }

    async function abrirModal() {
        if (cargandoFormulario) return;

        el.form.reset();
        el.productos.replaceChildren();
        el.total.textContent = soles(0);
        el.mensajeForm.textContent = "";

        el.modal.hidden = false;
        document.body.style.overflow = "hidden";

        cargandoFormulario = true;
        el.guardar.disabled = true;
        el.agregar.disabled = true;
        el.mensajeForm.textContent = "Cargando datos...";

        try {
            await cargarOpciones();

            if (el.modal.hidden) return;

            crearFilaProducto();

            el.mensajeForm.textContent = "";
            el.guardar.disabled = false;
            el.agregar.disabled = false;

        } catch (error) {
            if (!el.modal.hidden) {
                errorFormulario(error.message);
            }

        } finally {
            cargandoFormulario = false;
        }
    }

    function cerrarModal() {
        if (guardando) return;

        el.modal.hidden = true;
        document.body.style.overflow = "";
    }

    async function registrarVenta(evento) {
        evento.preventDefault();

        if (guardando || cargandoFormulario) return;
        if (!el.form.reportValidity()) return;

        const productos = obtenerItems();

        if (!productos.length) {
            errorFormulario("Agrega al menos un producto.");
            return;
        }

        const ids = productos.map(p => p.id_producto);

        if (new Set(ids).size !== ids.length) {
            errorFormulario(
                "No puedes repetir productos en la misma venta."
            );
            return;
        }

        for (const item of productos) {
            const producto = catalogo.find(
                p => Number(p.id_producto) === item.id_producto
            );

            if (!producto ||
                !Number.isInteger(item.cantidad) ||
                item.cantidad <= 0) {
                errorFormulario("Revisa los productos y cantidades.");
                return;
            }

            if (item.cantidad > Number(producto.stock)) {
                errorFormulario(
                    `Stock insuficiente de ${producto.nombre}. ` +
                    `Disponible: ${producto.stock}`
                );
                return;
            }
        }

        guardando = true;
        el.guardar.disabled = true;
        el.guardar.textContent = "Registrando...";
        el.mensajeForm.textContent = "";

        try {
            const respuesta = await api("/ventas", {
                method: "POST",
                body: JSON.stringify({
                    id_cliente: Number(el.cliente.value),
                    id_empleado: Number(el.empleado.value),
                    productos
                })
            });

            el.modal.hidden = true;
            document.body.style.overflow = "";

            await cargarVentas();

            mensaje(
                `Venta #${respuesta.id_venta} registrada. ` +
                `Total: ${soles(respuesta.total)}`
            );

            // El stock del inventario se actualiza en MySQL.
            // Al recargar el panel, se mostrarán las nuevas cantidades.

        } catch (error) {
            errorFormulario(error.message);

        } finally {
            guardando = false;
            el.guardar.disabled = false;
            el.guardar.textContent = "Registrar venta";
        }
    }

    // ==========================================
    // DETALLE DE VENTA
    // ==========================================

    async function verDetalle(venta) {
        el.modalDetalle.hidden = false;
        document.body.style.overflow = "hidden";

        el.tituloDetalle.textContent =
            `Detalle de venta #${venta.id_venta}`;

        el.contenidoDetalle.textContent = "Cargando detalle...";

        try {
            const respuesta = await api(
                `/ventas/${encodeURIComponent(venta.id_venta)}`
            );

            const info = respuesta.venta;
            const productos = respuesta.productos || [];

            el.contenidoDetalle.replaceChildren();

            const encabezado = document.createElement("div");
            encabezado.className = "venta-detalle-info";

            [
                `Cliente: ${info.cliente}`,
                `Empleado: ${info.empleado}`,
                `Fecha: ${fechaLegible(info.fecha)}`,
                `Estado: ${info.estado}`
            ].forEach(texto => {
                const p = document.createElement("p");
                p.textContent = texto;
                encabezado.appendChild(p);
            });

            el.contenidoDetalle.appendChild(encabezado);

            const tabla = document.createElement("table");
            tabla.className = "clientes-table";

            const cabecera = document.createElement("thead");
            const filaCabecera = document.createElement("tr");

            ["Producto", "Cantidad", "Precio", "Subtotal"]
                .forEach(titulo => {
                    const th = document.createElement("th");
                    th.textContent = titulo;
                    filaCabecera.appendChild(th);
                });

            cabecera.appendChild(filaCabecera);
            tabla.appendChild(cabecera);

            const cuerpo = document.createElement("tbody");

            productos.forEach(p => {
                const fila = document.createElement("tr");

                celda(fila, p.producto);
                celda(fila, p.cantidad);
                celda(fila, soles(p.precio_unitario));
                celda(fila, soles(p.subtotal));

                cuerpo.appendChild(fila);
            });

            tabla.appendChild(cuerpo);
            el.contenidoDetalle.appendChild(tabla);

            const total = document.createElement("h3");
            total.className = "venta-detalle-total";
            total.textContent = `Total: ${soles(info.total)}`;

            el.contenidoDetalle.appendChild(total);

        } catch (error) {
            el.contenidoDetalle.textContent = error.message;
        }
    }

    function cerrarDetalle() {
        el.modalDetalle.hidden = true;
        document.body.style.overflow = "";
    }

    // ==========================================
    // ANULAR VENTA
    // ==========================================

    async function anularVenta(venta) {
        const confirmar = window.confirm(
            `¿Anular la venta #${venta.id_venta}?\n\n` +
            "Los productos volverán al inventario."
        );

        if (!confirmar) return;

        try {
            // Ajusta la ruta únicamente si tu archivo
            // Backend/routes/ventas.js usa otra dirección.
            const respuesta = await api(
                `/ventas/${encodeURIComponent(venta.id_venta)}/anular`,
                { method: "PUT" }
            );

            await cargarVentas();

            mensaje(
                respuesta.mensaje ||
                "Venta anulada correctamente."
            );

        } catch (error) {
            mensaje(error.message, true);
        }
    }

    // ==========================================
    // EVENTOS
    // ==========================================

    el.nueva.addEventListener("click", abrirModal);
    el.cerrar.addEventListener("click", cerrarModal);
    el.cancelar.addEventListener("click", cerrarModal);

    el.agregar.addEventListener("click", crearFilaProducto);
    el.form.addEventListener("submit", registrarVenta);

    el.buscar.addEventListener("input", mostrarVentas);
    el.filtro.addEventListener("change", mostrarVentas);

    el.cerrarDetalle.addEventListener("click", cerrarDetalle);

    el.modal.addEventListener("click", evento => {
        if (evento.target === el.modal) cerrarModal();
    });

    el.modalDetalle.addEventListener("click", evento => {
        if (evento.target === el.modalDetalle) cerrarDetalle();
    });

    document.addEventListener("keydown", evento => {
        if (evento.key !== "Escape") return;

        if (!el.modalDetalle.hidden) {
            cerrarDetalle();
        } else if (!el.modal.hidden) {
            cerrarModal();
        }
    });

    cargarVentas();

})();
