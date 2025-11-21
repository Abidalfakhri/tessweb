const transactionService = require("../services/transactionService");
const response = require("../utils/response");

module.exports = {
    getAll(req, res) {
        const data = transactionService.getAll();
        response.success(res, "Data transaksi berhasil diambil", data);
    },

    create(req, res) {
        const data = transactionService.create(req.body);
        response.success(res, "Transaksi dibuat", data);
    }
};