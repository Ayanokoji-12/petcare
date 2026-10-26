
function Navbar({ onCerrarSesion }) {
  return (
    <header className="navbar">
      <div>
        <h2>Panel administrativo</h2>
        <p>Gestión veterinaria PETCARE+</p>
      </div>
      <button className="btn-salir" onClick={onCerrarSesion}>
        Cerrar sesión
      </button>
    </header>
  );
}

export default Navbar;
