
import { useState } from "react";

function Pagos() {
  const [pagos, setPagos] = useState([
    { id: 1, concepto: "Consulta veterinaria", monto: 50 },
    { id: 2, concepto: "Vacunación", monto: 80 }
  ]);

  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");

  const agregar = (e) => {
    e.preventDefault();

    const valor = Number(monto);

    if (!concepto.trim() || !Number.isFinite(valor) || valor <= 0) {
      return;
    }

    setPagos((anteriores) => [
      ...anteriores,
      {
        id: Date.now(),
        concepto: concepto.trim(),
        monto: valor
      }
    ]);

    setConcepto("");
    setMonto("");
  };

  return (
    <section>
      <div className="encabezado-pagina">
        <h1>Gestión de pagos</h1>
        <p>Demostración del módulo de pagos</p>
      </div>

      <div className="panel">
        <h2>Registrar pago de ejemplo</h2>

        <form onSubmit={agregar} className="formulario">
          <input
            placeholder="Concepto del pago"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            required
          />

          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Monto en soles"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />

          <button className="btn-primario" type="submit">
            Registrar pago
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Historial de ejemplo</h2>

        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Concepto</th>
                <th>Monto</th>
              </tr>
            </thead>

            <tbody>
              {pagos.map((pago) => (
                <tr key={pago.id}>
                  <td>{pago.id}</td>
                  <td>{pago.concepto}</td>
                  <td>S/ {pago.monto.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="aviso-demo">
        Los pagos de ejemplo no se registran en la base de datos.
      </p>
    </section>
  );
}

export default Pagos;
