// index.js

import * as dotenv from 'dotenv'
dotenv.config()

import app from './server.js'
import { defaultSetting } from '../config.js'
import logger from './lib/logger.js'
import { dbHealth, dbPeopleCount, dbConfigHealth, dbConfigPeopleCount, checkKnexConnection } from './lib/dbConnection.js'; // Adjust the import path as needed


const port = defaultSetting.port
const environment = defaultSetting.environment

// Prepare a list of databases to check
const databasesToCheck = [
  { db: dbHealth, name: dbConfigHealth.connection.database },
  { db: dbPeopleCount, name: dbConfigPeopleCount.connection.database }
];

// Check database connection for each database before starting the server
Promise.all(databasesToCheck.map(database =>
  checkKnexConnection(database.db, database.name)
)).then((results) => {
  // Check if all database connections were successful
  const allConnected = results.every(connectionStatus => connectionStatus);
  if (allConnected) {
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`Server is running in ${environment} mode`);
      logger.info(`http://localhost:${port}`);
    });
  } else {
    logger.error('Failed to establish database connections. Exiting...');
    process.exit(1);
  }
}).catch(err => {
  logger.error(`Error during database checks: ${err.message}`);
});
