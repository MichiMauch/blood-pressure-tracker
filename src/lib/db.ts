import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export type { MeasurementSession } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "blood-pressure.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");

    _db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        timeOfDay TEXT NOT NULL,
        systolic1 INTEGER NOT NULL,
        diastolic1 INTEGER NOT NULL,
        pulse1 INTEGER NOT NULL,
        systolic2 INTEGER NOT NULL,
        diastolic2 INTEGER NOT NULL,
        pulse2 INTEGER NOT NULL,
        systolicAvg INTEGER NOT NULL,
        diastolicAvg INTEGER NOT NULL,
        pulseAvg INTEGER NOT NULL,
        note TEXT
      )
    `);
  }
  return _db;
}
