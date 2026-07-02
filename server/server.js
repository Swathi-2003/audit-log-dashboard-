require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

app.use('/api/logs', require('./routes/logs'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT      = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- Startup validation ---
if (!MONGO_URI || MONGO_URI.includes('YOUR_MONGODB')) {
  console.error('\n❌ ERROR: MONGO_URI is not set correctly in your .env file.');
  console.error('   1. Copy .env.example to .env');
  console.error('   2. Replace the placeholder with your real MongoDB Atlas connection string');
  console.error('   3. Make sure it includes /audit_logs before the ?\n');
  process.exit(1); // Stop immediately — don't silently fall back to local mongo
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected (Atlas)');
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Check your MONGO_URI in .env — wrong password or network issue.');
    process.exit(1);
  });
