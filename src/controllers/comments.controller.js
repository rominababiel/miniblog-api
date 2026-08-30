const commentsService = require('../services/comments.service');

const list = async (req, res, next) => {
  try {
    const comments = await commentsService.findAll();
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

const listByPost = async (req, res, next) => {
  try {
    const result = await commentsService.findByPostId(req.params.postId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const comment = await commentsService.create(req.body);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

module.exports = { list, listByPost, create };
