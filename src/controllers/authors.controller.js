const authorsService = require('../services/authors.service');

const list = async (req, res, next) => {
  try {
    const authors = await authorsService.findAll();
    res.status(200).json(authors);
  } catch (error) {
    next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    const author = await authorsService.findById(req.params.id);
    res.status(200).json(author);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const author = await authorsService.create(req.body);
    res.status(201).json(author);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const author = await authorsService.update(req.params.id, req.body);
    res.status(200).json(author);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await authorsService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { list, detail, create, update, remove };
