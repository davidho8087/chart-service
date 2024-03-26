import { Router } from 'express'
import { handleInputErrors } from './middlewares.js'
import { findAllChartTypeController } from './routes/chartType/controllers.js'
import * as dashboardController from './routes/dashboard/controllers.js'
import {
  createGenChartController,
  deleteGenChartController,
  findAllByUserIdController,
  findAllGenChartEntriesByUserIdController,
  findOneGenChartController,
  getOneGenChartController,
  updateGenChartController,
} from './routes/genChart/controllers.js'
import {
  createGenChartLogController,
  deleteGenChartLogController,
  findAllGenChartLogController,
  findOneGenChartLogController,
  findStoreCodeByUserIdController
} from './routes/genChartLog/controllers.js'
import {
  genChartLogCreateSchema,
  genChartCreateSchema,
  idParamSchema, genChartUpdateSchema,
} from './utils/inputValidation.js'

const router = Router()

// chartType
router.get('/chartType/findAll', findAllChartTypeController)

// genChart
router.post(
  '/genChart/create',
  ...genChartCreateSchema,
  handleInputErrors,
  createGenChartController
)
router.put(
  '/genChart/update/:id',
  ...idParamSchema,
  ...genChartUpdateSchema,
  handleInputErrors,
  updateGenChartController
)

router.get(
  '/genChart/findAllByUserId/:id',
  ...idParamSchema,
  handleInputErrors,
  findAllByUserIdController
)
router.get(
  '/genChart/findAllEntryByUserId/:id',
  ...idParamSchema,
  handleInputErrors,
  findAllGenChartEntriesByUserIdController
)
router.get(
  '/genChart/findOne/:id',
  ...idParamSchema,
  handleInputErrors,
  findOneGenChartController
)
router.get(
  '/genChart/getOne/:id',
  ...idParamSchema,
  handleInputErrors,
  getOneGenChartController
)
router.delete(
  '/genChart/delete/:id',
  ...idParamSchema,
  handleInputErrors,
  deleteGenChartController
)

// genChartLog
router.post(
  '/genChartLog/create',
  ...genChartLogCreateSchema,
  handleInputErrors,
  createGenChartLogController
)
router.get('/genChartLog/findAll', findAllGenChartLogController)
router.get(
  '/genChartLog/findOne/:id',
  ...idParamSchema,
  handleInputErrors,
  findOneGenChartLogController
)

router.delete(
  '/genChartLog/delete/:id',
  ...idParamSchema,
  handleInputErrors,
  deleteGenChartLogController
)

router.get(
  '/genChartLog/findStoreCodeByUserId/:id',
  handleInputErrors,
  findStoreCodeByUserIdController
)

router
  .get('/dashboard/:id', dashboardController.findOneByUserId)
  .get('/dashboards/:id', dashboardController.findAllByUserId)
  .put('/dashboard/:id', dashboardController.update)
  .post('/dashboard', dashboardController.create)
  .delete('/dashboard/:id', dashboardController.remove)

export default router
