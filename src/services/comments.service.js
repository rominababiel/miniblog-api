const { query } = require('../config/db');
const authorsService = require('./authors.service');
const postsService = require('./posts.service');

const COMMENT_FIELDS = 'id, content, post_id, author_id, created_at';

const findAll = async () => {
  const { rows } = await query(`SELECT ${COMMENT_FIELDS} FROM comments ORDER BY id`);
  return rows;
};

const findByPostId = async (postId) => {
  const post = await postsService.findById(postId);
  const { rows } = await query(`SELECT ${COMMENT_FIELDS} FROM comments WHERE post_id = $1 ORDER BY id`, [postId]);

  return { post, comments: rows };
};

const create = async ({ content, post_id: postId, author_id: authorId }) => {
  await postsService.findById(postId);

  if (authorId) {
    await authorsService.findById(authorId);
  }

  const { rows } = await query(
    `INSERT INTO comments (content, post_id, author_id) VALUES ($1, $2, $3) RETURNING ${COMMENT_FIELDS}`,
    [content, postId, authorId ?? null],
  );

  return rows[0];
};

module.exports = { findAll, findByPostId, create };
