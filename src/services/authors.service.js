const { query } = require('../config/db');
const AppError = require('../utils/AppError');

const AUTHOR_FIELDS = 'id, name, email, bio, created_at';

const ensureEmailIsAvailable = async (email, excludedId = 0) => {
  const { rows } = await query('SELECT id FROM authors WHERE email = $1 AND id <> $2', [email, excludedId]);

  if (rows.length > 0) {
    throw new AppError('El email ya esta registrado', 409);
  }
};

const findAll = async () => {
  const { rows } = await query(`SELECT ${AUTHOR_FIELDS} FROM authors ORDER BY id`);
  return rows;
};

const findById = async (id) => {
  const { rows } = await query(`SELECT ${AUTHOR_FIELDS} FROM authors WHERE id = $1`, [id]);

  if (rows.length === 0) {
    throw new AppError('Author no encontrado', 404);
  }

  return rows[0];
};

const create = async ({ name, email, bio }) => {
  await ensureEmailIsAvailable(email);

  const { rows } = await query(
    `INSERT INTO authors (name, email, bio) VALUES ($1, $2, $3) RETURNING ${AUTHOR_FIELDS}`,
    [name, email, bio ?? null],
  );

  return rows[0];
};

const update = async (id, { name, email, bio }) => {
  await findById(id);
  await ensureEmailIsAvailable(email, id);

  const { rows } = await query(
    `UPDATE authors SET name = $1, email = $2, bio = $3 WHERE id = $4 RETURNING ${AUTHOR_FIELDS}`,
    [name, email, bio ?? null, id],
  );

  return rows[0];
};

const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM authors WHERE id = $1', [id]);

  if (rowCount === 0) {
    throw new AppError('Author no encontrado', 404);
  }
};

module.exports = { findAll, findById, create, update, remove };
