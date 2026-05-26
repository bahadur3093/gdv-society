import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
