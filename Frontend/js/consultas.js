
/*
 * PETCARE+ - CONSULTAS VETERINARIAS
 * API Express + MySQL
 */

(() => {
    "use strict";

    const $ = id => document.getElementById(id);

    const el = {
        tabla: $("tablaConsultas"),
        buscar: $("buscarConsulta"),
        fechaFiltro: $("filtrarFechaConsulta"),
        limpiar: $("limpiarFiltrosConsultas"),
        cantidad: $("cantidadConsultas"),
        mensaje: $("mensajeConsultas"),

        total: $("totalConsultasModulo"),
        mascotas: $("mascotasAtendidasModulo"),
        hoy: $("consultasHoyModulo"),

        modal: $("modalConsulta"),
        form: $("formConsulta"),
        titulo: $("tituloModalConsulta"),
        mensajeForm: $("mensajeFormularioConsulta"),

        nueva: $("nuevaConsulta"),
        cerrar: $("cerrarModalConsulta"),
        cancelar: $("cancelarConsulta"),
        guardar: $("guardarConsulta"),

        id: $("consultaId"),
        cita: $("consultaCita"),
        ayudaCita: $("ayudaConsultaCita"),
        diagnostico: $("consultaDiagnostico"),
        tratamiento: $("consultaTratamiento"),
        observaciones: $("consultaObservaciones")
    };

    let consultas = [];
    let guardando = false;
    let cargandoOpciones = false;
    let solicitudModal = 0;

    // =========================================
    // API
    // =========================================

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
            throw new Error("Tu sesión ha vencido.");
        }

        if (respuesta.status === 403) {
            throw new Error("No tienes permiso para esta operación.");
        }

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje || `Error HTTP ${respuesta.status}`
            );
        }

        return datos;
    }

    function lista(respuesta, nombre) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.datos)) return respuesta.datos;
        if (Array.isArray(respuesta?.[nombre])) {
            return respuesta[nombre];
        }
        if (Array.isArray(respuesta?.data)) return respuesta.data;

        throw new Error(
            `La API de ${nombre} no devolvió una lista válida.`
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

    // =========================================
    // FECHAS
    // =========================================

    function fechaNormalizada(valor) {
        if (!valor) return "";

        const texto = String(valor);

        // Funciona con MySQL DATETIME y fechas ISO.
        const coincidencia = texto.match(
            /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/
        );

        if (coincidencia) {
            return `${coincidencia[1]}T${coincidencia[2]}`;
        }

        return texto.slice(0, 10);
    }

    function fechaLegible(valor) {
        const texto = fechaNormalizada(valor);

        if (!texto) return "Sin fecha";

        const fecha = texto.slice(0, 10);
        const [anio, mes, dia] = fecha.split("-");

        const hora = texto.includes("T")
            ? " " + texto.split("T")[1]
            : "";

        return `${dia}/${mes}/${anio}${hora}`;
    }

    function fechaHoyLocal() {
        const ahora = new Date();

        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, "0");
        const dia = String(ahora.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }

    // =========================================
    // TABLA
    // =========================================

    function celda(fila, contenido) {
        const td = document.createElement("td");
        td.textContent = contenido ?? "—";
        fila.appendChild(td);
        return td;
    }

    function actualizarEstadisticas() {
        el.total.textContent = consultas.length;

        const mascotasUnicas = new Set(
            consultas.map(c => `${c.mascota}|${c.propietario}`)
        );

        // Cuenta nombres de mascota + propietario distintos.
        // Para precisión absoluta se necesitaría id_mascota en la API.
        el.mascotas.textContent = mascotasUnicas.size;

        const hoy = fechaHoyLocal();

        el.hoy.textContent = consultas.filter(
            c => fechaNormalizada(c.fecha_consulta).startsWith(hoy)
        ).length;
    }

    
// ==========================================
// PETCARE+ | CONSULTAS ULTRA PREMIUM
// ==========================================

function mostrarConsultas() {
    const busqueda = el.buscar.value.trim().toLowerCase();
    const fecha = el.fechaFiltro.value;

    // FILTRAR CONSULTAS
    const filtradas = consultas.filter(c => {
        const texto = [
            c.mascota,
            c.propietario,
            c.especie,
            c.veterinario,
            c.diagnostico,
            c.tratamiento
        ]
            .map(v => String(v ?? ""))
            .join(" ")
            .toLowerCase();

        return texto.includes(busqueda) &&
            (!fecha ||
                fechaNormalizada(c.fecha_consulta).startsWith(fecha));
    });

    el.tabla.replaceChildren();

    // CONTADOR Y ESTADÍSTICAS
    el.cantidad.textContent =
        `Mostrando ${filtradas.length} de ${consultas.length} consultas`;

    actualizarEstadisticas();

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

    // IDENTIFICAR ESPECIE
    function iconoMascota(especie) {
        const nombre = String(especie || "").toLowerCase();

        if (nombre.includes("perro") ||
            nombre.includes("canino")) return "🐶";

        if (nombre.includes("gato") ||
            nombre.includes("felino")) return "🐱";

        if (nombre.includes("conejo")) return "🐰";
        if (nombre.includes("ave")) return "🐦";

        if (nombre.includes("hamster") ||
            nombre.includes("hámster")) return "🐹";

        return "🐾";
    }

    // SIN RESULTADOS
    if (filtradas.length === 0) {
        const fila = document.createElement("tr");

        const td = elemento(
            "td",
            "consultas-loading",
            consultas.length
                ? "🔍 No hay consultas que coincidan con los filtros."
                : "🩺 Todavía no hay consultas registradas."
        );

        td.colSpan = 5;

        fila.appendChild(td);
        el.tabla.appendChild(fila);
        return;
    }

    // GENERAR FILAS
    filtradas.forEach(consulta => {
        const fila = document.createElement("tr");

        // 1. FECHA
        const tdFecha = document.createElement("td");

        tdFecha.appendChild(
            elemento(
                "span",
                "consulta-fecha",
                fechaLegible(consulta.fecha_consulta)
            )
        );

        fila.appendChild(tdFecha);

        // 2. MASCOTA Y PROPIETARIO
        const tdMascota = document.createElement("td");

        const paciente = elemento(
            "div",
            "consulta-paciente"
        );

        const avatar = elemento(
            "div",
            "consulta-avatar",
            iconoMascota(consulta.especie)
        );

        const info = elemento(
            "div",
            "consulta-paciente-info"
        );

        info.append(
            elemento(
                "strong",
                "",
                consulta.mascota || "Sin nombre"
            ),
            elemento(
                "small",
                "",
                `${consulta.especie || "Sin especie"} · ${
                    consulta.propietario || "Sin propietario"
                }`
            )
        );

        paciente.append(avatar, info);
        tdMascota.appendChild(paciente);
        fila.appendChild(tdMascota);

        // 3. VETERINARIO
        const tdVeterinario = document.createElement("td");

        tdVeterinario.appendChild(
            elemento(
                "span",
                "consulta-veterinario",
                consulta.veterinario || "Sin asignar"
            )
        );

        fila.appendChild(tdVeterinario);

        // 4. DIAGNÓSTICO
        const tdDiagnostico = document.createElement("td");

        tdDiagnostico.appendChild(
            elemento(
                "span",
                "consulta-diagnostico",
                consulta.diagnostico || "Sin diagnóstico"
            )
        );

        fila.appendChild(tdDiagnostico);

        // 5. ACCIONES
        const tdAcciones = document.createElement("td");

        const acciones = elemento(
            "div",
            "consulta-acciones"
        );

        // EDITAR
        const editar = elemento(
            "button",
            "consulta-btn-editar",
            "✏️ Editar"
        );

        editar.type = "button";
        editar.title = "Editar consulta";

        editar.addEventListener("click", () => {
            abrirModal(consulta);
        });

        // ELIMINAR
        const eliminar = elemento(
            "button",
            "consulta-btn-eliminar",
            "🗑 Eliminar"
        );

        eliminar.type = "button";
        eliminar.title = "Eliminar consulta";

        eliminar.addEventListener("click", () => {
            eliminarConsulta(consulta);
        });

        acciones.append(editar, eliminar);
        tdAcciones.appendChild(acciones);
        fila.appendChild(tdAcciones);

        // AGREGAR FILA
        el.tabla.appendChild(fila);
    });
}

    async function cargarConsultas() {
        try {
            const respuesta = await api("/consultas");

            consultas = lista(respuesta, "consultas");

            mostrarConsultas();
            mensaje("");

        } catch (error) {
            console.error(error);
            mensaje(error.message, true);
        }
    }

    // =========================================
    // CITAS DISPONIBLES
    // =========================================

    async function cargarCitas(consultaActual = null) {
        const respuesta = await api("/citas");
        const citas = lista(respuesta, "citas");

        const citasConConsulta = new Set(
            consultas
                .filter(c =>
                    Number(c.id_consulta) !==
                    Number(consultaActual?.id_consulta)
                )
                .map(c => Number(c.id_cita))
        );

        const disponibles = citas.filter(c => {
            if (c.estado === "Cancelada") return false;

            if (consultaActual &&
                Number(c.id_cita) === Number(consultaActual.id_cita)) {
                return true;
            }

            return !citasConConsulta.has(Number(c.id_cita));
        });

        el.cita.replaceChildren();

        const inicial = document.createElement("option");
        inicial.value = "";
        inicial.textContent = "Seleccionar cita veterinaria";

        el.cita.appendChild(inicial);

        disponibles.forEach(c => {
            const opcion = document.createElement("option");

            opcion.value = c.id_cita;
            opcion.textContent =
                `#${c.id_cita} · ${c.mascota} · ` +
                `${fechaLegible(c.fecha)} · ${c.estado}`;

            el.cita.appendChild(opcion);
        });

        return disponibles.length;
    }

    // =========================================
    // MODAL
    // =========================================

    async function abrirModal(consulta = null) {
        if (cargandoOpciones) return;

        const solicitud = ++solicitudModal;

        el.form.reset();
        el.mensajeForm.textContent = "";

        el.id.value = consulta?.id_consulta || "";
        el.diagnostico.value = consulta?.diagnostico || "";
        el.tratamiento.value = consulta?.tratamiento || "";
        el.observaciones.value = consulta?.observaciones || "";

        el.titulo.textContent = consulta
            ? "Editar consulta veterinaria"
            : "Registrar consulta veterinaria";

        el.guardar.textContent = consulta
            ? "Guardar cambios"
            : "Registrar consulta";

        el.modal.hidden = false;
        document.body.style.overflow = "hidden";

        el.guardar.disabled = true;
        cargandoOpciones = true;

        el.mensajeForm.textContent = "Cargando citas disponibles...";

        try {
            const cantidad = await cargarCitas(consulta);

            if (solicitud !== solicitudModal || el.modal.hidden) {
                return;
            }

            el.cita.value = consulta?.id_cita || "";

            // Al editar mantenemos la cita original bloqueada.
            // El controlador de actualización permite cambiarla,
            // pero bloquearla evita inconsistencias en los estados.
            el.cita.disabled = Boolean(consulta);

            el.ayudaCita.textContent = consulta
                ? "La cita asociada no se cambia desde este formulario."
                : "Selecciona una cita sin consulta registrada.";

            if (!cantidad) {
                errorFormulario(
                    "No hay citas disponibles. Registra una cita primero."
                );
                return;
            }

            el.mensajeForm.textContent = "";
            el.guardar.disabled = false;

            if (consulta) {
                el.diagnostico.focus();
            } else {
                el.cita.focus();
            }

        } catch (error) {
            if (solicitud === solicitudModal && !el.modal.hidden) {
                errorFormulario(error.message);
            }

        } finally {
            cargandoOpciones = false;
        }
    }

    function cerrarModal() {
        if (guardando) return;

        solicitudModal++;
        el.modal.hidden = true;
        document.body.style.overflow = "";
    }

    // =========================================
    // GUARDAR
    // =========================================

    async function guardarConsulta(evento) {
        evento.preventDefault();

        if (guardando || cargandoOpciones) return;
        if (!el.form.reportValidity()) return;

        const id = el.id.value;

        const datos = {
            id_cita: Number(el.cita.value),
            diagnostico: el.diagnostico.value.trim(),
            tratamiento: el.tratamiento.value.trim() || null,
            observaciones: el.observaciones.value.trim() || null
        };

        if (!datos.id_cita || !datos.diagnostico) {
            errorFormulario(
                "Selecciona una cita y escribe el diagnóstico."
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
                    ? `/consultas/${encodeURIComponent(id)}`
                    : "/consultas",
                {
                    method: id ? "PUT" : "POST",
                    body: JSON.stringify(datos)
                }
            );

            cerrarModalForzado();

            await cargarConsultas();

            // El backend actualiza automáticamente
            // el estado de la cita a "Atendida".
            mensaje(
                respuesta.mensaje ||
                "Consulta guardada correctamente."
            );

            // Si el módulo de Citas está cargado, se
            // actualizará al recargar la página.
        } catch (error) {
            errorFormulario(error.message);

        } finally {
            guardando = false;
            el.guardar.disabled = false;
            el.guardar.textContent = id
                ? "Guardar cambios"
                : "Registrar consulta";
        }
    }

    function cerrarModalForzado() {
        solicitudModal++;
        el.modal.hidden = true;
        document.body.style.overflow = "";
    }

    // =========================================
    // ELIMINAR
    // =========================================

    async function eliminarConsulta(consulta) {
        const confirmar = window.confirm(
            `¿Eliminar la consulta de ${consulta.mascota}?\n\n` +
            "Esta acción no se puede deshacer.\n" +
            "La cita atendida volverá a estado Confirmada."
        );

        if (!confirmar) return;

        try {
            const respuesta = await api(
                `/consultas/${encodeURIComponent(consulta.id_consulta)}`,
                { method: "DELETE" }
            );

            await cargarConsultas();

            mensaje(
                respuesta.mensaje ||
                "Consulta eliminada correctamente."
            );

        } catch (error) {
            mensaje(error.message, true);
        }
    }

    // =========================================
    // EVENTOS
    // =========================================

    el.nueva.addEventListener(
        "click",
        () => abrirModal()
    );

    el.cerrar.addEventListener("click", cerrarModal);
    el.cancelar.addEventListener("click", cerrarModal);

    el.form.addEventListener("submit", guardarConsulta);

    el.buscar.addEventListener("input", mostrarConsultas);
    el.fechaFiltro.addEventListener("change", mostrarConsultas);

    el.limpiar.addEventListener("click", () => {
        el.buscar.value = "";
        el.fechaFiltro.value = "";
        mostrarConsultas();
    });

    el.modal.addEventListener("click", evento => {
        if (evento.target === el.modal) cerrarModal();
    });

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && !el.modal.hidden) {
            cerrarModal();
        }
    });

    cargarConsultas();

})();
