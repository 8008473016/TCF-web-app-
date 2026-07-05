import { dbLocal } from './db.local';
import { dbMysql } from './db.mysql';

export const db = (process.env.NODE_ENV === 'production' || process.env.FORCE_MYSQL === 'true') 
  ? dbMysql 
  : dbLocal;
