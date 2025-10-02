import { Pool, QueryResult, QueryResultRow } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("FATAL ERROR: DATABASE_URL not set in environment variables.");
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false 
  }
});

const query = <T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> => {
  return pool.query(text, params) as unknown as Promise<QueryResult<T>>;
};

export {
  pool,
  query,
};