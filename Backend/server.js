
const path = require("path");
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
const empleadosRoutes = require("./routes/empleados");
// INICIAR EXPRESS
const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);

// ========================================
// RUTA PRINCIPAL
// ========================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );
});


// ========================================
// COMPROBAR MYSQL
// ========================================
app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.status(200).json({
            estado: "OK",
            mysql: "Conectado",
            base_datos: "petcare_db"
        });

    } catch (error) {
        console.error("Error MySQL:", error.message);

        res.status(500).json({
            estado: "ERROR",
            mysql: "Sin conexión"
        });
    }
});

// ========================================
// RUTAS DE CLIENTES
// ========================================
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
app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


// ========================================
// RUTA NO ENCONTRADA
// ========================================
app.use((req, res) => {
    res.status(404).json({
        mensaje: "Ruta no encontrada"
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("==================================");
    console.log("    PETCARE+ BACKEND INICIADO");
    console.log(`    http://localhost:${PORT}`);
    console.log("==================================");
});
