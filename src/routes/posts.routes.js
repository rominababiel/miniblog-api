const { Router } = require('express');
const controller = require('../controllers/posts.controller');
const validate = require('../middlewares/validate');
const { createPostRules, updatePostRules, postIdRules, postAuthorIdRules } = require('../validators/posts.validator');

const router = Router();

router.get('/', controller.list);
router.get('/author/:authorId', postAuthorIdRules, validate, controller.listByAuthor);
router.get('/:id', postIdRules, validate, controller.detail);
router.post('/', createPostRules, validate, controller.create);
router.put('/:id', updatePostRules, validate, controller.update);
router.delete('/:id', postIdRules, validate, controller.remove);

module.exports = router;
