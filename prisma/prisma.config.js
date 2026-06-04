require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

module.exports = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
