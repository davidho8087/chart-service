import logger from '../../lib/logger.js'
import * as dashboardServices from './services.js'

export const create = async (req, res) => {
  logger.debug('dashboardController.createDashboard')

  try {
    const userId = req.body.user
    const data = req.body.data
    const dashboard = await dashboardServices.create(userId, data)
    res.status(200).json({
      status: 200,
      data: dashboard,
      message: 'Dashboard created successfully',
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to create dashboard: ${error.message}`,
    })
  }
}

export const update = async (req, res) => {
  logger.debug('dashboardController.updateDashboard')

  try {
    const id = req.params.id
    const data = req.body.data
    const updated = await dashboardServices.update(id, data)
    res.status(200).json({
      status: 200,
      data: updated,
      message: 'Dashboard updated successfully',
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to update dashboard: ${error.message}`,
    })
  }
}

export const remove = async (req, res) => {
  logger.debug('dashboardController.removeDashboard')

  try {
    const id = req.params.id
    const deleted = await dashboardServices.remove(id)
    res.status(200).json({
      status: 200,
      data: deleted,
      message: 'Dashboard deleted successfully',
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to delete dashboard: ${error.message}`,
    })
  }
}

export const findOneByUserId = async (req, res) => {
  logger.debug('dashboardController.findOneByUserId')

  try {
    const userId = req.params.id
    const dashboard = await dashboardServices.findOneByUserId(userId)
    res.status(200).json({
      status: 200,
      data: dashboard,
      message: 'Dashboard retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to retrieve dashboard: ${error.message}`,
    })
  }
}

export const findAllByUserId = async (req, res) => {
  logger.debug('dashboardController.findAllByUserId')

  try {
    const userId = req.params.id
    const dashboards = await dashboardServices.findAllByUserId(userId)
    res.status(200).json({
      status: 200,
      data: dashboards,
      message: 'Dashboards retrieved successfully',
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to retrieve dashboards: ${error.message}`,
    })
  }
}
