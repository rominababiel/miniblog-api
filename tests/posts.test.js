const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/config/db');

jest.mock('../src/config/db');

const author = {
  id: 1,
  name: 'Ana Garcia',
  email: 'ana@example.com',
  bio: 'Desarrolladora full-stack',
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /posts', () => {
  it('devuelve 200 con el listado de posts', async () => {
    query.mockResolvedValueOnce({ rows: [post], rowCount: 1 });

    const response = await request(app).get('/posts');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([post]);
  });

  it('devuelve 500 cuando falla la consulta a la base de datos', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    query.mockRejectedValueOnce(new Error('connection terminated'));

    const response = await request(app).get('/posts');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error interno del servidor' });

    consoleError.mockRestore();
  });
});

describe('GET /posts/:id', () => {
  it('devuelve 200 con el post solicitado', async () => {
    query.mockResolvedValueOnce({ rows: [post], rowCount: 1 });

    const response = await request(app).get('/posts/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(post);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['1']);
  });

  it('devuelve 404 cuando el post no existe', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app).get('/posts/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Post no encontrado' });
  });
});

describe('GET /posts/author/:authorId', () => {
  it('devuelve 200 con los posts y el detalle del author', async () => {
    query
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [post], rowCount: 1 });

    const response = await request(app).get('/posts/author/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ author, posts: [post] });
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('WHERE author_id = $1'), ['1']);
  });

  it('devuelve 404 cuando el author no existe', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app).get('/posts/author/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Author no encontrado' });
  });

  it('devuelve 400 cuando el authorId no es un numero valido', async () => {
    const response = await request(app).get('/posts/author/abc');

    expect(response.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });
});

describe('POST /posts', () => {
  it('devuelve 201 y el post creado', async () => {
    query
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [post], rowCount: 1 });

    const response = await request(app)
      .post('/posts')
      .send({ title: post.title, content: post.content, author_id: 1, published: true });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(post);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO posts'),
      [post.title, post.content, 1, true],
    );
  });

  it('crea el post como no publicado cuando no se envia published', async () => {
    query
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ ...post, published: false }], rowCount: 1 });

    const response = await request(app)
      .post('/posts')
      .send({ title: post.title, content: post.content, author_id: 1 });

    expect(response.status).toBe(201);
    expect(response.body.published).toBe(false);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO posts'),
      [post.title, post.content, 1, false],
    );
  });

  it('devuelve 400 cuando faltan campos obligatorios', async () => {
    const response = await request(app).post('/posts').send({ title: 'Solo titulo' });

    expect(response.status).toBe(400);
    expect(response.body.details).toContainEqual({ field: 'content', message: 'El contenido es obligatorio' });
    expect(response.body.details).toContainEqual({ field: 'author_id', message: 'El author_id es obligatorio' });
    expect(query).not.toHaveBeenCalled();
  });

  it('informa un unico error por cada campo obligatorio faltante', async () => {
    const response = await request(app).post('/posts').send({});

    expect(response.status).toBe(400);
    expect(response.body.details).toHaveLength(3);
    expect(response.body.details.map((item) => item.field)).toEqual(['title', 'content', 'author_id']);
  });

  it('devuelve 404 cuando el author del post no existe', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app)
      .post('/posts')
      .send({ title: post.title, content: post.content, author_id: 999 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Author no encontrado' });
  });
});

describe('PUT /posts/:id', () => {
  it('devuelve 200 con el post actualizado', async () => {
    const updated = { ...post, title: 'Node.js avanzado' };

    query
      .mockResolvedValueOnce({ rows: [post], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [updated], rowCount: 1 });

    const response = await request(app)
      .put('/posts/1')
      .send({ title: 'Node.js avanzado', content: post.content, author_id: 1, published: true });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updated);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('UPDATE posts'),
      ['Node.js avanzado', post.content, 1, true, '1'],
    );
  });

  it('conserva el estado de publicacion cuando no se envia published', async () => {
    query
      .mockResolvedValueOnce({ rows: [post], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [post], rowCount: 1 });

    const response = await request(app)
      .put('/posts/1')
      .send({ title: post.title, content: post.content, author_id: 1 });

    expect(response.status).toBe(200);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('UPDATE posts'),
      [post.title, post.content, 1, true, '1'],
    );
  });

  it('devuelve 404 cuando el post a actualizar no existe', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app)
      .put('/posts/999')
      .send({ title: 'Node.js avanzado', content: post.content, author_id: 1 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Post no encontrado' });
  });
});

describe('DELETE /posts/:id', () => {
  it('devuelve 204 cuando elimina el post', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const response = await request(app).delete('/posts/1');

    expect(response.status).toBe(204);
    expect(query).toHaveBeenCalledWith('DELETE FROM posts WHERE id = $1', ['1']);
  });

  it('devuelve 404 al eliminar un post inexistente', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app).delete('/posts/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Post no encontrado' });
  });
});
