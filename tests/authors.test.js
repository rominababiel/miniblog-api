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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /authors', () => {
  it('devuelve 200 con el listado de authors', async () => {
    query.mockResolvedValueOnce({ rows: [author], rowCount: 1 });

    const response = await request(app).get('/authors');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([author]);
    expect(query).toHaveBeenCalledTimes(1);
  });
});

describe('GET /authors/:id', () => {
  it('devuelve 200 con el author solicitado usando una query parametrizada', async () => {
    query.mockResolvedValueOnce({ rows: [author], rowCount: 1 });

    const response = await request(app).get('/authors/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(author);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['1']);
  });

  it('devuelve 404 cuando el author no existe', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app).get('/authors/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Author no encontrado' });
  });

  it('devuelve 400 cuando el id no es un numero valido', async () => {
    const response = await request(app).get('/authors/abc');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Datos invalidos');
    expect(query).not.toHaveBeenCalled();
  });
});

describe('POST /authors', () => {
  it('devuelve 201 y el author creado', async () => {
    query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 });

    const response = await request(app)
      .post('/authors')
      .send({ name: 'Ana Garcia', email: 'ana@example.com', bio: 'Desarrolladora full-stack' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(author);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO authors'),
      ['Ana Garcia', 'ana@example.com', 'Desarrolladora full-stack'],
    );
  });

  it('guarda bio nula cuando no se envia el campo', async () => {
    query
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ ...author, bio: null }], rowCount: 1 });

    const response = await request(app)
      .post('/authors')
      .send({ name: 'Ana Garcia', email: 'ana@example.com' });

    expect(response.status).toBe(201);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('INSERT INTO authors'),
      ['Ana Garcia', 'ana@example.com', null],
    );
  });

  it('devuelve 400 cuando el nombre esta vacio', async () => {
    const response = await request(app)
      .post('/authors')
      .send({ name: '   ', email: 'ana@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.details).toContainEqual({ field: 'name', message: 'El nombre es obligatorio' });
    expect(query).not.toHaveBeenCalled();
  });

  it('devuelve 400 cuando el email tiene un formato invalido', async () => {
    const response = await request(app)
      .post('/authors')
      .send({ name: 'Ana Garcia', email: 'ana-example' });

    expect(response.status).toBe(400);
    expect(response.body.details).toContainEqual({ field: 'email', message: 'El email no tiene un formato valido' });
  });

  it('informa un unico error por cada campo obligatorio faltante', async () => {
    const response = await request(app).post('/authors').send({});

    expect(response.status).toBe(400);
    expect(response.body.details).toHaveLength(2);
    expect(response.body.details.map((item) => item.field)).toEqual(['name', 'email']);
  });

  it('devuelve 409 cuando el email ya esta registrado', async () => {
    query.mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 });

    const response = await request(app)
      .post('/authors')
      .send({ name: 'Ana Garcia', email: 'ana@example.com' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'El email ya esta registrado' });
    expect(query).toHaveBeenCalledTimes(1);
  });
});

describe('PUT /authors/:id', () => {
  it('devuelve 200 con el author actualizado', async () => {
    const updated = { ...author, name: 'Ana Gomez' };

    query
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [updated], rowCount: 1 });

    const response = await request(app)
      .put('/authors/1')
      .send({ name: 'Ana Gomez', email: 'ana@example.com', bio: 'Desarrolladora full-stack' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updated);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('UPDATE authors'),
      ['Ana Gomez', 'ana@example.com', 'Desarrolladora full-stack', '1'],
    );
  });

  it('guarda bio nula cuando la actualizacion no envia bio', async () => {
    query
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockResolvedValueOnce({ rows: [{ ...author, bio: null }], rowCount: 1 });

    const response = await request(app)
      .put('/authors/1')
      .send({ name: 'Ana Gomez', email: 'ana@example.com' });

    expect(response.status).toBe(200);
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('UPDATE authors'),
      ['Ana Gomez', 'ana@example.com', null, '1'],
    );
  });

  it('devuelve 404 cuando el author a actualizar no existe', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app)
      .put('/authors/999')
      .send({ name: 'Ana Gomez', email: 'ana@example.com' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Author no encontrado' });
  });

  it('devuelve 409 cuando el email pertenece a otro author', async () => {
    query
      .mockResolvedValueOnce({ rows: [author], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 2 }], rowCount: 1 });

    const response = await request(app)
      .put('/authors/1')
      .send({ name: 'Ana Gomez', email: 'carlos@example.com' });

    expect(response.status).toBe(409);
  });
});

describe('DELETE /authors/:id', () => {
  it('devuelve 204 cuando elimina el author', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const response = await request(app).delete('/authors/1');

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(query).toHaveBeenCalledWith('DELETE FROM authors WHERE id = $1', ['1']);
  });

  it('devuelve 404 al eliminar un author inexistente', async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await request(app).delete('/authors/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Author no encontrado' });
  });
});
