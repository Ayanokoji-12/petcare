
/**
 * PETCARE+
 * MÓDULO DE GESTIÓN DE CLIENTES
 *
 * Funciones:
 * - Listar clientes
 * - Registrar clientes
 * - Buscar clientes
 * - Editar clientes
 * - Eliminar clientes
 * - Actualizar contador
 *
 * Backend: Node.js + Express
 * Base de datos: MySQL
 */

(() => {
    "use strict";

    // ==========================================
    // 1. CONFIGURACIÓN
    // ==========================================

    const API_URL = "/api/clientes";

    const $ = (id) => document.getElementById(id);

    const elementos = {
        tabla: $("tablaClientes"),
        buscar: $("buscarCliente"),
        cantidad: $("cantidadClientes"),
        total: $("totalClientes"),

        mensaje: $("mensajeClientes"),

        modal: $("modalCliente"),
        tituloModal: $("tituloModalCliente"),
        formulario: $("formCliente"),
        mensajeFormulario: $("mensajeFormulario"),

        nuevo: $("nuevoCliente"),
        cerrar: $("cerrarModalCliente"),
        cancelar: $("cancelarCliente"),
        guardar: $("guardarCliente"),

        id: $("clienteId"),
        nombres: $("clienteNombres"),
        apellidos: $("clienteApellidos"),
        dni: $("clienteDni"),
        telefono: $("clienteTelefono"),
        correo: $("clienteCorreo"),
        direccion: $("clienteDireccion")
    };

    let listaClientes = [];
    let guardando = false;

    // ==========================================
    // 2. OBTENER TOKEN
    // ==========================================

    function obtenerToken() {
        return sessionStorage.getItem("petcare_token");
    }

    function cerrarSesionPorSeguridad() {
        sessionStorage.removeItem("petcare_token");
        window.location.replace("login.html");
    }

    // ==========================================
    // 3. PETICIONES A LA API
    // ==========================================

    async function peticionAPI(ruta = "", opciones = {}) {
        const token = obtenerToken();

        if (!token) {
            cerrarSesionPorSeguridad();
            throw new Error("Debes iniciar sesión.");
        }

        let respuesta;

        try {
            respuesta = await fetch(API_URL + ruta, {
                ...opciones,

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    ...(opciones.headers || {})
                }
            });

        } catch (error) {
            throw new Error(
                "No se pudo conectar con el servidor Node.js."
            );
        }

        if (
            respuesta.status === 401 ||
            respuesta.status === 403
        ) {
            cerrarSesionPorSeguridad();

            throw new Error(
                "Tu sesión venció o no tienes permisos."
            );
        }

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje ||
                `Error del servidor: ${respuesta.status}`
            );
        }

        return datos;
    }

    // ==========================================
    // 4. MOSTRAR MENSAJES
    // ==========================================

    function mostrarMensaje(texto, esError = false) {
        elementos.mensaje.textContent = texto;

        elementos.mensaje.style.color = esError
            ? "#b3263e"
            : "#087f70";
    }

    function mostrarErrorFormulario(texto) {
        elementos.mensajeFormulario.textContent = texto;
        elementos.mensajeFormulario.style.color = "#b3263e";
    }

    // ==========================================
    // 5. ABRIR MODAL
    // ==========================================

    function abrirModal(cliente = null) {
        elementos.formulario.reset();

        elementos.mensajeFormulario.textContent = "";

        if (cliente) {
            elementos.tituloModal.textContent =
                "Editar cliente";

            elementos.id.value =
                cliente.id_cliente;

            elementos.nombres.value =
                cliente.nombres || "";

            elementos.apellidos.value =
                cliente.apellidos || "";

            elementos.dni.value =
                cliente.dni || "";

            elementos.telefono.value =
                cliente.telefono || "";

            elementos.correo.value =
                cliente.correo || "";

            elementos.direccion.value =
                cliente.direccion || "";

            elementos.guardar.textContent =
                "Guardar cambios";

        } else {
            elementos.tituloModal.textContent =
                "Registrar nuevo cliente";

            elementos.id.value = "";

            elementos.guardar.textContent =
                "Registrar cliente";
        }

        elementos.modal.hidden = false;

        document.body.style.overflow = "hidden";

        elementos.nombres.focus();
    }

    // ==========================================
    // 6. CERRAR MODAL
    // ==========================================

    function cerrarModal() {
        if (guardando) return;

        elementos.modal.hidden = true;

        document.body.style.overflow = "";
    }

    // ==========================================
    // 7. CREAR CELDAS SEGURAS
    // ==========================================

    function crearCelda(fila, valor) {
        const celda = document.createElement("td");

        celda.textContent = valor ?? "—";

        fila.appendChild(celda);

        return celda;
    }

    // ==========================================
    // 8. FILTRAR CLIENTES
    // ==========================================

    function filtrarClientes() {
        const busqueda = elementos.buscar.value
            .trim()
            .toLowerCase();

        return listaClientes.filter((cliente) => {
            const contenido = [
                cliente.nombres,
                cliente.apellidos,
                cliente.dni,
                cliente.telefono,
                cliente.correo,
                cliente.direccion
            ]
                .map((valor) => String(valor ?? ""))
                .join(" ")
                .toLowerCase();

            return contenido.includes(busqueda);
        });
    }

    // ==========================================
    // 9. MOSTRAR CLIENTES EN TABLA
    // ==========================================

    
