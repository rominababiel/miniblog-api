const { body, param } = require('express-validator');

const idParam = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un numero entero positivo'),
];

const authorIdParam = [
  param('authorId').isInt({ min: 1 }).withMessage('El authorId debe ser un numero entero positivo'),
];

const postBody = [
  body('title').trim().notEmpty().withMessage('El titulo es obligatorio')
    .isLength({ max: 200 }).withMessage('El titulo no puede superar los 200 caracteres'),
  body('content').trim().notEmpty().withMessage('El contenido es obligatorio'),
  body('author_id').notEmpty().withMessage('El author_id es obligatorio')
    .isInt({ min: 1 }).withMessage('El author_id debe ser un numero entero positivo'),
  body('published').optional().isBoolean().withMessage('published debe ser true o false'),
];

module.exports = {
  createPostRules: postBody,
  updatePostRules: [...idParam, ...postBody],
  postIdRules: idParam,
  postAuthorIdRules: authorIdParam,
};
