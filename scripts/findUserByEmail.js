require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models/Structure');

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/findUserByEmail.js <email>');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) console.log('No user found for email:', email);
    else console.log('User:', user);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
