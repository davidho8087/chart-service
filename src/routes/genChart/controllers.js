import logger from '../../lib/logger.js'
import * as Utils from '../../utils/validateFunctionString.js'
import { validateGenChartFunctionGroup } from '../../utils/validateFunctionString.js'
import * as ChartTypeServices from '../chartType/services.js'
import * as GenChartLogServices from '../genChartLog/services.js'
import * as UserServices from '../user/services.js'
import * as GenChartServices from './services.js'
import { getDynamicDbConnection } from "../../utils/getDynamicDBString.js";
import { getLayoutTemplateByChartType } from '../../utils/getLayoutTemplateByChartType.js'
import * as AdminOutletServices from "../adminOutlet/services.js";
const MANAGER = 'Manager'
export const createGenChartController = async (req, res) => {
	logger.debug('createGenChartController')

	try {
		const data = req.body.data
		const genChartLogId = data.genChartLogId
		const userId = data.userId
		const typeName = data.typeName
		const prompt = data.prompt
		const name = data.name
		const chartFunction = data.chartFunction
		// const layoutRef = data.layoutRef || layoutRefTemplate

		// First, find the user by userId
		const user = await UserServices.findOneUserAndRole(userId)

		if (!user) {
			return res.status(404).json({
				status: 404,
				message: `User with ID ${userId} not found`,
			})
		}

		const chartTypeRecord = await ChartTypeServices.findOneChartType(typeName)
		const layoutRef = data.layout || getLayoutTemplateByChartType(chartTypeRecord.type);

		if (!chartTypeRecord) {
			return res.status(404).json({
				status: 404,
				message: `Chart Type ${typeName} not found`,
			})
		}

		// find genChartLog record
		const genChartLogRecord =
			await GenChartLogServices.findOneGenChartLog(genChartLogId)

		if (!genChartLogRecord) {
			return res.status(404).json({
				status: 404,
				message: 'Chart log not found',
			})
		}


		const typeFunction = chartFunction ? chartFunction : chartTypeRecord.function

		const rawSqlStatement = genChartLogRecord.raw_sql_statement
		const dbName = genChartLogRecord.db_name

		// validate Function string
		const validEvalFunctionString = Utils.validateFunctionString(typeFunction)

		// Use the getDynamicDbConnection function to dynamically select the database connection
		const dbDynamicConn = getDynamicDbConnection(dbName);

		// query rawSqlStatement
		let dataSet =
			await GenChartServices.queryRawSqlStatement(rawSqlStatement, dbDynamicConn)


		if (user.role === MANAGER) {
			const stores = await AdminOutletServices.findStoreByUserId(userId)
			dataSet = dataSet.filter(record => stores.includes(record.name));
		}


		// compile datasource with dynamic function string
		const compiledResult =
			await GenChartServices.dynamicFunctionToCharting(
				dataSet,
				validEvalFunctionString,
				layoutRef
			)

		// Call the GenChart service to insert the new record
		const newRecord = await GenChartServices.createGenChart(
			genChartLogRecord,
			rawSqlStatement,
			userId,
			chartTypeRecord,
			name,
			typeFunction,
			dbName,
			layoutRef
		)

		const responseRecord = {
			id: newRecord.id,
			prompt,
			typeName,
			typeFunction: typeFunction,
			userId: userId,
			compiledResult: compiledResult,
		}


		res.status(200).json({
			status: 200,
			data: responseRecord,
			message: 'Chart created successfully',
		})
	} catch (error) {
		res.status(500).json({
			status: 'error',
			message: `Failed to create chart: ${error.message}`,
		})
	}
}

