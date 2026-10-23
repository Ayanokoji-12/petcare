
"use strict";

/* =====================================================
   PETCARE+ | PREMIUM INTERACTIONS
   Archivo: frontend/js/app.js
   ===================================================== */


const API_BASE = window.location.hostname === "localhost"
  || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000/api"
  : "https://petcare-plus.onrender.com/api";


document.addEventListener("DOMContentLoaded", () => {
  configurarMenu();
  configurarNavegacion();
  configurarBusqueda();
  configurarMetodos();
  configurarArchivo();
  configurarFecha();
  configurarFormularios();
  configurarAnimaciones();
  configurarBotones();
  configurarCampos();
  cargarServicios();

  const year = document.getElementById("currentYear");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  console.log("🐾 PetCare+ Premium listo");
});

/* =====================================================
   01. MENÚ RESPONSIVE
   ===================================================== */

function configurarMenu() {
  const boton = document.getElementById("menuToggle");
  const menu = document.getElementById("navLinks");

  if (!boton || !menu) return;

  function cerrarMenu() {
    menu.classList.remove("open");

    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-label", "Abrir menú");

    const icono = boton.querySelector("i");

    if (icono) {
      icono.className = "fa-solid fa-bars";
    }
  }

  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("open");

    boton.setAttribute("aria-expanded", String(abierto));
    boton.setAttribute(
      "aria-label",
      abierto ? "Cerrar menú" : "Abrir menú"
    );

    const icono = boton.querySelector("i");

    if (icono) {
      icono.className = abierto
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";
    }
  });

  menu.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", cerrarMenu);
  });

  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
      cerrarMenu();
    }
  });

  document.addEventListener("click", evento => {
    if (
      menu.classList.contains("open") &&
      !menu.contains(evento.target) &&
      !boton.contains(evento.target)
    ) {
      cerrarMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      cerrarMenu();
    }
  });
}

/* =====================================================
   02. NAVEGACIÓN Y HEADER DINÁMICO
   ===================================================== */

function configurarNavegacion() {
  const header = document.querySelector(".header");
  const enlaces = document.querySelectorAll(
    '.nav-links a[href^="#"]'
  );

  function actualizarHeader() {
    if (!header) return;

    header.classList.toggle(
      "header-scrolled",
      window.scrollY > 30
    );
  }

  actualizarHeader();

  window.addEventListener(
    "scroll",
    actualizarHeader,
    { passive: true }
  );

  const secciones = [...enlaces]
    .map(enlace => {
      const destino = enlace.getAttribute("href");

      return {
        enlace,
        seccion: document.querySelector(destino)
      };
    })
    .filter(item => item.seccion);

  if (!("IntersectionObserver" in window)) return;

  const observador = new IntersectionObserver(
    entradas => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;

        const actual = secciones.find(
          item => item.seccion === entrada.target
        );

        if (!actual) return;

        enlaces.forEach(enlace => {
          enlace.classList.remove("active");
        });

        actual.enlace.classList.add("active");
      });
    },
    {
      rootMargin: "-25% 0px -60% 0px",
      threshold: 0
    }
  );

  secciones.forEach(item => {
    observador.observe(item.seccion);
  });
}

/* =====================================================
   03. BUSCADOR REAL DE SERVICIOS
   ===================================================== */

