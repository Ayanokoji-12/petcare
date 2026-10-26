
function TarjetaEstadistica({ titulo, cantidad, icono }) {
  return (
    <article className="tarjeta">
      <div className="tarjeta-icono">{icono}</div>
      <p>{titulo}</p>
      <h2>{cantidad}</h2>
    </article>
  );
}

export default TarjetaEstadistica;
