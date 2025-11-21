const authService = require("../services/authService");
const response = require("../utils/response");

module.exports = {
  async register(req, res) {
    const result = await authService.register(req.body);
    response.success(res, "Registrasi berhasil", result);
  },

  async login(req, res) {
    const result = await authService.login(req.body);
    response.success(res, "Login berhasil", result);
  }
};

