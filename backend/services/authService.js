module.exports = {
  async register({ username, password }) {
    return { username, password, message: "User terdaftar (dummy)" };
  },

  async login({ _username, _password }) {
    return { token: "dummy-token" };
  }
};

