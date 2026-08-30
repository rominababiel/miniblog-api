const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos invalidos',
      details: errors.array().map((item) => ({ field: item.path, message: item.msg })),
    });
  }

  return next();
};

module.exports = validate;
