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
