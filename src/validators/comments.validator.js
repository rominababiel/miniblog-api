const { body, param } = require('express-validator');

const postIdParam = [
  param('postId').isInt({ min: 1 }).withMessage('El postId debe ser un numero entero positivo'),
];

const commentBody = [
  body('content').trim().notEmpty().withMessage('El contenido es obligatorio'),
  body('post_id').notEmpty().withMessage('El post_id es obligatorio').bail()
    .isInt({ min: 1 }).withMessage('El post_id debe ser un numero entero positivo'),
  body('author_id').optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('El author_id debe ser un numero entero positivo'),
];

module.exports = {
  createCommentRules: commentBody,
  commentPostIdRules: postIdParam,
};
