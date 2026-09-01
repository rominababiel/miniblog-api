const DATABASE_ERRORS = {
  23505: { statusCode: 409, message: 'El registro ya existe' },
  23503: { statusCode: 400, message: 'El recurso referenciado no existe' },
  23502: { statusCode: 400, message: 'Falta un campo obligatorio' },
  22001: { statusCode: 400, message: 'Un valor supera la longitud permitida' },
  '22P02': { statusCode: 400, message: 'Formato de dato invalido' },
};

const errorHandler = (error, req, res, next) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  const databaseError = DATABASE_ERRORS[error.code];

  if (databaseError) {
    return res.status(databaseError.statusCode).json({ error: databaseError.message });
  }

  console.error(error);

  return res.status(500).json({ error: 'Error interno del servidor' });
};

module.exports = errorHandler;
