import { dbLocal } from './db.local';
import { dbMysql } from './db.mysql';

// Only use MySQL if the credentials are provided, otherwise fallback to local JSON to prevent connection hangs
export const db = process.env.MYSQL_DATABASE 
  ? dbMysql 
  : dbLocal;
