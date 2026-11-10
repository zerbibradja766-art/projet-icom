require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  if (!process.env.JWT_SECRET) {
    console.error('Missing JWT_SECRET in environment');
    process.exit(1);
  }
  await connectDB();
  const server = app.listen(PORT, () => console.log(`API running on port ${PORT}`));

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    server.close(() => process.exit(1));
  });
})();
