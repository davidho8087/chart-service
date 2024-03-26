
import logger from "../../lib/logger.js";
import { dbHealth } from "../../lib/dbConnection.js";
import { handleError } from "../../utils/errorHandler.js";

export const findStoreByUserId = async (userId) => {
	logger.debug('findStoreByUserId-Service')
	try {
		const result = await dbHealth('admin_outlets as o')
			.select(
				'u.id',
				'o.store_code',
			)
			.leftJoin('admin_outlets_users_permissions_users_links as ou', 'ou.admin_outlet_id', 'o.id')
			.leftJoin('up_users as u', 'u.id', 'ou.user_id')
			.leftJoin('up_users_role_links as ur', 'ur.user_id', 'u.id')
			.leftJoin('up_roles as r', 'r.id', 'ur.role_id')
			.where('u.id', userId);

		return result.map(store => store.store_code);
	} catch (error) {
		handleError(error, 'findStoreByUserId Service')
		throw error
	}
}
