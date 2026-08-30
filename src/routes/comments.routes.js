const { Router } = require('express');
const controller = require('../controllers/comments.controller');
const validate = require('../middlewares/validate');
const { createCommentRules, commentPostIdRules } = require('../validators/comments.validator');

const router = Router();

router.get('/', controller.list);
router.get('/post/:postId', commentPostIdRules, validate, controller.listByPost);
router.post('/', createCommentRules, validate, controller.create);

module.exports = router;
