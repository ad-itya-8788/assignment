require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { router: authRouter } = require('./routes/auth');
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const storeRouter = require('./routes/store');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/owner', storeRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
