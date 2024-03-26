// Service.js
import { dbHealth } from '../../lib/dbConnection.js'
import logger from '../../lib/logger.js'
import { handleError } from '../../utils/errorHandler.js'

export const createGenChart = async (
  genChartLogRecord,
  rawSqlStatement,
  userId,
  chartTypeRecord,
  name,
  chartFunction,
  dbNameRef,
  layoutRef
) => {
  logger.debug('createGenChart Service')

  const { prompt, type } = genChartLogRecord
  let newGenChart = null
  const timestamp = new Date() // Current timestamp
  const typeFunction = chartFunction ? chartFunction : chartTypeRecord.function
  const typeId = chartTypeRecord.id

  try {
    await dbHealth.transaction(async (trx) => {
      // Insert the new smart layout record
      ;[newGenChart] = await trx('gen_charts')
        .insert({
          prompt,
          type,
          type_id: typeId,
          function: typeFunction,
          name,
          raw_sql_statement: rawSqlStatement,
          db_name: dbNameRef,
          layout_ref: layoutRef,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .returning('*')

      // Calculate the next gen_chart_order for the user
      const maxOrderResult = await trx(
        'gen_charts_users_permissions_user_links'
      )
        .where('user_id', userId)
        .max('gen_chart_order as maxOrder')
        .first()

      const nextOrder =
        maxOrderResult.maxOrder !== null ? maxOrderResult.maxOrder + 1 : 1

      // Insert the link with the new order
      await trx('gen_charts_users_permissions_user_links').insert({
        gen_chart_id: newGenChart.id,
        user_id: userId,
        gen_chart_order: nextOrder,
      })
    })
  } catch (error) {
    // This catch block will handle any errors thrown from the transaction
    handleError(error, 'createGenChart Service')
    throw error
  }
  return newGenChart
}

export const findOneGenChart = async (genChartId) => {
  logger.debug('findOneGenChart Service')

  try {
    return await dbHealth('gen_charts').where({ id: genChartId }).first()
  } catch (error) {
    handleError(error, 'findOneGenChart Service')
    throw error
  }
}


export const findAllByUserId = async (userId) => {
  logger.debug('findAllByUserId Service')

  try {
    return await dbHealth('gen_charts')
      .select(
        'gen_charts.id',
        'gen_charts.name',
        'gen_charts.layout_ref',
        'gen_charts.prompt',
        'gen_charts.type',
        'gen_charts.raw_sql_statement',
        'gen_charts.function',
        'gen_charts.db_name'
      )
      .leftJoin('gen_charts_users_permissions_user_links', function () {
        this.on(
          'gen_charts.id',
          '=',
          'gen_charts_users_permissions_user_links.gen_chart_id'
        )
      })
      .where('gen_charts_users_permissions_user_links.user_id', userId)

  } catch (error) {
    handleError(error, 'findAllByUserId Service')
    throw error
  }
}

export const deleteGenChart = async (genChartId) => {
  logger.debug('deleteGenChart Service')
  let rowDeleted = null

  try {
    await dbHealth.transaction(async (trx) => {
      // First delete the junction table records
      await trx('gen_charts_users_permissions_user_links')
        .where({ gen_chart_id: genChartId })
        .delete()

      // Now delete the smart layout record
      rowDeleted = await trx('gen_charts').where({ id: genChartId }).delete()
    })
  } catch (error) {
    handleError(error, 'deleteGenChart Service')
    throw error
  }

  return rowDeleted
}

export const queryRawSqlStatement = async (rawSqlStatement, dbDynamicConn) => {
  logger.debug('compileRawSqlStatement')

  try {
    const result = await dbDynamicConn.raw(rawSqlStatement)
    return result.rows
  } catch (error) {
    handleError(error, 'compileRawSqlStatement Service')
    throw error
  }
}

export const dynamicFunctionToCharting = async (
  datasource,
  validEvalFunctionString,
  layoutRef
) => {
  try {
    return await validEvalFunctionString(datasource, layoutRef)
  } catch (error) {
    handleError(error, 'dynamicFunctionToCharting Service')
    throw error
  }
}

export const updateGenChart = async (
  genChartId,
  layoutUpdate
) => {
  try {

    // Update the layout object of the gen_chart record
    const [updatedRecord] = await dbHealth('gen_charts')
      .where({ id: genChartId})
      .update({
        layout_ref: layoutUpdate,
      })
      .returning('*');

    return updatedRecord
  } catch (error) {
    handleError(error, 'updateGenChart Service')
    throw error
  }
}

