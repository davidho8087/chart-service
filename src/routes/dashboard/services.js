import { dbHealth } from '../../lib/dbConnection.js'
import logger from '../../lib/logger.js'
import { handleError } from '../../utils/errorHandler.js'

export const create = async (userId, data) => {
  logger.debug('dashboardService.create')
  let dashboard = null
  const trx = await dbHealth.transaction()
  try {
    // Insert dashboard record
    dashboard = await trx('dashboards')
      .insert({
        name: data.name,
        layout: data.layout,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now(),
        created_by_id: userId,
        updated_by_id: userId,
      })
      .returning('*')
      .then((res) => res[0])

    const maxOrderResult = await trx('dashboards_users_permissions_user_links')
      .where('user_id', userId)
      .max('dashboard_order as maxOrder')
      .first()

    const nextOrder =
      maxOrderResult.maxOrder !== null ? maxOrderResult.maxOrder + 1 : 1

    // Insert the link with the new order
    await trx('dashboards_users_permissions_user_links').insert({
      dashboard_id: dashboard.id,
      user_id: userId,
      dashboard_order: nextOrder,
    })
    await trx.commit()
  } catch (error) {
    handleError(error, 'dashboardService.create')
    await trx.rollback()
    throw error
  }
  return dashboard
}

export const update = async (id, data) => {
  logger.debug('dashboardService.update')
  let updated = null

  try {
    updated = await dbHealth('dashboards')
      .where({ id })
      .update({ ...data, updated_at: dbHealth.fn.now() })
      .returning('*')
  } catch (error) {
    handleError(error, 'dashboardService.remove')
    throw error
  }

  return updated
}
export const remove = async (id) => {
  logger.debug('dashboardService.remove')
  let deleted = null

  const trx = await dbHealth.transaction()
  try {
    // First delete the junction table records
    await trx('dashboards_users_permissions_user_links')
      .where({ dashboard_id: id })
      .delete()
    // Now delete the smart layout record
    deleted = await trx('dashboards').where({ id }).delete()
    await trx.commit()
  } catch (error) {
    handleError(error, 'dashboardService.remove')
    await trx.rollback()
    throw error
  }

  return deleted
}

export const findOneByUserId = async (userId) => {
  logger.debug('dashboardService.findOneByUserId')

  try {
    return (
      (await dbHealth('dashboards')
        .select('dashboards.id', 'dashboards.name', 'dashboards.layout')
        .leftJoin('dashboards_users_permissions_user_links', function () {
          this.on(
            'dashboards.id',
            '=',
            'dashboards_users_permissions_user_links.dashboard_id'
          )
        })
        .where('dashboards_users_permissions_user_links.user_id', userId)
        .first()) ?? {}
    )
  } catch (error) {
    handleError(error, 'dashboardService.findOneByUserId')
    throw error
  }
}
export const findAllByUserId = async (userId) => {
  logger.debug('dashboardService.findOneByUserId')

  try {
    return await dbHealth('dashboards')
      .select('dashboards.id', 'dashboards.name', 'dashboards.layout')
      .leftJoin('dashboards_users_permissions_user_links', function () {
        this.on(
          'dashboards.id',
          '=',
          'dashboards_users_permissions_user_links.dashboard_id'
        )
      })
      .where('dashboards_users_permissions_user_links.user_id', userId)
  } catch (error) {
    handleError(error, 'dashboardService.findOneByUserId')
    throw error
  }
}
