
/*
 * PETCARE+ - Gestión de Mascotas
 * Node.js + Express + MySQL
 */

(() => {
    "use strict";

    const $ = (id) => document.getElementById(id);

    const el = {
        tabla: $("tablaMascotas"),
        buscar: $("buscarMascota"),
        cantidad: $("cantidadMascotas"),
        total: $("totalMascotas"),
        mensaje: $("mensajeMascotas"),

        modal: $("modalMascota"),
        form: $("formMascota"),
        titulo: $("tituloModalMascota"),
        mensajeForm: $("mensajeFormularioMascota"),

        nuevo: $("nuevaMascota"),
        cerrar: $("cerrarModalMascota"),
        cancelar: $("cancelarMascota"),
        guardar: $("guardarMascota"),

        id: $("mascotaId"),
        nombre: $("mascotaNombre"),
        cliente: $("mascotaCliente"),
        especie: $("mascotaEspecie"),
        raza: $("mascotaRaza"),
        sexo: $("mascotaSexo"),
        nacimiento: $("mascotaNacimiento"),
        peso: $("mascotaPeso"),
        observaciones: $("mascotaObservaciones")
    };

    let mascotas = [];
    let guardando = false;

    // PETICIONES A LA API
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

    // SOPORTA RESPUESTAS CON DATOS O ARREGLOS
    function extraerLista(respuesta, nombre) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta.datos)) return respuesta.datos;
        if (Array.isArray(respuesta[nombre])) {
            return respuesta[nombre];
        }
        if (Array.isArray(respuesta.data)) return respuesta.data;

        throw new Error(
            `La API de ${nombre} no devolvió una lista válida.`
        );
    }

    function mensaje(texto, error = false) {
        el.mensaje.textContent = texto;
        el.mensaje.style.color = error ? "#b3263e" : "#087f70";
    }

    // EVITA INSERTAR HTML PROCEDENTE DE MYSQL
    function celda(fila, valor) {
        const td = document.createElement("td");
        td.textContent = valor ?? "—";
        fila.appendChild(td);
        return td;
    }

    
