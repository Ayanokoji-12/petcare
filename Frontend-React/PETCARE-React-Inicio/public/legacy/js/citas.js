
/*
 * PETCARE+ - GESTIÓN DE CITAS
 * Frontend JavaScript + API Express + MySQL
 */

(() => {
    "use strict";

    const $ = (id) => document.getElementById(id);

    const el = {
        tabla: $("tablaCitas"),
        buscar: $("buscarCita"),
        filtroEstado: $("filtrarEstadoCita"),
        filtroFecha: $("filtrarFechaCita"),
        limpiar: $("limpiarFiltrosCitas"),
        cantidad: $("cantidadCitas"),
        mensaje: $("mensajeCitas"),

        total: $("totalCitas"),
        todas: $("citasTodas"),
        pendientes: $("citasPendientes"),
        confirmadas: $("citasConfirmadas"),
        atendidas: $("citasAtendidas"),

        modal: $("modalCita"),
        form: $("formCita"),
        titulo: $("tituloModalCita"),
        mensajeForm: $("mensajeFormularioCita"),

        nuevo: $("nuevaCita"),
        cerrar: $("cerrarModalCita"),
        cancelar: $("cancelarCita"),
        guardar: $("guardarCita"),

        id: $("citaId"),
        mascota: $("citaMascota"),
        servicio: $("citaServicio"),
        veterinario: $("citaVeterinario"),
        fecha: $("citaFecha"),
        estado: $("citaEstado"),
        motivo: $("citaMotivo")
    };

    let citas = [];
    let guardando = false;
    let cargandoFormulario = false;

    // ==========================================
    // PETICIONES A LA API
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

    function extraerLista(respuesta, clave) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.datos)) return respuesta.datos;
        if (Array.isArray(respuesta?.[clave])) return respuesta[clave];
        if (Array.isArray(respuesta?.data)) return respuesta.data;

        throw new Error(
            `La API de ${clave} no devolvió una lista válida.`
        );
    }

    function mostrarMensaje(texto, error = false) {
        el.mensaje.textContent = texto;
        el.mensaje.style.color = error ? "#b3263e" : "#087f70";
    }

    function mostrarErrorFormulario(texto) {
        el.mensajeForm.textContent = texto;
        el.mensajeForm.style.color = "#b3263e";
    }

    // ==========================================
    // FECHAS
    // ==========================================

    function fechaParaInput(valor) {
        if (!valor) return "";

        // Formato MySQL: 2026-10-15 14:30:00
        // También admite ISO: 2026-10-15T14:30:00
        const texto = String(valor);
        const coincidencia = texto.match(
            /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/
        );

        return coincidencia
            ? `${coincidencia[1]}T${coincidencia[2]}`
            : "";
    }

    function fechaParaMySQL(valor) {
        if (!valor) return "";

        return valor.replace("T", " ") + ":00";
    }

    function mostrarFecha(valor) {
        const fecha = fechaParaInput(valor);

        if (!fecha) return "Sin fecha";

        const [dia, hora] = fecha.split("T");
        const [anio, mes, numeroDia] = dia.split("-");

        return `${numeroDia}/${mes}/${anio} ${hora}`;
    }

    // ==========================================
    // TABLA DE CITAS
    // ==========================================

    function crearCelda(fila, texto) {
        const td = document.createElement("td");
        td.textContent = texto ?? "—";
        fila.appendChild(td);
        return td;
    }

    function filtrarCitas() {
        const texto = el.buscar.value.trim().toLowerCase();
        const estado = el.filtroEstado.value;
        const fecha = el.filtroFecha.value;

        return citas.filter((cita) => {
            const contenido = [
                cita.mascota,
                cita.propietario,
                cita.servicio,
                cita.veterinario,
                cita.motivo
            ]
                .map(v => String(v ?? ""))
                .join(" ")
                .toLowerCase();

            const coincideTexto = contenido.includes(texto);
            const coincideEstado = !estado || cita.estado === estado;
            const coincideFecha =
                !fecha || fechaParaInput(cita.fecha).startsWith(fecha);

            return coincideTexto &&
                coincideEstado &&
                coincideFecha;
        });
    }

    function actualizarResumen() {
        const contar = (estado) =>
            citas.filter(c => c.estado === estado).length;

        el.todas.textContent = citas.length;
        el.pendientes.textContent = contar("Pendiente");
        el.confirmadas.textContent = contar("Confirmada");
        el.atendidas.textContent = contar("Atendida");

        if (el.total) {
            el.total.textContent = citas.length;
        }
    }

    
