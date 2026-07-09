import { dbLocal } from './db.local';
import { dbMysql } from './db.mysql';

// Strictly enforce MySQL in production. Do not fallback to JSON in production.
const isProduction = process.env.NODE_ENV === 'production';
const hasMysqlEnv = !!process.env.MYSQL_DATABASE;

if (isProduction && !hasMysqlEnv) {
  console.error('MYSQL ENV MISSING: Production environment requires MySQL credentials.');
}

// In production, ALWAYS export dbMysql (it will safely return empty arrays if connection fails).
// In development, fallback to local JSON if MySQL is not configured.
export const db = isProduction ? dbMysql : (hasMysqlEnv ? dbMysql : dbLocal);
