const mockPoolQuery = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({ query: mockPoolQuery })),
}));

const { Pool } = require('pg');

const loadDb = () => {
  let db;
  jest.isolateModules(() => {
    db = require('../src/config/db');
  });
  return db;
};

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.DB_SSL;
});

describe('config/db', () => {
  it('crea el pool con la connection string del entorno y sin ssl por defecto', () => {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/miniblog';

    loadDb();

    expect(Pool).toHaveBeenCalledWith({
      connectionString: 'postgresql://postgres:postgres@localhost:5432/miniblog',
      ssl: false,
    });
  });

  it('habilita ssl cuando DB_SSL es true', () => {
    process.env.DB_SSL = 'true';

    loadDb();

    expect(Pool.mock.calls[0][0].ssl).toEqual({ rejectUnauthorized: false });
  });

  it('delega las queries parametrizadas al pool', async () => {
    const db = loadDb();

    await db.query('SELECT * FROM authors WHERE id = $1', [1]);

    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM authors WHERE id = $1', [1]);
  });
});
