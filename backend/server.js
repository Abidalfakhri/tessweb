require('dotenv').config();
const express = require('express');
const cors = require('cors');
const appConfig = require('./src/config/appConfig');
const pool = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
app.use(cors({ origin: appConfig.frontendUrl }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// test DB connection
pool.connect()
  .then(c => { c.release(); console.log('DB connected'); })
  .catch(e => console.error('DB connection error', e.stack));

app.use(errorHandler);

const port = appConfig.port;
app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
