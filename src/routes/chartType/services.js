import logger from '../../lib/logger.js'
import { dbHealth } from '../../lib/dbConnection.js'
import { handleError } from '../../utils/errorHandler.js'

export const findOneChartType = async (typeName) => {
  logger.debug('findOneChartType Service')
  try {
    return await dbHealth('chart_types').where({ type: typeName }).first()
  } catch (error) {
    handleError(error, 'findOneChartType Service')
    throw error
  }
}

export const findAllChartType = async () => {
  logger.debug('findAllChartTypes  Service')
  try {
    return await dbHealth('chart_types').where({})
  } catch (error) {
    handleError(error, 'findOneChartType Service')
    throw error
  }
}
