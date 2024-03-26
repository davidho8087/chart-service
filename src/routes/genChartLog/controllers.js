import * as GenChartLogServices from '../genChartLog/services.js'
import * as ChartTypeServices from '../chartType/services.js'
import * as UserServices from '../user/services.js'
import * as AdminOutletServices from '../adminOutlet/services.js'
import logger from '../../lib/logger.js'

const MANAGER = 'Manager'

export const createGenChartLogController = async (req, res) => {
	logger.debug('createGenChartLogController')

	const data = req.body.data
	const typeName = data.typeName
	const prompt = data.prompt
	const userId = data.userId 

	try {
		const chartTypeRecord = await ChartTypeServices.findOneChartType(typeName)

		if (!chartTypeRecord) {
			return res.status(404).send({
				status: 404,
				message: `Chart type ${data.type} not found.`,
			})
		}

		const user = await UserServices.findOneUserAndRole(userId)
		if (!user) {
			return res.status(404).send({
				status: 404,
				message: `User with ID ${userId} not found.`,
			})
		}

		const newRecord = await GenChartLogServices.createGenChartLog(data)
		let dataSet = newRecord.dataSet


		// ADMIN ROLE has no store attached by default
		// Only Manager has store attached.
		if (user.role === MANAGER) {
			const stores = await AdminOutletServices.findStoreByUserId(userId)
			dataSet = dataSet.filter(record => stores.includes(record.name));
		}


		let functionStringReplaced = null;
		// Check if dataSet is empty
		if (dataSet.length === 0) {
			logger.warn('Dataset is empty. No data to display.');
			// Handle empty dataset case (e.g., return a default chart configuration or an error message)
		} else {
			// Proceed with dynamic key extraction and function string modification
			const keys = Object.keys(dataSet[0]);
			const x = keys[0];
			const y = keys[1];

			// Assuming chartTypeRecord.function is your function string
			const functionString = chartTypeRecord.function;

			// Replace all instances of xProp and yProp
			functionStringReplaced = functionString.replace(/xProp/g, x).replace(/yProp/g, y);
		}

		const responseRecord = {
			id: newRecord.id,
			prompt,
			typeName,
			typeFunction: functionStringReplaced || chartTypeRecord,
			genChartLogId: newRecord.id,
			dbName: newRecord.db_name,
			dataSet: dataSet,
		}

		res.status(201).send({
			status: 'success',
			data: responseRecord,
			message: 'New chart log created successfully.',
		})
	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}

export const findAllGenChartLogController = async (req, res) => {
	logger.debug('findAllGenChartLogController')

	try {
		const records = await GenChartLogServices.findAllGenChartLogs()
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

export const findOneGenChartLogController = async (req, res) => {
	logger.debug('findOneGenChartLogController')

	const id = req.params.id

	try {
		const record = await GenChartLogServices.findOneGenChartLog(id)

		if (!record) {
			return res.status(404).send({
				status: 404,
				message: `No record found with the specified ID ${id}`,
			})
		}

		res.status(200).send({
			status: 'success',
			data: record,
		})
	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}

export const deleteGenChartLogController = async (req, res) => {
	logger.debug('deleteGenChartLogController')

	const id = req.params.id

	try {
		const rowDeleted = await GenChartLogServices.deleteGenChartLog(id)

		if (rowDeleted === 0) {
			return res.status(404).send({
				status: 404,
				message: `No record found with the specified ID ${id}`,
			})
		}

		res.status(200).send({
			status: 'success',
			message: `Record with ID ${id} deleted`,
		})
	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}

export const findStoreCodeByUserIdController = async (req, res) => {
	logger.debug('findStoreCodeByUserId-Controller')


	const userId = req.params.id

	try {
		const user = await UserServices.findOneUserAndRole(userId)
		// ADMIN ROLE has no store by default
		// Only Manager has store attached.
		let stores = []
		if (user.role === MANAGER) {
			stores = await AdminOutletServices.findStoreByUserId(userId)
		}


		return res.status(200).send({
			status: 'success',
			message: `Record with userID ${userId} found`,
			stores: stores
		})

		// return res.status(200).send("Hello World")
	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}

