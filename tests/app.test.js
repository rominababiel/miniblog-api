const request = require('supertest');
const app = require('../src/app');
const { query } = require('../src/config/db');

jest.mock('../src/config/db');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Infraestructura de la API', () => {
  it('GET /health devuelve 200 y el estado del servicio', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /api-docs.json devuelve la especificacion OpenAPI', async () => {
    const response = await request(app).get('/api-docs.json');

    expect(response.status).toBe(200);
    expect(response.body.info.title).toBe('MiniBlog API');
    expect(response.body.paths['/authors']).toBeDefined();
  });

  it('devuelve 404 en una ruta inexistente', async () => {
    const response = await request(app).get('/rutas-que-no-existen');

    expect(response.status).toBe(404);
    expect(response.body.error).toContain('Ruta no encontrada');
  });

  it('traduce la violacion de unicidad de PostgreSQL a 409', async () => {
    const databaseError = new Error('duplicate key value violates unique constraint');
    databaseError.code = '23505';
    query.mockRejectedValueOnce(databaseError);

    const response = await request(app).get('/authors');

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'El registro ya existe' });
  });

  it('traduce la violacion de clave foranea de PostgreSQL a 400', async () => {
    const databaseError = new Error('violates foreign key constraint');
    databaseError.code = '23503';
    query.mockRejectedValueOnce(databaseError);

    const response = await request(app).get('/posts');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'El recurso referenciado no existe' });
  });

  it('traduce el campo obligatorio nulo de PostgreSQL a 400', async () => {
    const databaseError = new Error('null value violates not-null constraint');
    databaseError.code = '23502';
    query.mockRejectedValueOnce(databaseError);

    const response = await request(app).get('/comments');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Falta un campo obligatorio' });
  });

  it('traduce el valor demasiado largo de PostgreSQL a 400', async () => {
    const databaseError = new Error('value too long for type character varying');
    databaseError.code = '22001';
    query.mockRejectedValueOnce(databaseError);

    const response = await request(app).get('/authors');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Un valor supera la longitud permitida' });
  });

  it('traduce el formato de dato invalido de PostgreSQL a 400', async () => {
    const databaseError = new Error('invalid input syntax for type integer');
    databaseError.code = '22P02';
    query.mockRejectedValueOnce(databaseError);

    const response = await request(app).get('/posts');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Formato de dato invalido' });
  });

  it('devuelve 500 cuando la base de datos falla', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    query.mockRejectedValueOnce(new Error('connection terminated'));

    const response = await request(app).get('/authors');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error interno del servidor' });
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
