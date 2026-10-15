
/*
=========================================
 PETCARE+ - PANEL ADMINISTRATIVO
 Dashboard + Autenticación + Estadísticas
=========================================
*/

const token = sessionStorage.getItem("petcare_token");

// =========================================
// 1. VERIFICAR SESIÓN
// =========================================

if (!token) {
    window.location.replace("login.html");
} else {
    iniciarPanel();
}

// =========================================
// 2. CERRAR SESIÓN
// =========================================

const botonCerrarSesion =
    document.getElementById("cerrarSesion");

if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener("click", () => {
        sessionStorage.removeItem("petcare_token");
        window.location.replace("login.html");
    });
}

// =========================================
// 3. CONEXIÓN CON EL BACKEND
// =========================================

async function peticionAPI(ruta) {
    let respuesta;

    try {
        respuesta = await fetch(`/api${ruta}`, {
            headers: {
                Authorization: `Bearer ${token}`
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
        throw new Error(
            "No tienes permisos para acceder a este recurso."
        );
    }

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
        throw new Error(
            datos.mensaje || `Error HTTP ${respuesta.status}`
        );
    }

    return datos;
}

// =========================================
// 4. OBTENER LISTAS DE LA API
// =========================================

function obtenerLista(datos, clave) {
    if (Array.isArray(datos)) {
        return datos;
    }

    if (Array.isArray(datos?.datos)) {
        return datos.datos;
    }

    if (Array.isArray(datos?.[clave])) {
        return datos[clave];
    }

    if (Array.isArray(datos?.data)) {
        return datos.data;
    }

    return null;
}

// =========================================
// 5. MODIFICAR TEXTO DE FORMA SEGURA
// =========================================

function actualizarTexto(id, contenido) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = contenido;
    }
}

// =========================================
// 6. CARGAR ESTADÍSTICAS
// =========================================

async function cargarTotal(ruta, clave, elemento) {
    try {
        const datos = await peticionAPI(ruta);
        const lista = obtenerLista(datos, clave);

        if (!lista) {
            throw new Error(
                `Formato de respuesta incorrecto: ${ruta}`
            );
        }

        actualizarTexto(elemento, lista.length);

    } catch (error) {
        console.error(`Error en ${ruta}:`, error);
        actualizarTexto(elemento, "—");
    }
}

// =========================================
// 7. CARGAR PRODUCTOS DEL DASHBOARD
// =========================================

async function cargarProductos() {
    const estado =
        document.getElementById("estadoProductos");

    const tabla =
        document.getElementById("tablaProductos");

    try {
        const datos = await peticionAPI("/productos");

        const productos = obtenerLista(datos, "productos");

        if (!productos) {
            throw new Error(
                "Formato de productos no reconocido."
            );
        }

        // Actualizar contador del dashboard
        actualizarTexto("totalProductos", productos.length);

        // Si la tabla ya no existe, no provocar errores
        if (tabla) {
            tabla.replaceChildren();

            productos.forEach(producto => {
                const fila = document.createElement("tr");

                const valores = [
                    producto.id_producto,
                    producto.nombre,
                    producto.categoria || "Sin categoría",
                    `S/ ${Number(producto.precio).toFixed(2)}`,
                    producto.stock
                ];

                valores.forEach(valor => {
                    const celda = document.createElement("td");

                    celda.textContent = valor ?? "—";

                    fila.appendChild(celda);
                });

                tabla.appendChild(fila);
            });
        }

        if (estado) {
            estado.textContent = productos.length
                ? `${productos.length} productos registrados`
                : "Todavía no hay productos registrados.";

            estado.classList.remove("error");
        }

    } catch (error) {
        console.error(
            "Error al cargar productos:",
            error
        );

        actualizarTexto("totalProductos", "—");

        if (estado) {
            estado.textContent = error.message;
            estado.classList.add("error");
        }
    }
}

// =========================================
// 8. INICIAR PANEL ADMINISTRATIVO
// =========================================

async function iniciarPanel() {
    try {
        // Comprobar permisos de administrador
        await peticionAPI("/auth/admin");

        // Obtener información del usuario
        const perfil = await peticionAPI("/auth/perfil");

        actualizarTexto(
            "bienvenida",
            `Sesión activa: ${
                perfil.usuario?.correo || "Administrador"
            }`
        );

        // Cargar estadísticas en paralelo
        await Promise.all([
            cargarTotal(
                "/clientes",
                "clientes",
                "totalClientes"
            ),

            cargarTotal(
                "/mascotas",
                "mascotas",
                "totalMascotas"
            ),

            cargarTotal(
                "/citas",
                "citas",
                "totalCitas"
            ),

            cargarProductos()
        ]);

        console.log(
            "PETCARE+ | Dashboard cargado correctamente"
        );

    } catch (error) {
        console.error(
            "Error al iniciar el panel:",
            error
        );

        actualizarTexto(
            "bienvenida",
            "No se pudo verificar la sesión."
        );
    }
}

// PETCARE+ | CERRAR SESIÓN DESDE AMBOS BOTONES

function cerrarSesionPetcare() {
    const confirmar = confirm(
        "¿Deseas cerrar tu sesión en PETCARE+?"
    );

    if (!confirmar) return;

    sessionStorage.removeItem("petcare_token");

    window.location.replace("login.html");
}

// Botón del menú lateral
document.getElementById("cerrarSesion")
    ?.addEventListener("click", cerrarSesionPetcare);

// Botón del panel de bienvenida
document.getElementById("cerrarSesionSuperior")
    ?.addEventListener("click", cerrarSesionPetcare);
