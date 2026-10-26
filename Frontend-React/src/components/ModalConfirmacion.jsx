
function ModalConfirmacion({ abierto, onCancelar, onAceptar }) {
  if (!abierto) return null;

  return (
    <div className="modal-fondo">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
      >
        <h2 id="modal-titulo">¿Cerrar sesión?</h2>
        <p>¿Estás seguro de que deseas salir de PETCARE+?</p>

        <div className="modal-acciones">
          <button className="btn-secundario" onClick={onCancelar}>
            Cancelar
          </button>

          <button className="btn-primario" onClick={onAceptar}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacion;
