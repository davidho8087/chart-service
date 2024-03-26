
import { dbHealth, dbPeopleCount } from "../lib/dbConnection.js";
import { AI_HEALTH_DB, AI_PEOPLE_COUNT_DB } from "../../config.js";

/**
 * Gets the dynamic database connection based on the database name.
 * @param {string} dbName - The name of the database from the response.
 * @returns The database connection object.
 * @throws {Error} If the database connection is not found.
 */
export function getDynamicDbConnection(dbName) {
	let dbDynamicConn;

	// Mapping of database names to their respective connection objects
	const connectionsMap = {
		[AI_HEALTH_DB]: dbHealth,
		[AI_PEOPLE_COUNT_DB]: dbPeopleCount,
	};

	dbDynamicConn = connectionsMap[dbName];

	if (!dbDynamicConn) {
		throw new Error('Database connection not found');
	}

	return dbDynamicConn;
}