function mostrarMascotas() {
    const busqueda = el.buscar.value.trim().toLowerCase();

    const filtradas = mascotas.filter((m) => {
        const contenido = [
            m.nombre,
            m.raza,
            m.especie,
            m.propietario,
            m.sexo
        ]
            .map(v => String(v ?? ""))
            .join(" ")
            .toLowerCase();

        return contenido.includes(busqueda);
    });

    el.tabla.replaceChildren();

    el.cantidad.textContent =
        `${filtradas.length} mascota(s)`;

        if (el.total) {
        el.total.textContent = mascotas.length;
      }

    // SIN MASCOTAS
    if (filtradas.length === 0) {
        const fila = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 6;
        td.className = "mascota-vacio";

        const icono = document.createElement("div");
        icono.className = "mascota-vacio-icono";
        icono.textContent = "🐾";

        const titulo = document.createElement("strong");
        titulo.textContent = busqueda
            ? "No encontramos mascotas"
            : "Todavía no hay mascotas registradas";

        const descripcion = document.createElement("p");
        descripcion.textContent = busqueda
            ? "Prueba buscando otro nombre, raza o propietario."
            : "Registra tu primera mascota para comenzar.";

        td.append(icono, titulo, descripcion);
        fila.appendChild(td);
        el.tabla.appendChild(fila);
        return;
    }

    // IDENTIFICAR ESPECIE
    function obtenerAvatar(especie) {
        const texto = String(especie || "")
            .toLowerCase()
            .trim();

        if (texto.includes("perro") || texto.includes("canino")) {
            return { icono: "🐶", color: "mascota-avatar-perro" };
        }

        if (texto.includes("gato") || texto.includes("felino")) {
            return { icono: "🐱", color: "mascota-avatar-gato" };
        }

        if (texto.includes("conejo")) {
            return { icono: "🐰", color: "mascota-avatar-conejo" };
        }

        if (texto.includes("ave") || texto.includes("pájaro")) {
            return { icono: "🐦", color: "mascota-avatar-ave" };
        }

        if (texto.includes("hamster") || texto.includes("hámster")) {
            return { icono: "🐹", color: "mascota-avatar-otro" };
        }

        return { icono: "🐾", color: "mascota-avatar-otro" };
    }

    // MOSTRAR FILAS
    filtradas.forEach((m) => {
        const fila = document.createElement("tr");
        fila.className = "mascota-fila";

        // MASCOTA: AVATAR + NOMBRE + RAZA
        const tdNombre = document.createElement("td");

        const perfil = document.createElement("div");
        perfil.className = "mascota-perfil";

        const avatarDatos = obtenerAvatar(m.especie);

        const avatar = document.createElement("div");
        avatar.className =
            `mascota-avatar ${avatarDatos.color}`;

        avatar.textContent = avatarDatos.icono;
        avatar.setAttribute("aria-hidden", "true");

        const informacion = document.createElement("div");
        informacion.className = "mascota-info";

        const nombre = document.createElement("div");
        nombre.className = "mascota-nombre";
        nombre.textContent = m.nombre || "Sin nombre";

        const raza = document.createElement("div");
        raza.className = "mascota-raza";
        raza.textContent = m.raza || "Sin raza especificada";

        informacion.append(nombre, raza);
        perfil.append(avatar, informacion);
        tdNombre.appendChild(perfil);
        fila.appendChild(tdNombre);

        // ESPECIE
        const tdEspecie = document.createElement("td");

        const especie = document.createElement("span");
        especie.className = "mascota-especie";
        especie.textContent = m.especie || "Sin especificar";

        tdEspecie.appendChild(especie);
        fila.appendChild(tdEspecie);

        // PROPIETARIO
        const tdPropietario = document.createElement("td");

        const propietario = document.createElement("div");
        propietario.className = "mascota-propietario";

        const propietarioIcono = document.createElement("span");
        propietarioIcono.textContent = "👤";

        const propietarioNombre = document.createElement("span");
        propietarioNombre.textContent =
            m.propietario || "Sin propietario";

        propietario.append(propietarioIcono, propietarioNombre);
        tdPropietario.appendChild(propietario);
        fila.appendChild(tdPropietario);

        // SEXO
        const tdSexo = document.createElement("td");

        const sexo = document.createElement("span");

        const valorSexo = String(m.sexo || "").toLowerCase();

        if (valorSexo === "macho" || valorSexo === "m") {
            sexo.className = "mascota-sexo mascota-macho";
            sexo.textContent = "♂ Macho";
        } else if (valorSexo === "hembra" || valorSexo === "h") {
            sexo.className = "mascota-sexo mascota-hembra";
            sexo.textContent = "♀ Hembra";
        } else {
            sexo.className = "mascota-sexo";
            sexo.textContent = m.sexo || "—";
        }

        tdSexo.appendChild(sexo);
        fila.appendChild(tdSexo);

        // PESO
        const tdPeso = document.createElement("td");

        const peso = document.createElement("span");
        peso.className = "mascota-peso";

        peso.textContent =
            m.peso != null && m.peso !== ""
                ? `${m.peso} kg`
                : "—";

        tdPeso.appendChild(peso);
        fila.appendChild(tdPeso);

        // ACCIONES
        const tdAcciones = document.createElement("td");

        const acciones = document.createElement("div");
        acciones.className = "mascota-acciones";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.className = "btn-edit mascota-btn-editar";
        editar.textContent = "✏️ Editar";
        editar.title = "Editar mascota";

        editar.addEventListener("click", () => {
            abrirModal(m);
        });

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.className = "btn-delete mascota-btn-eliminar";
        eliminar.textContent = "🗑 Eliminar";
        eliminar.title = "Eliminar mascota";

        eliminar.addEventListener("click", () => {
            eliminarMascota(m);
        });

        acciones.append(editar, eliminar);
        tdAcciones.appendChild(acciones);
        fila.appendChild(tdAcciones);

        el.tabla.appendChild(fila);
     });
    }
      
    // CARGAR MASCOTAS DESDE MYSQL
    async function cargarMascotas() {
        try {
            const respuesta = await api("/mascotas");

            mascotas = extraerLista(respuesta, "mascotas");

            console.log("Mascotas cargadas:", mascotas);

            mostrarMascotas();
            mensaje("");

        } catch (error) {
            console.error("Error al cargar mascotas:", error);
            mensaje(error.message, true);
        }
    }




    // LLENAR SELECT DE PROPIETARIOS Y ESPECIES
    function llenarSelect(select, registros, campoId, campoNombre) {
        select.replaceChildren();

        const inicial = document.createElement("option");
        inicial.value = "";
        inicial.textContent = "Seleccionar...";
        select.appendChild(inicial);

        registros.forEach((registro) => {
            const opcion = document.createElement("option");

            opcion.value = registro[campoId];
            opcion.textContent = campoNombre(registro);

            select.appendChild(opcion);
        });
    }

    async function cargarOpciones() {
        const [respuestaClientes, respuestaEspecies] =
            await Promise.all([
                api("/clientes"),
                api("/especies")
            ]);

        const clientes = extraerLista(
            respuestaClientes,
            "clientes"
        );

        const especies = extraerLista(
            respuestaEspecies,
            "especies"
        );

        llenarSelect(
            el.cliente,
            clientes,
            "id_cliente",
            c => `${c.nombres} ${c.apellidos}`
        );

        llenarSelect(
            el.especie,
            especies,
            "id_especie",
            e => e.nombre
        );

        if (clientes.length === 0) {
            throw new Error(
                "Primero debes registrar un cliente."
            );
        }

        if (especies.length === 0) {
            throw new Error(
                "No hay especies registradas en MySQL."
            );
        }
    }

    function formatearFecha(fecha) {
        if (!fecha) return "";

        // MySQL puede devolver YYYY-MM-DD o una fecha ISO.
        if (typeof fecha === "string") {
            return fecha.slice(0, 10);
        }

        return "";
     }

     async function abrirModal(mascota = null) {
        el.form.reset();
        el.mensajeForm.textContent = "";

        el.id.value = mascota?.id_mascota || "";
        el.nombre.value = mascota?.nombre || "";
        el.raza.value = mascota?.raza || "";
        el.sexo.value = mascota?.sexo || "";
        el.nacimiento.value = formatearFecha(
            mascota?.fecha_nacimiento
        );
        el.peso.value = mascota?.peso ?? "";
        el.observaciones.value = mascota?.observaciones || "";

        el.titulo.textContent = mascota
            ? "Editar mascota"
            : "Registrar mascota";

        el.guardar.textContent = mascota
            ? "Guardar cambios"
            : "Guardar mascota";

        el.modal.hidden = false;
        document.body.style.overflow = "hidden";

        el.guardar.disabled = true;
        el.mensajeForm.textContent = "Cargando propietarios y especies...";

        try {
            await cargarOpciones();

            el.cliente.value = mascota?.id_cliente || "";
            el.especie.value = mascota?.id_especie || "";

            el.mensajeForm.textContent = "";
            el.guardar.disabled = false;
            el.nombre.focus();
        } catch (error) {
            el.mensajeForm.textContent = error.message;
            el.mensajeForm.style.color = "#b3263e";
        }
    }

    function cerrarModal() {
        if (guardando) return;

        el.modal.hidden = true;
        document.body.style.overflow = "";
    }

    function datosFormulario() {
        return {
            id_cliente: Number(el.cliente.value),
            id_especie: Number(el.especie.value),
            nombre: el.nombre.value.trim(),
            raza: el.raza.value.trim() || null,
            sexo: el.sexo.value || null,
            fecha_nacimiento: el.nacimiento.value || null,
            peso: el.peso.value === ""
                ? null
                : Number(el.peso.value),
            observaciones: el.observaciones.value.trim() || null
        };
    }

    async function guardarMascota(evento) {
        evento.preventDefault();

        if (guardando || !el.form.reportValidity()) return;

        const id = el.id.value;
        const datos = datosFormulario();

        guardando = true;
        el.guardar.disabled = true;
        el.guardar.textContent = "Guardando...";
        el.mensajeForm.textContent = "";

        try {
            const respuesta = await api(
                id ? `/mascotas/${encodeURIComponent(id)}` : "/mascotas",
                {
                    method: id ? "PUT" : "POST",
                    body: JSON.stringify(datos)
                }
            );

            el.modal.hidden = true;
            document.body.style.overflow = "";

            await cargarMascotas();
            mensaje(respuesta.mensaje || "Mascota guardada.");

        } catch (error) {
            el.mensajeForm.textContent = error.message;
            el.mensajeForm.style.color = "#b3263e";

        } finally {
            guardando = false;
            el.guardar.disabled = false;
            el.guardar.textContent = id
                ? "Guardar cambios"
                : "Guardar mascota";
        }
    }

    async function eliminarMascota(mascota) {
        const confirmar = confirm(
            `¿Eliminar a ${mascota.nombre}?\n` +
            "Esta acción no se puede deshacer."
        );

        if (!confirmar) return;

        try {
            const respuesta = await api(
                `/mascotas/${encodeURIComponent(mascota.id_mascota)}`,
                { method: "DELETE" }
            );

            await cargarMascotas();
            mensaje(respuesta.mensaje || "Mascota eliminada.");

        } catch (error) {
            mensaje(error.message, true);
        }
    }

    // EVENTOS
    el.nuevo.addEventListener("click", () => abrirModal());

    el.cerrar.addEventListener("click", cerrarModal);
    el.cancelar.addEventListener("click", cerrarModal);

    el.buscar.addEventListener("input", mostrarMascotas);

    el.form.addEventListener("submit", guardarMascota);

    el.modal.addEventListener("click", (evento) => {
        if (evento.target === el.modal) cerrarModal();
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape" && !el.modal.hidden) {
            cerrarModal();
        }
    });

    cargarMascotas();

})();
