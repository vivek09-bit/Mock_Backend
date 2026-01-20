const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://igniteverse.in',
      'http://localhost:3000',
      'http://localhost:5173'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

app.options('*', cors());



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/verification', require('./routes/verification'));
app.use("/api/test", require("./routes/testRoutes"));
app.use('/api/user', require('./routes/user'));
// app.use(`/api/mocktest/${testId}`, testRoutes);
// app.get('/api/mocktest/:testId', getTest);
// app.get('/api/mocktest/:testId/questions', getQuestions);



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));