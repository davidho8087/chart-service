// dbConnection.js
import knex from 'knex'
// import { dbConfig } from '../../config.js'
import { dbConfigHealth, dbConfigPeopleCount } from '../../config.js';

import logger from './logger.js' // Adjust this path to where your config.js is located

// Knex instances for each database
const dbHealth = knex(dbConfigHealth);
const dbPeopleCount = knex(dbConfigPeopleCount);


// Function to check Knex connection
async function checkKnexConnection(dbKnex, dbName) {
  try {
    const result = await dbKnex.raw('SELECT NOW()');
    logger.debug(`${dbName} Knex connection established, current time:`, result.rows[0].now);
    return true;
  } catch (error) {
    logger.error(`Error establishing Knex connection for ${dbName}:`, error.message);
    return false;
  }
}

// Export both pool and knexInstance
// export { dbKnex, checkKnexConnection }
export { dbHealth, dbPeopleCount, dbConfigHealth, dbConfigPeopleCount, checkKnexConnection };