function mostrarClientes() {
    const clientesFiltrados = filtrarClientes();

    elementos.tabla.replaceChildren();

    elementos.cantidad.textContent =
        `${clientesFiltrados.length} cliente(s)`;

    elementos.total.textContent = listaClientes.length;

    // SIN RESULTADOS
    if (clientesFiltrados.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 5;
        celda.className = "cliente-vacio";

        const icono = document.createElement("div");
        icono.className = "cliente-vacio-icono";
        icono.textContent = "🐾";

        const titulo = document.createElement("strong");
        titulo.textContent = elementos.buscar.value.trim()
            ? "No encontramos clientes"
            : "Todavía no hay clientes registrados";

        const descripcion = document.createElement("p");
        descripcion.textContent = elementos.buscar.value.trim()
            ? "Prueba con otro nombre, DNI o teléfono."
            : "Registra tu primer cliente para comenzar.";

        celda.append(icono, titulo, descripcion);
        fila.appendChild(celda);
        elementos.tabla.appendChild(fila);
        return;
    }

    // COLORES PARA LOS AVATARES
    const colores = [
        "avatar-verde",
        "avatar-morado",
        "avatar-dorado",
        "avatar-azul",
        "avatar-rosa"
    ];

    clientesFiltrados.forEach((cliente) => {
        const fila = document.createElement("tr");
        fila.className = "cliente-fila";

        // NOMBRE + AVATAR
        const celdaNombre = document.createElement("td");

        const perfil = document.createElement("div");
        perfil.className = "cliente-perfil";

        const avatar = document.createElement("div");

        const nombreCompleto =
            `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim();

        const inicialNombre =
            String(cliente.nombres || "").trim().charAt(0);

        const inicialApellido =
            String(cliente.apellidos || "").trim().charAt(0);

        const iniciales =
            (inicialNombre + inicialApellido).toUpperCase() || "🐾";

        // El mismo cliente conserva su color al buscar
        const claveColor = String(
            cliente.id_cliente ??
            cliente.id ??
            nombreCompleto
        );

        const indiceColor = Array.from(claveColor).reduce(
            (total, letra) => total + letra.charCodeAt(0),
            0
        ) % colores.length;

        avatar.className =
            `cliente-avatar ${colores[indiceColor]}`;

        avatar.textContent = iniciales;
        avatar.setAttribute("aria-hidden", "true");

        const informacion = document.createElement("div");
        informacion.className = "cliente-info";

        const nombre = document.createElement("div");
        nombre.className = "cliente-nombre";
        nombre.textContent = nombreCompleto || "Sin nombre";

        const direccion = document.createElement("div");
        direccion.className = "cliente-sub";

        const iconoDireccion = document.createElement("span");
        iconoDireccion.textContent = "📍";

        const textoDireccion = document.createElement("span");
        textoDireccion.textContent =
            cliente.direccion || "Sin dirección registrada";

        direccion.append(iconoDireccion, textoDireccion);
        informacion.append(nombre, direccion);
        perfil.append(avatar, informacion);
        celdaNombre.appendChild(perfil);
        fila.appendChild(celdaNombre);

        // DNI
        const celdaDni = document.createElement("td");

        const dni = document.createElement("span");
        dni.className = "cliente-dni";
        dni.textContent = cliente.dni || "—";

        celdaDni.appendChild(dni);
        fila.appendChild(celdaDni);

        // TELÉFONO
        const celdaTelefono = document.createElement("td");

        const telefono = document.createElement("span");
        telefono.className = "cliente-dato";

        const iconoTelefono = document.createElement("span");
        iconoTelefono.textContent = "📞";

        const textoTelefono = document.createElement("span");
        textoTelefono.textContent = cliente.telefono || "Sin teléfono";

        telefono.append(iconoTelefono, textoTelefono);
        celdaTelefono.appendChild(telefono);
        fila.appendChild(celdaTelefono);

        // CORREO
        const celdaCorreo = document.createElement("td");

        const correo = document.createElement("span");
        correo.className = "cliente-correo";
        correo.textContent = cliente.correo || "Sin correo";
        correo.title = cliente.correo || "Sin correo";

        celdaCorreo.appendChild(correo);
        fila.appendChild(celdaCorreo);

        // ACCIONES
        const celdaAcciones = document.createElement("td");

        const acciones = document.createElement("div");
        acciones.className = "cliente-acciones";

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "btn-edit cliente-btn-editar";
        botonEditar.textContent = "✏️ Editar";
        botonEditar.title = "Editar cliente";

        botonEditar.addEventListener("click", () => {
            abrirModal(cliente);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "btn-delete cliente-btn-eliminar";
        botonEliminar.textContent = "🗑 Eliminar";
        botonEliminar.title = "Eliminar cliente";

        botonEliminar.addEventListener("click", () => {
            eliminarCliente(cliente);
        });

        acciones.append(botonEditar, botonEliminar);
        celdaAcciones.appendChild(acciones);
        fila.appendChild(celdaAcciones);

        elementos.tabla.appendChild(fila);
    });
}


    // ==========================================
    // 10. LISTAR CLIENTES DESDE MYSQL
    // ==========================================

    async function cargarClientes() {
        try {
            const respuesta = await peticionAPI();

            // Tu controlador devuelve:
            // { mensaje, total, datos }

            if (!Array.isArray(respuesta.datos)) {
                throw new Error(
                    "La API no devolvió una lista válida."
                );
            }

            listaClientes = respuesta.datos;

            mostrarClientes();

            mostrarMensaje("");

        } catch (error) {
            console.error(
                "Error al cargar clientes:",
                error
            );

            mostrarMensaje(error.message, true);

            elementos.tabla.replaceChildren();

            const fila = document.createElement("tr");
            const celda = document.createElement("td");

            celda.colSpan = 5;
            celda.textContent = "No se pudieron cargar los clientes.";

            fila.appendChild(celda);
            elementos.tabla.appendChild(fila);
        }
    }

    // ==========================================
    // 11. OBTENER DATOS DEL FORMULARIO
    // ==========================================

    function obtenerDatosFormulario() {
        return {
            nombres: elementos.nombres.value.trim(),

            apellidos: elementos.apellidos.value.trim(),

            dni: elementos.dni.value.trim() || null,

            telefono: elementos.telefono.value.trim() || null,

            correo: elementos.correo.value.trim() || null,

            direccion: elementos.direccion.value.trim() || null
        };
    }

    // ==========================================
    // 12. REGISTRAR O ACTUALIZAR CLIENTE
    // ==========================================

    async function guardarCliente(evento) {
        evento.preventDefault();

        if (guardando) return;

        if (!elementos.formulario.reportValidity()) {
            return;
        }

        const idCliente = elementos.id.value;

        const datos = obtenerDatosFormulario();

        if (!datos.nombres || !datos.apellidos) {
            mostrarErrorFormulario(
                "Los nombres y apellidos son obligatorios."
            );
            return;
        }

        guardando = true;

        elementos.guardar.disabled = true;
        elementos.guardar.textContent = "Guardando...";

        elementos.mensajeFormulario.textContent = "";

        try {
            const editando = Boolean(idCliente);

            const ruta = editando
                ? `/${encodeURIComponent(idCliente)}`
                : "";

            const metodo = editando
                ? "PUT"
                : "POST";

            const respuesta = await peticionAPI(ruta, {
                method: metodo,

                body: JSON.stringify(datos)
            });

            elementos.modal.hidden = true;
            document.body.style.overflow = "";

            await cargarClientes();

            mostrarMensaje(
                respuesta.mensaje ||
                "Cliente guardado correctamente."
            );

        } catch (error) {
            console.error(
                "Error al guardar cliente:",
                error
            );

            mostrarErrorFormulario(error.message);

        } finally {
            guardando = false;

            elementos.guardar.disabled = false;

            elementos.guardar.textContent =
                elementos.id.value
                    ? "Guardar cambios"
                    : "Registrar cliente";
        }
    }

    // ==========================================
    // 13. ELIMINAR CLIENTE
    // ==========================================

    async function eliminarCliente(cliente) {
        const nombreCompleto =
            `${cliente.nombres} ${cliente.apellidos}`;

        const confirmar = window.confirm(
            `¿Estás seguro de eliminar a ${nombreCompleto}?\n\n` +
            "Esta acción no se puede deshacer."
        );

        if (!confirmar) return;

        try {
            const respuesta = await peticionAPI(
                `/${encodeURIComponent(cliente.id_cliente)}`,
                {
                    method: "DELETE"
                }
            );

            await cargarClientes();

            mostrarMensaje(
                respuesta.mensaje ||
                "Cliente eliminado correctamente."
            );

        } catch (error) {
            console.error(
                "Error al eliminar cliente:",
                error
            );

            mostrarMensaje(error.message, true);
        }
    }

    // ==========================================
    // 14. EVENTOS DE BOTONES
    // ==========================================

    elementos.nuevo.addEventListener("click", () => {
        abrirModal();
    });

    elementos.cerrar.addEventListener("click", cerrarModal);

    elementos.cancelar.addEventListener("click", cerrarModal);

    elementos.buscar.addEventListener("input", () => {
        mostrarClientes();
    });

    elementos.formulario.addEventListener(
        "submit",
        guardarCliente
    );

    // CERRAR AL HACER CLIC FUERA DEL FORMULARIO
    elementos.modal.addEventListener("click", (evento) => {
        if (evento.target === elementos.modal) {
            cerrarModal();
        }
    });

    // CERRAR CON ESC
    document.addEventListener("keydown", (evento) => {
        if (
            evento.key === "Escape" &&
            !elementos.modal.hidden
        ) {
            cerrarModal();
        }
    });

    // ==========================================
    // 15. INICIAR MÓDULO
    // ==========================================

    cargarClientes();

})();
