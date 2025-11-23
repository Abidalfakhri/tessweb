const service = require('../services/transactionService');
const { success, error } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const list = await service.getAll(req.user.id);
    return success(res, list, 'transactions fetched');
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const trx = await service.getById(Number(req.params.id), req.user.id);
    if (!trx) return error(res, 'not found', 404);
    return success(res, trx, 'transaction fetched');
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const saved = await service.create(req.body, req.user.id);
    return success(res, saved, 'created');
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await service.update(Number(req.params.id), req.body, req.user.id);
    if (!updated) return error(res, 'not found', 404);
    return success(res, updated, 'updated');
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.remove(Number(req.params.id), req.user.id);
    return success(res, null, 'deleted');
  } catch (err) { next(err); }
};
