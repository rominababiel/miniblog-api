const { Router } = require('express');
const controller = require('../controllers/authors.controller');
const validate = require('../middlewares/validate');
const { createAuthorRules, updateAuthorRules, authorIdRules } = require('../validators/authors.validator');

const router = Router();

router.get('/', controller.list);
router.get('/:id', authorIdRules, validate, controller.detail);
router.post('/', createAuthorRules, validate, controller.create);
router.put('/:id', updateAuthorRules, validate, controller.update);
router.delete('/:id', authorIdRules, validate, controller.remove);

module.exports = router;