function configurarBusqueda() {
  const boton = document.getElementById("searchBtn");
  const seccion = document.getElementById("servicios");

  if (!boton || !seccion) return;

  boton.addEventListener("click", () => {
    const anterior = document.getElementById(
      "petcareSearchPanel"
    );

    if (anterior) {
      anterior.remove();
      return;
    }

    const panel = document.createElement("div");

    panel.id = "petcareSearchPanel";
    panel.className = "petcare-search-panel";

    panel.innerHTML = `
      <div class="petcare-search-content">
        <i class="fa-solid fa-magnifying-glass"></i>

        <input
          id="petcareSearchInput"
          type="search"
          placeholder="Buscar consulta, cirugía, vacunas..."
          aria-label="Buscar servicios veterinarios"
        >

        <button
          type="button"
          id="petcareSearchClose"
          aria-label="Cerrar búsqueda"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <p id="petcareSearchResults">
        Escribe para encontrar un servicio.
      </p>
    `;

    const navbar = document.querySelector(".navbar");

    if (navbar) {
      navbar.insertAdjacentElement("afterend", panel);
    } else {
      document.body.prepend(panel);
    }

    const input = document.getElementById(
      "petcareSearchInput"
    );

    const resultados = document.getElementById(
      "petcareSearchResults"
    );

    const tarjetas = [
      ...document.querySelectorAll(".service-card")
    ];

    input?.focus();

    input?.addEventListener("input", () => {
      const termino = normalizarTexto(input.value);

      let encontrados = 0;

      tarjetas.forEach(tarjeta => {
        const texto = normalizarTexto(
          tarjeta.textContent
        );

        const coincide = texto.includes(termino);

        tarjeta.hidden = !coincide;

        if (coincide) encontrados++;
      });

      if (!termino) {
        resultados.textContent =
          "Escribe para encontrar un servicio.";
      } else {
        resultados.textContent =
          `${encontrados} servicio(s) encontrado(s).`;
      }

      if (termino) {
        seccion.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });

    document.getElementById(
      "petcareSearchClose"
    )?.addEventListener("click", () => {
      panel.remove();

      tarjetas.forEach(tarjeta => {
        tarjeta.hidden = false;
      });
    });
  });
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/* =====================================================
   04. MÉTODOS DE REMISIÓN
   ===================================================== */

function configurarMetodos() {
  const opciones = [
    ...document.querySelectorAll(".method")
  ];

  if (!opciones.length) return;

  function actualizarSeleccion() {
    opciones.forEach(opcion => {
      const radio = opcion.querySelector(
        'input[type="radio"]'
      );

      opcion.classList.toggle(
        "active",
        Boolean(radio?.checked)
      );
    });
  }

  opciones.forEach(opcion => {
    const radio = opcion.querySelector(
      'input[type="radio"]'
    );

    if (!radio) return;

    radio.addEventListener(
      "change",
      actualizarSeleccion
    );
  });

  actualizarSeleccion();
}

/* =====================================================
   05. ARCHIVOS ADJUNTOS
   ===================================================== */

function configurarArchivo() {
  const input = document.getElementById(
    "archivoRemision"
  );

  const nombre = document.getElementById(
    "fileName"
  );

  const zona = document.querySelector(
    ".upload-area"
  );

  if (!input || !nombre) return;

  const maximo = 10 * 1024 * 1024;

  const tipos = [
    "application/pdf",
    "image/jpeg",
    "image/png"
  ];

  function validarArchivo(archivo) {
    if (!archivo) {
      nombre.textContent =
        "Ningún archivo seleccionado";

      zona?.classList.remove("file-selected");

      return false;
    }

    const extension = archivo.name
      .split(".")
      .pop()
      .toLowerCase();

    const extensiones = [
      "pdf",
      "jpg",
      "jpeg",
      "png"
    ];

    if (
      !tipos.includes(archivo.type) ||
      !extensiones.includes(extension)
    ) {
      mostrarMensaje(
        "remisionMensaje",
        "Solo se permiten archivos PDF, JPG o PNG.",
        "error"
      );

      input.value = "";

      nombre.textContent =
        "Ningún archivo seleccionado";

      zona?.classList.remove("file-selected");

      return false;
    }

    if (archivo.size > maximo) {
      mostrarMensaje(
        "remisionMensaje",
        "El archivo no puede superar los 10 MB.",
        "error"
      );

      input.value = "";

      nombre.textContent =
        "Ningún archivo seleccionado";

      zona?.classList.remove("file-selected");

      return false;
    }

    nombre.textContent =
      `✓ ${archivo.name} (${formatearTamano(archivo.size)})`;

    zona?.classList.add("file-selected");

    mostrarMensaje(
      "remisionMensaje",
      "",
      ""
    );

    return true;
  }

  input.addEventListener("change", () => {
    validarArchivo(input.files[0]);
  });

  if (!zona) return;

  ["dragenter", "dragover"].forEach(tipo => {
    zona.addEventListener(tipo, evento => {
      evento.preventDefault();

      zona.classList.add("drag-active");
    });
  });

  ["dragleave", "drop"].forEach(tipo => {
    zona.addEventListener(tipo, evento => {
      evento.preventDefault();

      zona.classList.remove("drag-active");
    });
  });

  zona.addEventListener("drop", evento => {
    const archivo = evento.dataTransfer?.files?.[0];

    if (!archivo) return;

    if (!validarArchivo(archivo)) return;

    try {
      const transferencia = new DataTransfer();

      transferencia.items.add(archivo);

      input.files = transferencia.files;
    } catch (error) {
      console.warn(
        "No se pudo asignar el archivo arrastrado.",
        error
      );

      input.value = "";

      nombre.textContent =
        "Selecciona el archivo manualmente.";

      zona.classList.remove("file-selected");
    }
  });
}

function formatearTamano(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* =====================================================
   06. FECHA DE CITA
   ===================================================== */

function configurarFecha() {
  const fecha = document.getElementById(
    "citaFecha"
  );

  if (!fecha) return;

  const hoy = new Date();

  const local = new Date(
    hoy.getTime() -
    hoy.getTimezoneOffset() * 60000
  );

  fecha.min = local.toISOString().split("T")[0];

  fecha.addEventListener("change", () => {
    const hora = document.getElementById(
      "citaHora"
    );

    if (!hora) return;

    if (fecha.value === fecha.min) {
      const ahora = new Date();

      const horas = String(
        ahora.getHours()
      ).padStart(2, "0");

      const minutos = String(
        ahora.getMinutes()
      ).padStart(2, "0");

      hora.min = `${horas}:${minutos}`;
    } else {
      hora.removeAttribute("min");
    }
  });
}

/* =====================================================
   07. MENSAJES VISUALES
   ===================================================== */

function mostrarMensaje(id, mensaje, tipo = "") {
  const elemento = document.getElementById(id);

  if (!elemento) return;

  elemento.textContent = mensaje;

  elemento.className =
    `form-message ${tipo}`.trim();

  elemento.setAttribute("role", "status");

  if (mensaje) {
    elemento.classList.add("message-visible");
  } else {
    elemento.classList.remove("message-visible");
  }
}

/* =====================================================
   08. CARGAR SERVICIOS DE MYSQL
   ===================================================== */

async function cargarServicios() {
  const selects = [
    document.getElementById("servicioRemision"),
    document.getElementById("citaServicio")
  ].filter(Boolean);

  if (!selects.length) return;

  selects.forEach(select => {
    select.disabled = true;

    select.innerHTML =
      '<option value="">Cargando servicios...</option>';
  });

  try {
    const respuesta = await fetch(
      `${API_BASE}/servicios`,
      {
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        `HTTP ${respuesta.status}`
      );
    }

    const resultado = await respuesta.json();

    /*
      Compatible con:
      []
      { datos: [] }
      { servicios: [] }
      { data: [] }
    */

    const servicios = Array.isArray(resultado)
      ? resultado
      : resultado.datos ??
        resultado.servicios ??
        resultado.data ??
        [];

    if (!Array.isArray(servicios)) {
      throw new Error(
        "Formato de servicios no reconocido."
      );
    }

    selects.forEach(select => {
      select.innerHTML = "";

      const inicial = document.createElement(
        "option"
      );

      inicial.value = "";

      inicial.textContent =
        "Selecciona un servicio";

      select.appendChild(inicial);

      servicios.forEach(servicio => {
        const id =
          servicio.id_servicio ??
          servicio.id;

        const nombre =
          servicio.nombre ??
          servicio.nombre_servicio;

        if (id == null || !nombre) return;

        const opcion = document.createElement(
          "option"
        );

        opcion.value = String(id);
        opcion.textContent = nombre;

        select.appendChild(opcion);
      });

      select.disabled = false;
    });

    console.log(
      `Servicios cargados: ${servicios.length}`
    );

  } catch (error) {
    console.error(
      "Error al cargar servicios:",
      error
    );

    selects.forEach(select => {
      select.innerHTML =
        '<option value="">No se pudieron cargar los servicios</option>';

      select.disabled = true;
    });
  }
}

/* =====================================================
   09. FORMULARIOS
   ===================================================== */

function configurarFormularios() {
  const remision = document.getElementById(
    "remisionForm"
  );

  const cita = document.getElementById(
    "citaForm"
  );

  remision?.addEventListener(
    "submit",
    manejarRemision
  );

  cita?.addEventListener(
    "submit",
    manejarCita
  );
}

/* =====================================================
   10. VALIDACIÓN DE REMISIÓN
   ===================================================== */

function manejarRemision(evento) {
  evento.preventDefault();

  const formulario = evento.currentTarget;

  if (!formulario.reportValidity()) {
    return;
  }

  const datos = {
    centro_origen: valor("centroOrigen"),
    id_servicio: Number(
      valor("servicioRemision")
    ),
    nombre_mascota: valor("nombreMascota"),
    veterinario_origen: valor(
      "veterinarioOrigen"
    ),
    telefono_contacto: valor(
      "telefonoRemision"
    ),
    especie: valor("especieRemision"),
    correo_profesional: valor(
      "correoRemision"
    ),
    propietario: valor(
      "propietarioMascota"
    ),
    metodo: document.querySelector(
      'input[name="metodo"]:checked'
    )?.value || "",
    motivo: valor("motivoRemision")
  };

  if (!datos.id_servicio) {
    mostrarMensaje(
      "remisionMensaje",
      "Selecciona un servicio válido.",
      "error"
    );

    return;
  }

  if (!datos.metodo) {
    mostrarMensaje(
      "remisionMensaje",
      "Selecciona un método de remisión.",
      "error"
    );

    return;
  }

  const archivo = document.getElementById(
    "archivoRemision"
  )?.files?.[0];

  console.log(
    "Remisión validada:",
    datos
  );

  if (archivo) {
    console.log(
      "Archivo seleccionado:",
      archivo.name
    );
  }

  mostrarMensaje(
    "remisionMensaje",
    "✓ Datos validados correctamente. El registro público de remisiones todavía no está conectado al backend. La información no se ha guardado.",
    "success"
  );

  /*
    IMPORTANTE:
    Aquí conectaremos el endpoint público
    de remisiones cuando revisemos
    las rutas y controladores del backend.

    No enviamos datos a una API sin conocer
    el formato que necesita.
  */
}

/* =====================================================
   11. VALIDACIÓN DE CITAS
   ===================================================== */


async function manejarCita(evento) {
  evento.preventDefault();

  const formulario = evento.currentTarget;

  if (!formulario.reportValidity()) return;

  const datos = {
    propietario: valor("citaPropietario"),
    telefono: valor("citaTelefono"),
    mascota: valor("citaMascota"),
    especie: valor("citaEspecie"),
    id_servicio: Number(valor("citaServicio")),
    fecha: valor("citaFecha"),
    hora: valor("citaHora"),
    motivo: valor("citaMotivo")
  };

  if (!datos.id_servicio) {
    mostrarMensaje(
      "citaMensaje",
      "Selecciona un servicio válido.",
      "error"
    );
    return;
  }

  const fechaHora = new Date(
    `${datos.fecha}T${datos.hora}:00`
  );

  if (
    Number.isNaN(fechaHora.getTime()) ||
    fechaHora <= new Date()
  ) {
    mostrarMensaje(
      "citaMensaje",
      "Selecciona una fecha y hora futuras.",
      "error"
    );
    return;
  }

  const boton = formulario.querySelector(
    'button[type="submit"]'
  );

  if (boton?.disabled) return;

  if (boton) {
    boton.disabled = true;
    boton.textContent = "Enviando solicitud...";
  }

  mostrarMensaje(
    "citaMensaje",
    "Registrando tu solicitud...",
    "info"
  );

  try {
    const respuesta = await fetch(
      `${API_BASE}/citas/publica`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(datos)
      }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje ||
        "No se pudo registrar la cita."
      );
    }

    mostrarMensaje(
      "citaMensaje",
      `✓ Solicitud registrada correctamente. ` +
      `Número de cita: ${resultado.id_cita}. ` +
      `Estado: Pendiente. ` +
      `La clínica deberá confirmar tu cita.`,
      "success"
    );

    formulario.reset();

  } catch (error) {
    console.error(
      "Error al solicitar cita:",
      error
    );

    mostrarMensaje(
      "citaMensaje",
      error.message ||
      "Ocurrió un error al registrar la cita.",
      "error"
    );

  } finally {
    if (boton) {
      boton.disabled = false;
      boton.textContent = "Enviar solicitud de cita";
    }
  }
}

  /*
    La API administrativa de citas utiliza
    identificadores de mascotas y servicios.

    El formulario público solicita nombres
    y datos de contacto.

    Para registrar correctamente una cita
    necesitaremos conectar primero
    propietario + mascota + cita.
  */


/* =====================================================
   12. OBTENER VALORES
   ===================================================== */

function valor(id) {
  const elemento = document.getElementById(id);

  return elemento?.value?.trim() || "";
}

/* =====================================================
   13. ANIMACIONES AL HACER SCROLL
   ===================================================== */

function configurarAnimaciones() {
  const elementos = document.querySelectorAll(
    [
      ".service-card",
      ".remission-card",
      ".booking-form",
      ".booking-info",
      ".about-symbol",
      ".about-layout h2",
      ".specialists-content",
      ".stat"
    ].join(",")
  );

  const reducirMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    reducirMovimiento ||
    !("IntersectionObserver" in window)
  ) {
    return;
  }

  elementos.forEach(elemento => {
    elemento.classList.add("reveal-item");
  });

  const observador = new IntersectionObserver(
    entradas => {
      entradas.forEach(entrada => {
        if (!entrada.isIntersecting) return;

        entrada.target.classList.add(
          "reveal-visible"
        );

        observador.unobserve(
          entrada.target
        );
      });
    },
    {
      threshold: .08,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  elementos.forEach(elemento => {
    observador.observe(elemento);
  });
}

/* =====================================================
   14. EFECTO DE LUZ EN BOTONES
   ===================================================== */

function configurarBotones() {
  const botones = document.querySelectorAll(
    ".btn, .search-btn, .service-card"
  );

  const reducirMovimiento = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (reducirMovimiento) return;

  botones.forEach(boton => {
    boton.addEventListener(
      "pointermove",
      evento => {
        if (evento.pointerType === "touch") {
          return;
        }

        const rectangulo =
          boton.getBoundingClientRect();

        const x =
          evento.clientX - rectangulo.left;

        const y =
          evento.clientY - rectangulo.top;

        boton.style.setProperty(
          "--mouse-x",
          `${x}px`
        );

        boton.style.setProperty(
          "--mouse-y",
          `${y}px`
        );
      }
    );
  });
}

/* =====================================================
   15. CAMPOS INTERACTIVOS
   ===================================================== */

function configurarCampos() {
  const campos = document.querySelectorAll(
    ".form-group input, .form-group select, .form-group textarea"
  );

  campos.forEach(campo => {
    if (
      campo.type === "radio" ||
      campo.type === "file"
    ) {
      return;
    }

    const grupo = campo.closest(
      ".form-group"
    );

    campo.addEventListener("focus", () => {
      grupo?.classList.add(
        "field-focused"
      );
    });

    campo.addEventListener("blur", () => {
      grupo?.classList.remove(
        "field-focused"
      );
    });

    campo.addEventListener("input", () => {
      grupo?.classList.toggle(
        "field-filled",
        Boolean(campo.value.trim())
      );
    });
  });
}

/* =====================================================
   16. ESTILOS PARA EFECTOS DINÁMICOS
   ===================================================== */

const estilosDinamicos = document.createElement(
  "style"
);

estilosDinamicos.textContent = `
  .petcare-search-panel {
    position: absolute;
    top: 100%;
    left: 50%;
    z-index: 110;
    width: min(650px, 92%);
    padding: 16px;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 0 0 22px 22px;
    background: rgba(5,29,31,.98);
    box-shadow: 0 22px 50px rgba(0,0,0,.25);
    transform: translateX(-50%);
    animation: searchAppear .3s ease both;
  }

  .petcare-search-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 15px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 14px;
    background: rgba(255,255,255,.08);
    color: #79f3ce;
  }

  .petcare-search-content input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: white;
    font-size: 14px;
  }

  .petcare-search-content input::placeholder {
    color: #a7c8c2;
  }

  .petcare-search-content button {
    border: none;
    background: transparent;
    color: white;
    font-size: 17px;
  }

  #petcareSearchResults {
    padding: 11px 5px 0;
    color: #b5d4cd;
    font-size: 12px;
  }

  .service-card[hidden] {
    display: none !important;
  }

  .reveal-item {
    opacity: 0;
    transform: translateY(35px);
    transition:
      opacity .7s ease,
      transform .7s cubic-bezier(.22,1,.36,1);
  }

  .reveal-visible {
    opacity: 1;
    transform: translateY(0);
  }

  .service-card {
    transition:
      opacity .7s ease,
      transform .45s cubic-bezier(.22,1,.36,1),
      box-shadow .45s ease,
      border-color .35s ease;
  }

  .service-card.reveal-visible:hover {
    transform: translateY(-12px);
  }

  .upload-area.drag-active,
  .upload-area.file-selected {
    border-color: #00bf90;
    background: #effff8;
    box-shadow: 0 0 0 4px rgba(0,220,165,.08);
  }

  .upload-area.file-selected > i {
    color: #00a77b;
  }

  .field-focused label {
    color: #8236d8 !important;
  }

  .form-message.message-visible {
    animation: messageAppear .3s ease both;
  }

  .btn,
  .search-btn,
  .service-card {
    --mouse-x: 50%;
    --mouse-y: 50%;
  }

  @keyframes searchAppear {
    from {
      opacity: 0;
      transform: translate(-50%,-12px);
    }
    to {
      opacity: 1;
      transform: translate(-50%,0);
    }
  }

  @keyframes messageAppear {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal-item {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
  }
`;

document.head.appendChild(estilosDinamicos);
