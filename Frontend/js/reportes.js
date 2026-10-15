
// ============================================
// PETCARE+ | REPORTES Y ESTADÍSTICAS
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "/api";

    const mensaje = document.getElementById("mensajeReportes");
    const botonExportar = document.getElementById("exportarReporte");

    let ventasReporte = [];

    // PETICIONES SEGURAS AL BACKEND
    async function apiReportes(ruta) {
        const token = sessionStorage.getItem("petcare_token");

        if (!token) {
            window.location.replace("login.html");
            throw new Error("Debes iniciar sesión.");
        }

        let respuesta;

        try {
            respuesta = await fetch(API_BASE + ruta, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
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
            throw new Error("No tienes permisos para consultar los reportes.");
        }

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || `Error HTTP ${respuesta.status}`);
        }

        return datos;
    }

    // ACTUALIZAR TARJETAS
    function actualizarTarjeta(id, valor) {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent = valor;
        }
    }

    // FORMATO MONEDA PERUANA
    function soles(valor) {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN"
        }).format(valor);
    }

    // CARGAR VENTAS REALES
    async function cargarReporteVentas() {
        try {
            const respuesta = await apiReportes("/ventas");

            ventasReporte = Array.isArray(respuesta)
                ? respuesta
                : Array.isArray(respuesta.datos)
                    ? respuesta.datos
                    : Array.isArray(respuesta.ventas)
                        ? respuesta.ventas
                        : [];

            const pagadas = ventasReporte.filter(
                venta => venta.estado === "Pagada"
            );

            const ingresos = pagadas.reduce(
                (total, venta) => total + Number(venta.total || 0),
                0
            );

            actualizarTarjeta("reporteIngresos", soles(ingresos));
            actualizarTarjeta("reporteVentas", pagadas.length);

            if (mensaje) {
                mensaje.textContent = "✓ Reporte de ventas actualizado.";
            }

        } catch (error) {
            console.error("Error al cargar reportes:", error);

            if (mensaje) {
                mensaje.textContent = error.message;
            }
        }
    }

    // EXPORTAR REPORTE CSV
    function exportarReporte() {
        const obtenerTexto = id =>
            document.getElementById(id)?.textContent.trim() || "0";

        const filas = [
            ["Indicador", "Valor"],
            ["Ingresos totales", obtenerTexto("reporteIngresos")],
            ["Ventas realizadas", obtenerTexto("reporteVentas")],
            ["Productos registrados", obtenerTexto("reporteProductos")],
            ["Consultas veterinarias", obtenerTexto("reporteConsultas")],
            ["Productos disponibles", obtenerTexto("reporteDisponibles")],
            ["Stock bajo", obtenerTexto("reporteStockBajo")],
            ["Productos agotados", obtenerTexto("reporteAgotados")]
        ];

        const csv = filas.map(fila =>
            fila.map(valor =>
                `"${String(valor).replace(/"/g, '""')}"`
            ).join(";")
        ).join("\r\n");

        const blob = new Blob(
            ["\uFEFF", csv],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const enlace = document.createElement("a");

        enlace.href = url;
        enlace.download =
            `PETCARE_Reporte_${new Date().toISOString().slice(0, 10)}.csv`;

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        if (mensaje) {
            mensaje.textContent = "✓ Reporte exportado correctamente.";
        }
    }

    // INICIAR
    if (document.getElementById("reportes")) {
        cargarReporteVentas();
    }

    if (botonExportar) {
        botonExportar.addEventListener("click", exportarReporte);
    }
});
