
import { useState } from "react";

function Mascotas() {
  const [mascotas, setMascotas] = useState([
    { id: 1, nombre: "Max", especie: "Perro" },
    { id: 2, nombre: "Luna", especie: "Gato" }
  ]);

  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState("Perro");

  const registrar = (e) => {
    e.preventDefault();

    if (!nombre.trim()) return;

    setMascotas((anteriores) => [
      ...anteriores,
      {
        id: Date.now(),
        nombre: nombre.trim(),
        especie
      }
    ]);

    setNombre("");
  };

  return (
    <section>
      <div className="encabezado-pagina">
        <h1>Gestión de mascotas</h1>
        <p>Demostración de formularios y eventos React</p>
      </div>

      <div className="panel">
        <h2>Registrar mascota</h2>

        <form onSubmit={registrar} className="formulario">
          <input
            placeholder="Nombre de la mascota"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <select
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
          >
            <option>Perro</option>
            <option>Gato</option>
            <option>Ave</option>
            <option>Otro</option>
          </select>

          <button className="btn-primario" type="submit">
            Agregar mascota
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Listado de mascotas</h2>

        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Especie</th>
              </tr>
            </thead>
            <tbody>
              {mascotas.map((mascota) => (
                <tr key={mascota.id}>
                  <td>{mascota.id}</td>
                  <td>{mascota.nombre}</td>
                  <td>{mascota.especie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="aviso-demo">
        Los registros de esta pantalla son temporales y no se guardan en MySQL.
      </p>
    </section>
  );
}

export default Mascotas;
