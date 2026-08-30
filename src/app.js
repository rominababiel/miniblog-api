const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const openapiDocument = YAML.load(path.join(__dirname, '..', 'docs', 'openapi.yaml'));

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use('/api-docs.json', (req, res) => res.status(200).json(openapiDocument));

app.use(routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
