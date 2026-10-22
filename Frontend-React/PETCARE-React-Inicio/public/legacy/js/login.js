
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

        const texto = await respuesta.text();

        let datos;

        try {
            datos = JSON.parse(texto);
        } catch {
            throw new Error(
                "El servidor no devolvió JSON válido. Revisa la conexión con el backend."
            );
        }

        if (!respuesta.ok) {
            throw new Error(
                datos.mensaje || `Error del servidor: ${respuesta.status}`
            );
        }

        if (!datos.token) {
            throw new Error("El servidor no devolvió un token");
        }

        sessionStorage.setItem("petcare_token", datos.token);

        mensaje.textContent = "Inicio de sesión correcto.";

        window.location.href = "admin.html";

    } catch (error) {
        console.error("Error en login:", error);
        mensaje.textContent = error.message;
    }
});
