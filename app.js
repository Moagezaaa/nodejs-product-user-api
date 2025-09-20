const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 3000;
app.use(express.json());
app.use(cors());
app.use(helmet());
const productRoutes = require('./routes/product.route');
const userRoutes = require('./routes/user.route');
const httpStatusText = require('./utils/httpStatusText');
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(process.env.port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});