import logger from '../../lib/logger.js'
import { dbHealth } from '../../lib/dbConnection.js'
import { handleError } from '../../utils/errorHandler.js'

export const findOneUser = async (userId) => {
  logger.debug('findOneUser Service')
  try {
    return await dbHealth('up_users').where({ id: userId }).first()
  } catch (error) {
    handleError(error, 'findOneUser Service')
    throw error
  }
}


export const findOneUserAndRole = async (userId)=> {
  try {
    return await dbHealth('up_users as u')
      .select(
        'u.id',
        'u.email',
        'u.first_name',
        'r.name as role'
      )
      .leftJoin('up_users_role_links as ur', 'ur.user_id', 'u.id')
      .leftJoin('up_roles as r', 'r.id', 'ur.role_id')
      .where('u.id', userId)
      .first();

  } catch (error) {
    handleError(error, 'findOneUserAndRole Service')
    throw error;
  }
}