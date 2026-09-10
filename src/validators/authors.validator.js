const { body, param } = require('express-validator');

const idParam = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un numero entero positivo'),
];

const authorBody = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres'),
  body('email').trim().notEmpty().withMessage('El email es obligatorio').bail()
    .isEmail().withMessage('El email no tiene un formato valido').bail()
    .isLength({ max: 150 }).withMessage('El email no puede superar los 150 caracteres'),
  body('bio').optional({ values: 'null' }).isString().withMessage('La bio debe ser texto'),
];

module.exports = {
  createAuthorRules: authorBody,
  updateAuthorRules: [...idParam, ...authorBody],
  authorIdRules: idParam,
};
