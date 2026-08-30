const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/config/db');

jest.mock('../src/config/db');

const author = {
  id: 2,
  name: 'Carlos Ruiz',
  email: 'carlos@example.com',
  bio: 'Escritor tecnico',
  created_at: '2026-01-01T10:00:00.000Z',
};

const post = {
  id: 1,
  title: 'Introduccion a Node.js',
  content: 'Node.js es un runtime de JavaScript...',
  author_id: 1,
  published: true,
  created_at: '2026-01-02T10:00:00.000Z',
};

const comment = {
  id: 1,
  content: 'Muy buena introduccion',
  post_id: 1,
  author_id: 2,
  created_at: '2026-01-03T10:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /comments', () => {
  it('devuelve 200 con el listado de comments', async () => {
    query.mockResolvedValueOnce({ rows: [comment], rowCount: 1 });

    const response = await request(app).get('/comments');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([comment]);
  });

  it('devuelve 500 cuando falla la consulta a la base de datos', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    query.mockRejectedValueOnce(new Error('connection terminated'));

    const response = await request(app).get('/comments');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error interno del servidor' });

    consoleError.mockRestore();
  });
});

describe('GET /comments/post/:postId', () => {
  it('devuelve 200 con los comments y el detalle del post', async () => {
    query
      .mockResolvedValueOnce({ rows: [post], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [comment], rowCount: 1 });

    const response = await request(app).get('/comments/post/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ post, comments: [comment] });
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('WHERE post_id = $1'), ['1']);
  });

  it('devuelve 404 cuando el post no existe', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app).get('/comments/post/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Post no encontrado' });
  });
});

describe('POST /comments', () => {
  it('devuelve 201 y el comment creado con author', async () => {
    query
      .mockResolvedValueOnce({ rows: [post], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [comment], rowCount: 1 });

    const response = await request(app)
      .post('/comments')
      .send({ content: 'Muy buena introduccion', post_id: 1, author_id: 2 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(comment);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO comments'),
      ['Muy buena introduccion', 1, 2],
    );
  });

  it('devuelve 201 y guarda author_id nulo cuando el comment es anonimo', async () => {
    query
      .mockResolvedValueOnce({ rows: [post], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ ...comment, author_id: null }], rowCount: 1 });

    const response = await request(app)
      .post('/comments')
      .send({ content: 'Muy buena introduccion', post_id: 1 });

    expect(response.status).toBe(201);
    expect(response.body.author_id).toBeNull();
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO comments'),
      ['Muy buena introduccion', 1, null],
    );
  });

  it('devuelve 400 cuando el contenido esta vacio', async () => {
    const response = await request(app).post('/comments').send({ content: '', post_id: 1 });

    expect(response.status).toBe(400);
    expect(response.body.details).toContainEqual({ field: 'content', message: 'El contenido es obligatorio' });
    expect(query).not.toHaveBeenCalled();
  });

  it('devuelve 404 cuando el post comentado no existe', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app)
      .post('/comments')
      .send({ content: 'Muy buena introduccion', post_id: 999 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Post no encontrado' });
  });

  it('devuelve 404 cuando el author del comment no existe', async () => {
    query
      .mockResolvedValueOnce({ rows: [post], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app)
      .post('/comments')
      .send({ content: 'Muy buena introduccion', post_id: 1, author_id: 999 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Author no encontrado' });
  });
});
