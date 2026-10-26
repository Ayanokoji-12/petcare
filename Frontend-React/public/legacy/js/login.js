
const loginForm = document.getElementById("loginForm");
const mensaje = document.getElementById("mensaje");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;

    mensaje.textContent = "Verificando credenciales...";

    try {
        const respuesta = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                correo,
                password
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje || "No se pudo iniciar sesión"
            );
        }

        if (!datos.token) {
            throw new Error("El servidor no devolvió un token");
        }

        sessionStorage.setItem("petcare_token", datos.token);

        mensaje.textContent = "Inicio de sesión correcto.";

        window.location.href = "admin.html";

    } catch (error) {
        mensaje.textContent = error.message;
    }
});