function mostrarCitas() {
    const filtradas = filtrarCitas();

    el.tabla.replaceChildren();

    el.cantidad.textContent =
        `Mostrando ${filtradas.length} de ${citas.length} citas`;

    actualizarResumen();

    // MENSAJE CUANDO NO HAY CITAS
    if (filtradas.length === 0) {
        const fila = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 6;
        td.className = "citas-loading";
        td.textContent = citas.length
            ? "🔍 No hay citas que coincidan con los filtros."
            : "🐾 Todavía no hay citas registradas.";

        fila.appendChild(td);
        el.tabla.appendChild(fila);
        return;
    }

    // FUNCIÓN PARA CREAR ELEMENTOS SEGUROS
    function elemento(tipo, clase, texto) {
        const nodo = document.createElement(tipo);
        if (clase) nodo.className = clase;
        if (texto !== undefined) {
            nodo.textContent = String(texto);
        }
        return nodo;
    }

    // IDENTIFICAR MASCOTA POR ESPECIE
    function obtenerIcono(cita) {
        const especie = String(
            cita.especie || ""
        ).toLowerCase();

        if (especie.includes("perro") ||
            especie.includes("canino")) return "🐶";

        if (especie.includes("gato") ||
            especie.includes("felino")) return "🐱";

        if (especie.includes("conejo")) return "🐰";
        if (especie.includes("ave")) return "🐦";
        if (especie.includes("hámster") ||
            especie.includes("hamster")) return "🐹";

        return "🐾";
    }

    // MOSTRAR CADA CITA
    filtradas.forEach((cita) => {
        const fila = document.createElement("tr");

        // 1. FECHA Y HORA
        const tdFecha = document.createElement("td");
        const fechaBox = elemento("div", "cita-fecha-box");

        const fechaVisual = elemento("div", "cita-dia");
        const fechaOriginal = cita.fecha;

        let dia = "—";
        let mes = "";

        if (fechaOriginal) {
            const texto = String(fechaOriginal);
            const partes = texto.match(
                /^(\d{4})-(\d{2})-(\d{2})/
            );

            if (partes) {
                dia = partes[3];
                const meses = [
                    "ENE", "FEB", "MAR", "ABR",
                    "MAY", "JUN", "JUL", "AGO",
                    "SEP", "OCT", "NOV", "DIC"
                ];
                mes = meses[Number(partes[2]) - 1] || "";
            }
        }

        fechaVisual.append(
            elemento("strong", "", dia),
            elemento("small", "", mes)
        );

        const fechaTexto = elemento(
            "span",
            "cita-hora",
            mostrarFecha(cita.fecha)
        );

        fechaBox.append(fechaVisual, fechaTexto);
        tdFecha.appendChild(fechaBox);
        fila.appendChild(tdFecha);

        // 2. MASCOTA Y PROPIETARIO
        const tdMascota = document.createElement("td");
        const paciente = elemento("div", "cita-paciente");

        const avatar = elemento(
            "div",
            "cita-avatar",
            obtenerIcono(cita)
        );

        const info = elemento(
            "div",
            "cita-paciente-info"
        );

        info.append(
            elemento(
                "strong",
                "",
                cita.mascota || "Sin nombre"
            ),
            elemento(
                "small",
                "",
                cita.propietario || "Sin propietario"
            )
        );

        paciente.append(avatar, info);
        tdMascota.appendChild(paciente);
        fila.appendChild(tdMascota);

        // 3. SERVICIO
        const tdServicio = document.createElement("td");
        const servicioInfo = elemento(
            "div",
            "cita-servicio-info"
        );

        servicioInfo.append(
            elemento(
                "strong",
                "",
                cita.servicio || "Sin servicio"
            )
        );

        tdServicio.appendChild(servicioInfo);
        fila.appendChild(tdServicio);

        // 4. VETERINARIO
        const tdVeterinario = document.createElement("td");

        const veterinarioInfo = elemento(
            "div",
            "cita-servicio-info"
        );

        veterinarioInfo.append(
            elemento(
                "strong",
                "",
                cita.veterinario || "Sin asignar"
            )
        );

        tdVeterinario.appendChild(veterinarioInfo);
        fila.appendChild(tdVeterinario);

        // 5. ESTADO
        const tdEstado = document.createElement("td");

        const estado = String(
            cita.estado || ""
        ).trim().toLowerCase();

        const configuracion = {
            pendiente: {
                icono: "◷",
                texto: "Pendiente"
            },
            confirmada: {
                icono: "▣",
                texto: "Confirmada"
            },
            atendida: {
                icono: "✓",
                texto: "Atendida"
            },
            cancelada: {
                icono: "✕",
                texto: "Cancelada"
            }
        };

        const estadoInfo = configuracion[estado];

        const etiqueta = elemento(
            "span",
            "cita-estado"
        );

        if (estadoInfo) {
            etiqueta.classList.add(
                `cita-estado-${estado}`
            );

            etiqueta.textContent =
                `${estadoInfo.icono} ${estadoInfo.texto}`;
        } else {
            etiqueta.textContent = cita.estado || "—";
        }

        tdEstado.appendChild(etiqueta);
        fila.appendChild(tdEstado);

        // 6. ACCIONES
        const tdAcciones = document.createElement("td");

        const acciones = elemento(
            "div",
            "cita-acciones"
        );

        const editar = elemento(
            "button",
            "btn-edit cita-btn-editar",
            "✏️"
        );

        editar.type = "button";
        editar.title = "Editar cita";
        editar.setAttribute("aria-label", "Editar cita");

        editar.addEventListener("click", () => {
            abrirModal(cita);
        });

        const eliminar = elemento(
            "button",
            "btn-delete cita-btn-eliminar",
            "🗑"
        );

        eliminar.type = "button";
        eliminar.title = "Eliminar cita";
        eliminar.setAttribute("aria-label", "Eliminar cita");

        eliminar.addEventListener("click", () => {
            eliminarCita(cita);
        });

        acciones.append(editar, eliminar);
        tdAcciones.appendChild(acciones);
        fila.appendChild(tdAcciones);

        // AGREGAR FILA
        el.tabla.appendChild(fila);
    });
}

    // ==========================================
    // CARGAR CITAS
    // ==========================================

    async function cargarCitas() {
        try {
            const respuesta = await api("/citas");

            citas = extraerLista(respuesta, "citas");

            mostrarCitas();
            mostrarMensaje("");

        } catch (error) {
            console.error("Error al cargar citas:", error);
            mostrarMensaje(error.message, true);
        }
    }

    // ==========================================
    // CARGAR OPCIONES DE FORMULARIO
    // ==========================================

    function llenarSelect(
        select,
        registros,
        campoId,
        crearNombre,
        textoInicial
    ) {
        select.replaceChildren();

        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = textoInicial;
        select.appendChild(opcionInicial);

        registros.forEach((registro) => {
            const opcion = document.createElement("option");

            opcion.value = registro[campoId];
            opcion.textContent = crearNombre(registro);

            select.appendChild(opcion);
        });
    }

    async function cargarOpciones(cita = null) {
        const [resMascotas, resServicios] = await Promise.all([
            api("/mascotas"),
            api("/servicios")
        ]);

        const mascotas = extraerLista(resMascotas, "mascotas");
        const servicios = extraerLista(resServicios, "servicios");

        // El controlador permite asignar solo servicios activos.
        // En edición conservamos la opción actual para mostrarla,
        // aunque el backend exigirá que siga activa al guardar.
        const serviciosDisponibles = servicios.filter(s =>
            s.estado === "Activo" ||
            (cita && Number(s.id_servicio) === Number(cita.id_servicio))
        );

        llenarSelect(
            el.mascota,
            mascotas,
            "id_mascota",
            m => `${m.nombre} — ${m.propietario || "Sin propietario"}`,
            "Seleccionar mascota"
        );

        llenarSelect(
            el.servicio,
            serviciosDisponibles,
            "id_servicio",
            s => s.nombre,
            "Seleccionar servicio"
        );

        // El veterinario es opcional. Si no existe esta ruta,
        // el formulario seguirá funcionando sin asignación.
        let empleados = [];
        let avisoEmpleados = "";

        try {
            const respuesta = await api("/empleados");
            empleados = extraerLista(respuesta, "empleados");
        } catch (error) {
            avisoEmpleados =
                "No se pudo cargar la lista de empleados. " +
                "Puedes registrar la cita sin veterinario.";
            console.warn(error.message);
        }

        const empleadosDisponibles = empleados.filter(e =>
            e.estado === "Activo" ||
            (cita && Number(e.id_empleado) === Number(cita.id_empleado))
        );

        llenarSelect(
            el.veterinario,
            empleadosDisponibles,
            "id_empleado",
            e => `${e.nombres} ${e.apellidos}`,
            "Sin asignar"
        );

        if (mascotas.length === 0) {
            throw new Error(
                "Primero debes registrar una mascota."
            );
        }

        if (serviciosDisponibles.length === 0) {
            throw new Error(
                "No hay servicios disponibles para programar citas."
            );
        }

        return avisoEmpleados;
    }

    // ==========================================
    // ABRIR / CERRAR MODAL
    // ==========================================

    async function abrirModal(cita = null) {
        if (cargandoFormulario) return;

        el.form.reset();
        el.mensajeForm.textContent = "";

        el.id.value = cita?.id_cita || "";
        el.fecha.value = fechaParaInput(cita?.fecha);
        el.estado.value = cita?.estado || "Pendiente";
        el.motivo.value = cita?.motivo || "";

        el.titulo.textContent = cita
            ? "Editar cita veterinaria"
            : "Programar nueva cita";

        el.guardar.textContent = cita
            ? "Guardar cambios"
            : "Registrar cita";

        el.modal.hidden = false;
        document.body.style.overflow = "hidden";

        cargandoFormulario = true;
        el.guardar.disabled = true;
        el.mensajeForm.textContent = "Cargando información...";

        try {
            const aviso = await cargarOpciones(cita);

            // Evitar modificar un modal que ya se cerró.
            if (el.modal.hidden) return;

            el.mascota.value = cita?.id_mascota || "";
            el.servicio.value = cita?.id_servicio || "";
            el.veterinario.value = cita?.id_empleado || "";

            el.mensajeForm.textContent = aviso;
            el.mensajeForm.style.color = "#987026";

            el.guardar.disabled = false;
            el.mascota.focus();

        } catch (error) {
            if (!el.modal.hidden) {
                mostrarErrorFormulario(error.message);
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

    // ==========================================
    // GUARDAR CITA
    // ==========================================

    function obtenerDatosFormulario() {
        return {
            id_mascota: Number(el.mascota.value),
            id_servicio: Number(el.servicio.value),

            id_empleado: el.veterinario.value
                ? Number(el.veterinario.value)
                : null,

            fecha: fechaParaMySQL(el.fecha.value),
            motivo: el.motivo.value.trim() || null,
            estado: el.estado.value
        };
    }

    async function guardarCita(evento) {
        evento.preventDefault();

        if (
            guardando ||
            cargandoFormulario ||
            !el.form.reportValidity()
        ) return;

        const id = el.id.value;
        const datos = obtenerDatosFormulario();

        if (!datos.fecha || !datos.id_mascota || !datos.id_servicio) {
            mostrarErrorFormulario(
                "Completa la mascota, el servicio y la fecha."
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
                    ? `/citas/${encodeURIComponent(id)}`
                    : "/citas",
                {
                    method: id ? "PUT" : "POST",
                    body: JSON.stringify(datos)
                }
            );

            cerrarModalForzado();

            await cargarCitas();

            mostrarMensaje(
                respuesta.mensaje || "Cita guardada correctamente."
            );

        } catch (error) {
            mostrarErrorFormulario(error.message);

        } finally {
            guardando = false;
            el.guardar.disabled = false;
            el.guardar.textContent = id
                ? "Guardar cambios"
                : "Registrar cita";
        }
    }

    function cerrarModalForzado() {
        el.modal.hidden = true;
        document.body.style.overflow = "";
    }

    // ==========================================
    // ELIMINAR CITA
    // ==========================================

    async function eliminarCita(cita) {
        const confirmar = window.confirm(
            `¿Eliminar la cita de ${cita.mascota}?\n\n` +
            "Esta acción no se puede deshacer."
        );

        if (!confirmar) return;

        try {
            const respuesta = await api(
                `/citas/${encodeURIComponent(cita.id_cita)}`,
                { method: "DELETE" }
            );

            await cargarCitas();

            mostrarMensaje(
                respuesta.mensaje || "Cita eliminada."
            );

        } catch (error) {
            mostrarMensaje(error.message, true);
        }
    }

    // ==========================================
    // EVENTOS
    // ==========================================

    el.nuevo.addEventListener("click", () => abrirModal());

    el.cerrar.addEventListener("click", cerrarModal);
    el.cancelar.addEventListener("click", cerrarModal);

    el.form.addEventListener("submit", guardarCita);

    el.buscar.addEventListener("input", mostrarCitas);
    el.filtroEstado.addEventListener("change", mostrarCitas);
    el.filtroFecha.addEventListener("change", mostrarCitas);

    el.limpiar.addEventListener("click", () => {
        el.buscar.value = "";
        el.filtroEstado.value = "";
        el.filtroFecha.value = "";
        mostrarCitas();
    });

    el.modal.addEventListener("click", (evento) => {
        if (evento.target === el.modal) cerrarModal();
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !el.modal.hidden) {
            cerrarModal();
        }
    });

    cargarCitas();

})();
