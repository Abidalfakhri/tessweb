const service = require('../services/authService');
const { success, error } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const user = await service.register(req.body);
    return success(res, user, 'registered');
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const data = await service.login(req.body);
    return success(res, data, 'logged in');
  } catch (err) { next(err); }
};
