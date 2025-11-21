const express = require("express");
const app = express();
const appConfig = require("./config/appConfig");

app.use(express.json());

// Routes (belum diisi)
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transaction", require("./routes/transactionRoutes"));

// Error handler ()
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

app.listen(appConfig.port, () => {
  console.log(`Server berjalan di port ${appConfig.port}`);
});
