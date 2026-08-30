const postsService = require('../services/posts.service');

const list = async (req, res, next) => {
  try {
    const posts = await postsService.findAll();
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    const post = await postsService.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

const listByAuthor = async (req, res, next) => {
  try {
    const result = await postsService.findByAuthorId(req.params.authorId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const post = await postsService.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const post = await postsService.update(req.params.id, req.body);
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await postsService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = { list, detail, listByAuthor, create, update, remove };
