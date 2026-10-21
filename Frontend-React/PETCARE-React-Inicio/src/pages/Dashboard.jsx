
import TarjetaEstadistica from "../components/TarjetaEstadistica";

function Dashboard() {
  return (
    <section>
      <div className="encabezado-pagina">
        <h1>Bienvenido a PETCARE+</h1>
        <p>Resumen general del sistema veterinario</p>
      </div>

      <div className="grid-tarjetas">
        <TarjetaEstadistica
          titulo="Mascotas"
          cantidad="24"
          icono="🐾"
        />
        <TarjetaEstadistica
          titulo="Clientes"
          cantidad="18"
          icono="👥"
        />
        <TarjetaEstadistica
          titulo="Citas"
          cantidad="12"
          icono="📅"
        />
        <TarjetaEstadistica
          titulo="Pagos"
          cantidad="8"
          icono="💳"
        />
      </div>

      <div className="panel">
        <h2>Resumen administrativo</h2>
        <p>
          Desde este panel puedes navegar entre los módulos
          de mascotas, especies y pagos.
        </p>
        <p className="aviso-demo">
          Los valores mostrados son datos de demostración.
        </p>
      </div>
    </section>
  );
}

export default Dashboard;
