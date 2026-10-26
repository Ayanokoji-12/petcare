
import { useState } from "react";

function Especies() {
  const [especies, setEspecies] = useState([
    { id: 1, nombre: "Perro" },
    { id: 2, nombre: "Gato" },
    { id: 3, nombre: "Ave" }
  ]);

  const [nombre, setNombre] = useState("");

  const agregar = (e) => {
    e.preventDefault();

    if (!nombre.trim()) return;

    setEspecies((anteriores) => [
      ...anteriores,
      { id: Date.now(), nombre: nombre.trim() }
    ]);

    setNombre("");
  };

  const eliminar = (id) => {
    setEspecies((anteriores) =>
      anteriores.filter((especie) => especie.id !== id)
    );
  };

  return (
    <section>
      <div className="encabezado-pagina">
        <h1>Gestión de especies</h1>
        <p>Registro y administración de especies</p>
      </div>

      <div className="panel">
        <h2>Nueva especie</h2>

        <form onSubmit={agregar} className="formulario">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la especie"
            required
          />

          <button className="btn-primario" type="submit">
            Agregar especie
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Especies registradas</h2>

        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {especies.map((especie) => (
                <tr key={especie.id}>
                  <td>{especie.id}</td>
                  <td>{especie.nombre}</td>
                  <td>
                    <button
                      className="btn-peligro"
                      onClick={() => eliminar(especie.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="aviso-demo">
        Esta pantalla utiliza datos temporales para practicar React.
      </p>
    </section>
  );
}

export default Especies;
