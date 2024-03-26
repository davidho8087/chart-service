import axios from 'axios';
import { handleError } from '../../utils/errorHandler.js'
import { dbHealth } from '../../lib/dbConnection.js'

import logger from '../../lib/logger.js'
import { getDynamicDbConnection } from "../../utils/getDynamicDBString.js";
// import { mockSQLStatement }  from '../../mock.js'


export const createGenChartLog = async (data) => {
  logger.debug('createGenChartLog');

  try {
    // Making POST request to generate SQL query
    const response = await axios.post('http://localhost:5002/generate_sql', {
      question: data.prompt,
    });

    const rawSqlStatement = response.data.sql_query;
    const responseAIDbNames = response.data.db_name;

    // const rawSqlStatement = mockSQLStatement.rawSqlStatement
    // const responseAIDbNames = mockSQLStatement.dbName

    logger.info('rawSqlStatement', rawSqlStatement)
    logger.info('responseAIDbNames', responseAIDbNames)


    // Use the getDynamicDbConnection function to dynamically select the database connection
    const dbDynamicConn = getDynamicDbConnection(responseAIDbNames);

    const type = data.typeName;
    const prompt = data.prompt;

    const timestamp = new Date(); // Current timestamp
    const resultRawStatement = await dbDynamicConn.raw(rawSqlStatement);

    const [insertedRecord] = await dbHealth('gen_chart_logs').insert({
      type,
      prompt,
      raw_sql_statement: rawSqlStatement, // Ensure parameterizedQuery is defined
      created_at: timestamp,
      updated_at: timestamp,
      db_name: responseAIDbNames,
    }).returning('*');

    return {
      ...insertedRecord, // Spread the properties of insertedRecord
      dataSet: resultRawStatement.rows, // Add resultRawStatement as a new property
    };
  } catch (error) {
    handleError(error);
    throw error;
  }
};

export const findAllGenChartLogs = async () => {
  logger.debug('findAllGenChartLogs Service')

  try {
    return await dbHealth('gen_chart_logs').select('*')
  } catch (error) {
    handleError(error, 'findAllGenChartLogs Service')
    throw error
  }
}

export const findOneGenChartLog = async (id) => {
  logger.debug('findOneGenChartLog Service')

  try {
    return await dbHealth('gen_chart_logs').where('id', id).first()
  } catch (error) {
    handleError(error, 'findOneGenChartLog Service')
    throw error
  }
}

export const deleteGenChartLog = async (id) => {
  logger.debug('deleteGenChartLog Service')
  
  try {
    return await dbHealth('gen_chart_logs')
      .where('id', id) // assuming 'id' is the column name for the ID
      .del()
  } catch (error) {
    handleError(error, 'deleteGenChartLog Service')
    throw error
  }
}

