const service = require('../services/categoryService');
const { success } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const data = await service.getAll();
    return success(res, data, 'categories fetched');
  } catch (err) { next(err); }
};
