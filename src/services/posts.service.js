const { query } = require('../config/db');
const AppError = require('../utils/AppError');
const authorsService = require('./authors.service');

const POST_FIELDS = 'id, title, content, author_id, published, created_at';

const findAll = async () => {
  const { rows } = await query(`SELECT ${POST_FIELDS} FROM posts ORDER BY id`);
  return rows;
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${POST_FIELDS} FROM posts WHERE id = $1`, [id]);

  if (rows.length === 0) {
    throw new AppError('Post no encontrado', 404);
  }

  return rows[0];
};

const findByAuthorId = async (authorId) => {
  const author = await authorsService.findById(authorId);
  const { rows } = await query(`SELECT ${POST_FIELDS} FROM posts WHERE author_id = $1 ORDER BY id`, [authorId]);

  return { author, posts: rows };
};

const create = async ({ title, content, author_id: authorId, published }) => {
  await authorsService.findById(authorId);

  const { rows } = await query(
    `INSERT INTO posts (title, content, author_id, published) VALUES ($1, $2, $3, $4) RETURNING ${POST_FIELDS}`,
    [title, content, authorId, published ?? false],
  );

  return rows[0];
};

const update = async (id, { title, content, author_id: authorId, published }) => {
  const post = await findById(id);
  await authorsService.findById(authorId);

  const { rows } = await query(
    `UPDATE posts SET title = $1, content = $2, author_id = $3, published = $4 WHERE id = $5 RETURNING ${POST_FIELDS}`,
    [title, content, authorId, published ?? post.published, id],
  );

  return rows[0];
};

const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM posts WHERE id = $1', [id]);

  if (rowCount === 0) {
    throw new AppError('Post no encontrado', 404);
  }
};

module.exports = { findAll, findById, findByAuthorId, create, update, remove };