export const findOneGenChartController = async (req, res) => {
	logger.debug('findOneGenChartController')

	try {
		const id = req.params.id
		const record = await GenChartServices.findOneGenChart(id)

		if (!record) {
			return res.status(404).json({
				status: 404,
				message: 'chart not found',
			})
		}

		res.status(200).send({
			status: 'success',
			data: record,
			message: 'Chart found successfully',
		})
	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}

export const deleteGenChartController = async (req, res) => {
	logger.debug('deleteSmartLayoutController')

	try {
		const id = req.params.id // Assuming the id is passed as a URL parameter

		// First, find the record
		const genChartRecord = await GenChartServices.findOneGenChart(id)

		if (!genChartRecord) {
			return res.status(404).json({
				status: 404,
				message: 'Chart not found',
			})
		}

		// Call the SmartLayout service to delete the record
		const rowDeleted = await GenChartServices.deleteGenChart(id)

		if (rowDeleted === 0) {
			return res.status(404).send({
				status: 404,
				message: `No record found with the specified ID ${id}`,
			})
		}

		res.status(200).json({
			status: 200,
			message: 'Chart deleted successfully',
		})
	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}

export const findAllByUserIdController = async (req, res) => {
	logger.debug('findAllByUserIdController')

	try {
		const userId = req.params.id// Assuming the id is passed as a URL parameter

		// First, find the user by userId
		const user = await UserServices.findOneUserAndRole(userId)

		if (!user) {
			return res.status(404).json({
				status: 404,
				message: `User with ID ${userId} not found`,
			})
		}

		// Call the GenChart service to find all records by userId
		const genCharts = await GenChartServices.findAllByUserId(userId)

		// Check if genCharts is an empty array
		if (genCharts.length === 0) {
			return res.status(200).json({
				status: 200,
				data: [],
				message: 'Loaded successfully',
			})
		}

		const chartFuncErrorMessages = validateGenChartFunctionGroup(genCharts)

		if (chartFuncErrorMessages.length > 0) {
			throw new Error(
				`Validation errors found: ${chartFuncErrorMessages.join(', ')}`
			)
		}

		const responsePayload = []

		for (const genChart of genCharts) {
			const typeFunctionString = genChart.function

			// Execute the function string using eval
			const typeFunction = eval(`(${typeFunctionString})`)
			const rawSqlStatement = genChart.raw_sql_statement
			const dbName = genChart.db_name
			const layoutRef = genChart.layout_ref

			// Use the getDynamicDbConnection function to dynamically select the database connection
			const dbDynamicConn = getDynamicDbConnection(dbName);

			// query rawSqlStatement
			let dataSet =
				await GenChartServices.queryRawSqlStatement(rawSqlStatement, dbDynamicConn)

			if (user.role === MANAGER) {
				const stores = await AdminOutletServices.findStoreByUserId(userId)
				dataSet = dataSet.filter(record => stores.includes(record.name));
			}


			// Compile datasource with dynamic function string
			const compiledResult =
				await GenChartServices.dynamicFunctionToCharting(
					dataSet,
					typeFunction,
					layoutRef
				)

			const eachResult = {
				id: genChart.id,
				prompt: genChart.prompt,
				typeName: genChart.type,
				compiledResult: compiledResult,
			}
			responsePayload.push(eachResult)
		}

		res.status(200).json({
			status: 200,
			data: responsePayload,
			message: 'Loaded successfully',
		})
	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}

export const findAllGenChartEntriesByUserIdController = async (req, res) => {
	logger.debug('findAllGenChartEntriesByUserIdController')
	try {
		const userId = req.params.id

		// First, find the user by userId
		const user = await UserServices.findOneUserAndRole(userId)

		if (!user) {
			return res.status(404).json({
				status: 404,
				message: `User with ID ${userId} not found`,
			})
		}

		// Call the GenChart service to find all records by userId
		const genCharts = await GenChartServices.findAllByUserId(userId)

		res.status(200).json({
			status: 200,
			data: genCharts,
			message: 'Loaded successfully',
		})
	} catch (error) {
		res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}

export const getOneGenChartController = async (req, res) => {
	logger.debug('getOneGenChartController')
	try {
		const id = req.params.id
		const record = await GenChartServices.findOneGenChart(id)
		if (!record) {
			return res.status(404).json({
				status: 404,
				message: 'chart not found',
			})
		}

		const typeFunction = eval(`(${record.function})`)
		const raw_sql_statement = record.raw_sql_statement
		const dbName = record.db_name
		const layoutRef = record.layout_ref

		// Use the getDynamicDbConnection function to dynamically select the database connection
		const dbDynamicConn = getDynamicDbConnection(dbName);

		const compiledSqlStatement = await GenChartServices.queryRawSqlStatement(
			raw_sql_statement,
			dbDynamicConn
		)

		const compiledResult =
			await GenChartServices.dynamicFunctionToCharting(
				compiledSqlStatement,
				typeFunction,
				layoutRef
			)

		return res.status(200).json({
			id: record.id,
			prompt: record.prompt,
			typeName: record.type,
			compiledResult: compiledResult,
		})
	} catch (error) {
		return res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}

export const updateGenChartController = async (req, res) => {
	logger.debug('updateGenChartController')
	try {
		const genChartId = req.params.id
		const data = req.body.data
		const layoutUpdate = data.layout
		const userId = data.userId

		// First, find the user by userId
		const user = await UserServices.findOneUserAndRole(userId)
		if (!user) {
			return res.status(404).json({
				status: 404,
				message: `User with ID ${userId} not found`,
			})
		}


		// First, find the genChart record by id
		const genChartRecord = await GenChartServices.findOneGenChart(genChartId);

		if (!genChartRecord) {
			return res.status(404).json({
				status: 404,
				message: `Chart with ID ${genChartId} not found`,
			});
		}

		const updatedRecord = await GenChartServices.updateGenChart(
			genChartId,
			layoutUpdate
		);


		const typeFunction = updatedRecord.function
		const dbName = updatedRecord.db_name
		const rawSqlStatement = updatedRecord.raw_sql_statement
		const layoutRef = updatedRecord.layout_ref


		// validate Function string
		const validEvalFunctionString = Utils.validateFunctionString(typeFunction)

		// Use the getDynamicDbConnection function to dynamically select the database connection
		const dbDynamicConn = getDynamicDbConnection(dbName);

		// query rawSqlStatement
		let dataSet =
			await GenChartServices.queryRawSqlStatement(rawSqlStatement, dbDynamicConn)


		if (user.role === MANAGER) {
			const stores = await AdminOutletServices.findStoreByUserId(userId)
			dataSet = dataSet.filter(record => stores.includes(record.name));
		}

		// compile data source with dynamic function string
		const compiledResult =
			await GenChartServices.dynamicFunctionToCharting(
				dataSet,
				validEvalFunctionString,
				layoutRef
			)


		res.status(200).json({
			status: 200,
			data: compiledResult,
			message: 'Chart created successfully',
		})

	} catch (error) {
		return res.status(500).send({
			status: 'error',
			message: error.message,
		})
	}
}