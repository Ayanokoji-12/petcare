import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Mascotas from "./pages/Mascotas";
import Especies from "./pages/Especies";
import Pagos from "./pages/Pagos";

function App() {
  const cerrarSesion = () => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas cerrar sesión?"
    );

    if (!confirmar) return;

    window.alert("Cierre de sesión de demostración");
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />

        <div className="contenido-principal">
          <Navbar onCerrarSesion={cerrarSesion} />

          <main className="main">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/mascotas" element={<Mascotas />} />
              <Route path="/especies" element={<Especies />} />
              <Route path="/pagos" element={<Pagos />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;