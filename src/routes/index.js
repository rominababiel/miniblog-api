const { Router } = require('express');
const authorsRoutes = require('./authors.routes');
const postsRoutes = require('./posts.routes');
const commentsRoutes = require('./comments.routes');

const router = Router();

router.use('/authors', authorsRoutes);
router.use('/posts', postsRoutes);
router.use('/comments', commentsRoutes);

module.exports = router;
