import logger from '../../lib/logger.js'
import * as ChartTypeServices from './services.js'

export const findAllChartTypeController = async (req, res) => {
  logger.debug('findAllGenChartLogController')

  try {
    const records = await ChartTypeServices.findAllChartType()
    res.status(200).send({
      status: 'success',
      data: records,
    })
  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: error.message,
    })
  }
}