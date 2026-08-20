import Database from 'better-sqlite3';

const database = new Database("database.db")

database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

database.prepare(`
    CREATE TABLE IF NOT EXISTS roles
`)