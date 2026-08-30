const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const fileName = process.argv[2];

const run = async () => {
  if (!fileName) {
    throw new Error('Debes indicar el archivo SQL a ejecutar. Ejemplo: node scripts/run-sql.js schema.sql');
  }

  const filePath = path.join(__dirname, '..', 'db', fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontro el archivo ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
  console.log(`Script ${fileName} ejecutado correctamente`);
};

run()
  .catch((error) => {
    console.error(`Error al ejecutar el script: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
