const Transaction = require('../models/TransactionModel');

exports.getAll = (userId) => Transaction.getAllByUser(userId);
exports.getById = (id, userId) => Transaction.getById(id, userId);
exports.create = (payload, userId) => Transaction.create(payload, userId);
exports.update = (id, payload, userId) => Transaction.update(id, payload, userId);
exports.remove = (id, userId) => Transaction.remove(id, userId);
