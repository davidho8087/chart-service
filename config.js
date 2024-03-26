// config.js
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const environment = process.env.NODE_ENV || 'development'
const envFile = `.env.${environment}`
dotenv.config({ path: envFile })

// Convert the import.meta.url to a directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Default Settings
const defaultSetting = {
  port: process.env.PORT || 8002,
  environment,
}

// SSL Configuration
const sslConfig = JSON.parse(process.env.USE_SSL_CERT ?? 'false')
  ? {
    rejectUnauthorized: false,
    cert: fs.readFileSync(
      path.resolve(__dirname, '../pg-ca-certificate.crt'),
      'utf8',
    ),
  }
  : undefined
const dbConfigHealth = {
  client: 'postgresql',
  connection: {
    database: process.env.PG_DBNAME1,
    user: process.env.PG_USERNAME1,
    password: process.env.PG_PASSWORD1,
    host: process.env.PG_HOSTNAME1,
    port: process.env.PG_PORT1 || 5432,
    ssl: sslConfig, // Make sure you define or adjust your SSL configurations as needed
  },
  pool: { min: 0, max: 10 },
};

const dbConfigPeopleCount = {
  client: 'postgresql',
  connection: {
    database: process.env.PG_DBNAME2,
    user: process.env.PG_USERNAME2,
    password: process.env.PG_PASSWORD2,
    host: process.env.PG_HOSTNAME2,
    port: process.env.PG_PORT2 || 5432,
    ssl: sslConfig, // Make sure you define or adjust your SSL configurations as needed
  },
  pool: { min: 0, max: 10 },
};

const AI_HEALTH_DB = process.env.AI_HEALTH_DB
const AI_PEOPLE_COUNT_DB = process.env.AI_PEOPLE_COUNT_DB

export {
  dbConfigHealth,
  dbConfigPeopleCount,
  defaultSetting,
  AI_HEALTH_DB,
  AI_PEOPLE_COUNT_DB };
