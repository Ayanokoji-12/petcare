
// ==========================================
// PETCARE+ | MENÚ MÓVIL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("menuLateral");
    const abrir = document.getElementById("abrirMenuMovil");
    const cerrar = document.getElementById("cerrarMenuMovil");
    const overlay = document.getElementById("sidebarOverlay");

    if (!sidebar || !abrir || !cerrar || !overlay) return;

    function abrirMenu() {
        sidebar.classList.add("mobile-open");
        overlay.classList.add("visible");

        abrir.setAttribute("aria-expanded", "true");
        cerrar.focus();
    }

    function cerrarMenu() {
        sidebar.classList.remove("mobile-open");
        overlay.classList.remove("visible");

        abrir.setAttribute("aria-expanded", "false");
    }

    abrir.addEventListener("click", abrirMenu);
    cerrar.addEventListener("click", cerrarMenu);
    overlay.addEventListener("click", cerrarMenu);

    // Cerrar al seleccionar un módulo
    sidebar.querySelectorAll(".sidebar-menu a").forEach(enlace => {
        enlace.addEventListener("click", cerrarMenu);
    });

    // Cerrar con Escape
    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            cerrarMenu();
        }
    });

    // Restaurar al cambiar a computadora
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            cerrarMenu();
        }
    });
});
