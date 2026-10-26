export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande' });
  }

  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 500
    ? err.status
    : 500;

  if (status === 500) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  return res.status(status).json({ error: err.message });
}
