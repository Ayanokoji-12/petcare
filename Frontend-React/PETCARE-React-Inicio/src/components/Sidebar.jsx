
import { NavLink } from "react-router-dom";

function Sidebar() {
  const opciones = [
    { ruta: "/", nombre: "Dashboard", icono: "📊" },
    { ruta: "/mascotas", nombre: "Mascotas", icono: "🐾" },
    { ruta: "/especies", nombre: "Especies", icono: "🐶" },
    { ruta: "/pagos", nombre: "Pagos", icono: "💳" }
  ];

  return (
    <aside className="sidebar">
      <h1>🐾 PETCARE+</h1>
      <p className="sidebar-subtitulo">Administración</p>

      <nav>
        {opciones.map((opcion) => (
          <NavLink
            key={opcion.ruta}
            to={opcion.ruta}
            end={opcion.ruta === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "activo" : ""}`
            }
          >
            <span>{opcion.icono}</span>
            {opcion.nombre}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
