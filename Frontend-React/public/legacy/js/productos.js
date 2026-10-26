
/*
 * PETCARE+ - INVENTARIO
 * API Express + MySQL
 */

(() => {
    "use strict";

    const $ = id => document.getElementById(id);

    const el = {
        tabla: $("tablaInventario"),
        buscar: $("buscarProducto"),
        filtroStock: $("filtrarStockProducto"),
        filtroEstado: $("filtrarEstadoProducto"),
        cantidad: $("cantidadProductosInventario"),
        mensaje: $("mensajeInventario"),

        total: $("inventarioTotal"),
        stockBajo: $("inventarioStockBajo"),
        agotados: $("inventarioAgotados"),
        valor: $("inventarioValor"),

        modal: $("modalProducto"),
        form: $("formProducto"),
        titulo: $("tituloModalProducto"),
        mensajeForm: $("mensajeFormularioProducto"),

        nuevo: $("nuevoProducto"),
        cerrar: $("cerrarModalProducto"),
        cancelar: $("cancelarProducto"),
        guardar: $("guardarProducto"),

        id: $("productoId"),
        nombre: $("productoNombre"),
        categoria: $("productoCategoria"),
        precio: $("productoPrecio"),
        stock: $("productoStock"),
        vencimiento: $("productoVencimiento"),
        estado: $("productoEstado"),
        descripcion: $("productoDescripcion")
    };

    let productos = [];
    let guardando = false;

    // =====================================
    // CONEXIÓN API
    // =====================================

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
            throw new Error("No se pudo conectar con Node.js.");
        }

        if (respuesta.status === 401) {
            sessionStorage.removeItem("petcare_token");
            window.location.replace("login.html");
            throw new Error("Tu sesión ha vencido.");
        }

        if (respuesta.status === 403) {
            throw new Error("No tienes permisos suficientes.");
        }

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje || `Error HTTP ${respuesta.status}`
            );
        }

        return datos;
    }

    function lista(respuesta) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.datos)) return respuesta.datos;

        throw new Error(
            "La API no devolvió una lista válida de productos."
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

    // =====================================
    // FORMATO
    // =====================================

    function soles(numero) {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN"
        }).format(Number(numero) || 0);
    }

    function fechaInput(valor) {
        if (!valor) return "";
        return String(valor).slice(0, 10);
    }

    function fechaLegible(valor) {
        const fecha = fechaInput(valor);
        if (!fecha) return "—";

        const [anio, mes, dia] = fecha.split("-");
        return `${dia}/${mes}/${anio}`;
    }

    function crearCelda(fila, contenido) {
        const td = document.createElement("td");
        td.textContent = contenido ?? "—";
        fila.appendChild(td);
        return td;
    }

    // =====================================
    // ESTADÍSTICAS
    // =====================================

    function actualizarEstadisticas() {
        const stockBajo = productos.filter(
            p => Number(p.stock) <= 5
        );

        const agotados = productos.filter(
            p => Number(p.stock) === 0
        );

        const valorTotal = productos.reduce(
            (total, p) =>
                total + Number(p.precio) * Number(p.stock),
            0
        );

        el.total.textContent = productos.length;
        el.stockBajo.textContent = stockBajo.length;
        el.agotados.textContent = agotados.length;
        el.valor.textContent = soles(valorTotal);
    }

    // =====================================
    // FILTRAR Y MOSTRAR
    // =====================================

    function productosFiltrados() {
        const texto = el.buscar.value.trim().toLowerCase();
        const stock = el.filtroStock.value;
        const estado = el.filtroEstado.value;

        return productos.filter(p => {
            const contenido = [
                p.nombre,
                p.categoria,
                p.descripcion
            ]
                .map(v => String(v ?? ""))
                .join(" ")
                .toLowerCase();

            const cantidad = Number(p.stock);

            let coincideStock = true;

            if (stock === "bajo") {
                coincideStock = cantidad <= 5;
            }

            if (stock === "agotado") {
                coincideStock = cantidad === 0;
            }

            if (stock === "disponible") {
                coincideStock = cantidad > 0;
            }

            return contenido.includes(texto) &&
                coincideStock &&
                (!estado || p.estado === estado);
        });
    }

    function mostrarProductos() {
        const filtrados = productosFiltrados();

        el.tabla.replaceChildren();

        el.cantidad.textContent =
            `Mostrando ${filtrados.length} de ${productos.length} productos`;

        actualizarEstadisticas();

        if (filtrados.length === 0) {
            const fila = document.createElement("tr");

            const td = crearCelda(
                fila,
                productos.length
                    ? "No hay productos que coincidan con los filtros."
                    : "Todavía no hay productos registrados."
            );

            td.colSpan = 7;
            td.style.textAlign = "center";
            td.style.padding = "28px";

            el.tabla.appendChild(fila);
            return;
        }

        filtrados.forEach(p => {
            const fila = document.createElement("tr");

            const nombreCelda = document.createElement("td");

            const nombre = document.createElement("div");
            nombre.className = "cliente-nombre";
            nombre.textContent = `📦 ${p.nombre}`;

            const descripcion = document.createElement("div");
            descripcion.className = "cliente-sub";
            descripcion.textContent = p.descripcion || "";

            nombreCelda.append(nombre, descripcion);
            fila.appendChild(nombreCelda);

            crearCelda(fila, p.categoria || "Sin categoría");
            crearCelda(fila, soles(p.precio));

            const tdStock = document.createElement("td");
            const etiquetaStock = document.createElement("span");

            const cantidad = Number(p.stock);

            etiquetaStock.className =
                "stock-etiqueta " +
                (cantidad === 0
                    ? "stock-agotado"
                    : cantidad <= 5
                        ? "stock-bajo"
                        : "stock-normal");

            etiquetaStock.textContent =
                cantidad === 0
                    ? "Agotado"
                    : cantidad <= 5
                        ? `${cantidad} · Bajo`
                        : `${cantidad} unidades`;

            tdStock.appendChild(etiquetaStock);
            fila.appendChild(tdStock);

            crearCelda(
                fila,
                fechaLegible(p.fecha_vencimiento)
            );

            const tdEstado = document.createElement("td");
            const etiquetaEstado = document.createElement("span");

            etiquetaEstado.className =
                "producto-estado " +
                (p.estado === "Activo"
                    ? "producto-activo"
                    : "producto-inactivo");

            etiquetaEstado.textContent = p.estado || "—";

            tdEstado.appendChild(etiquetaEstado);
            fila.appendChild(tdEstado);

            const acciones = document.createElement("td");

            const editar = document.createElement("button");
            editar.type = "button";
            editar.className = "btn-edit";
            editar.textContent = "✏️ Editar";
            editar.addEventListener(
                "click",
                () => abrirModal(p)
            );

            const eliminar = document.createElement("button");
            eliminar.type = "button";
            eliminar.className = "btn-delete";
            eliminar.textContent = "🗑 Eliminar";
            eliminar.addEventListener(
                "click",
                () => eliminarProducto(p)
            );

            acciones.append(editar, eliminar);
            fila.appendChild(acciones);

            el.tabla.appendChild(fila);
        });
    }

    // =====================================
    // CARGAR PRODUCTOS
    // =====================================

    async function cargarProductos() {
        try {
            const respuesta = await api("/productos");

            productos = lista(respuesta);

            mostrarProductos();
            mensaje("");

        } catch (error) {
            console.error(error);
            mensaje(error.message, true);
        }
    }

    // =====================================
    // FORMULARIO
    // =====================================

    function abrirModal(producto = null) {
        el.form.reset();
        el.mensajeForm.textContent = "";

        el.id.value = producto?.id_producto || "";
        el.nombre.value = producto?.nombre || "";
        el.categoria.value = producto?.categoria || "";
        el.precio.value = producto?.precio ?? "";
        el.stock.value = producto?.stock ?? "";
        el.vencimiento.value = fechaInput(
            producto?.fecha_vencimiento
        );
        el.estado.value = producto?.estado || "Activo";
        el.descripcion.value = producto?.descripcion || "";

        el.titulo.textContent = producto
            ? "Editar producto"
            : "Registrar producto";

        el.guardar.textContent = producto
            ? "Guardar cambios"
            : "Registrar producto";

        el.modal.hidden = false;
        document.body.style.overflow = "hidden";

        el.nombre.focus();
    }

    function cerrarModal() {
        if (guardando) return;

        el.modal.hidden = true;
        document.body.style.overflow = "";
    }

    function datosFormulario() {
        return {
            nombre: el.nombre.value.trim(),
            categoria: el.categoria.value.trim() || null,
            precio: Number(el.precio.value),
            stock: Number(el.stock.value),
            fecha_vencimiento: el.vencimiento.value || null,
            estado: el.estado.value,
            descripcion: el.descripcion.value.trim() || null
        };
    }

    async function guardarProducto(evento) {
        evento.preventDefault();

        if (guardando || !el.form.reportValidity()) return;

        const id = el.id.value;
        const datos = datosFormulario();

        if (!datos.nombre ||
            !Number.isFinite(datos.precio) ||
            datos.precio < 0 ||
            !Number.isInteger(datos.stock) ||
            datos.stock < 0) {
            errorFormulario(
                "Revisa el nombre, precio y stock del producto."
            );
            return;
        }

        guardando = true;
        el.guardar.disabled = true;
        el.guardar.textContent = "Guardando...";
        el.mensajeForm.textContent = "";

        try {
            const respuesta = await api(
                id
                    ? `/productos/${encodeURIComponent(id)}`
                    : "/productos",
                {
                    method: id ? "PUT" : "POST",
                    body: JSON.stringify(datos)
                }
            );

            el.modal.hidden = true;
            document.body.style.overflow = "";

            await cargarProductos();

            mensaje(
                respuesta.mensaje ||
                "Producto guardado correctamente."
            );

        } catch (error) {
            errorFormulario(error.message);

        } finally {
            guardando = false;
            el.guardar.disabled = false;
            el.guardar.textContent = id
                ? "Guardar cambios"
                : "Registrar producto";
        }
    }

    // =====================================
    // ELIMINAR PRODUCTO
    // =====================================

    async function eliminarProducto(producto) {
        const confirmar = window.confirm(
            `¿Eliminar el producto "${producto.nombre}"?\n\n` +
            "Esta acción no se puede deshacer."
        );

        if (!confirmar) return;

        try {
            const respuesta = await api(
                `/productos/${encodeURIComponent(producto.id_producto)}`,
                { method: "DELETE" }
            );

            await cargarProductos();

            mensaje(
                respuesta.mensaje ||
                "Producto eliminado correctamente."
            );

        } catch (error) {
            mensaje(error.message, true);
        }
    }

    // =====================================
    // EVENTOS
    // =====================================

    el.nuevo.addEventListener(
        "click",
        () => abrirModal()
    );

    el.cerrar.addEventListener("click", cerrarModal);
    el.cancelar.addEventListener("click", cerrarModal);

    el.form.addEventListener("submit", guardarProducto);

    el.buscar.addEventListener("input", mostrarProductos);

    el.filtroStock.addEventListener(
        "change",
        mostrarProductos
    );

    el.filtroEstado.addEventListener(
        "change",
        mostrarProductos
    );

    el.modal.addEventListener("click", evento => {
        if (evento.target === el.modal) cerrarModal();
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && !el.modal.hidden) {
            cerrarModal();
        }
    });

    cargarProductos();

})();
