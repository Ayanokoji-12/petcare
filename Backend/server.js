
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

// IMPORTAR RUTAS
const clientesRoutes = require("./routes/clientes");
const mascotasRoutes = require("./routes/mascotas");
const especiesRoutes = require("./routes/especies");
const serviciosRoutes = require("./routes/servicios");
const citasRoutes = require("./routes/citas");
const consultasRoutes = require("./routes/consultas");
const remisionesRoutes = require("./routes/remisiones");
const productosRoutes = require("./routes/productos");
const ventasRoutes = require("./routes/ventas");
const authRoutes = require("./routes/auth");
const empleadosRoutes = require("./routes/empleado");
const pagosRoutes = require("./routes/pagos");

const app = express();

// MIDDLEWARES
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://petcare-frontend-react.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// RUTA PRINCIPAL
app.get("/", (req, res) => {
    res.status(200).json({
        proyecto: "PETCARE+",
        mensaje: "API veterinaria funcionando",
        version: "1.0.0"
    });
});

// COMPROBAR MYSQL
app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.status(200).json({
            estado: "OK",
            mysql: "Conectado"
        });

    } catch (error) {
        console.error("Error MySQL:", error.message);

        res.status(500).json({
            estado: "ERROR",
            mysql: "Sin conexión"
        });
    }
});

// RUTAS DE LA API
app.use("/api/clientes", clientesRoutes);
app.use("/api/mascotas", mascotasRoutes);
app.use("/api/especies", especiesRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/consultas", consultasRoutes);
app.use("/api/remisiones", remisionesRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/empleados", empleadosRoutes);
app.use("/api/pagos", pagosRoutes);

// RUTA NO ENCONTRADA
app.use((req, res) => {
    res.status(404).json({
        mensaje: "Ruta no encontrada"
    });
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("==================================");
    console.log(" PETCARE+ BACKEND INICIADO");
    console.log(` Puerto: ${PORT}`);
    console.log("==================================");
});
