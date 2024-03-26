import { checkSchema } from 'express-validator'

export const genChartCreateSchema = checkSchema({
  'data.prompt': {
    in: ['body'],
    errorMessage: 'Prompt is required',
    isString: {
      errorMessage: 'Prompt must be a string',
    },
    notEmpty: {
      errorMessage: 'Prompt cannot be empty',
    },
    escape: {
      errorMessage: 'Prompt must not include HTML characters',
    },
  },
  'data.typeName': {
    in: ['body'],
    errorMessage: 'Type name is required',
    isString: {
      errorMessage: 'Type name must be a string',
    },
    notEmpty: {
      errorMessage: 'Type name cannot be empty',
    },
    escape: {
      errorMessage: 'Type name must not include HTML characters',
    },
  },
  'data.genChartLogId': {
    in: ['body'],
    errorMessage: 'Type is required',
    notEmpty: {
      errorMessage: 'genChartLogId cannot be empty',
    },
    custom: {
      options: (value) => {
        if (typeof value !== 'number') {
          throw new Error('genChartLogId must be a number, not a string')
        }
        return true
      },
    },
    escape: {
      errorMessage: 'genChartLogId must not include HTML characters',
    },
  },
  'data.userId': {
    in: ['body'],
    errorMessage: 'userId is required',
    notEmpty: {
      errorMessage: 'userId cannot be empty',
    },
    escape: {
      errorMessage: 'userId must not include HTML characters',
    },
  },
})

export const genChartLogCreateSchema = checkSchema({
  'data.prompt': {
    in: ['body'],
    errorMessage: 'Prompt is required',
    isString: {
      errorMessage: 'Prompt must be a string',
    },
    notEmpty: {
      errorMessage: 'Prompt cannot be empty',
    },
    escape: {
      errorMessage: 'Prompt must not include HTML characters',
    },
  },
  'data.typeName': {
    in: ['body'],
    errorMessage: 'Type name is required',
    isString: {
      errorMessage: 'Type name must be a string',
    },
    notEmpty: {
      errorMessage: 'Type cannot be empty',
    },
    escape: {
      errorMessage: 'Type name must not include HTML characters',
    },
  },
  'data.userId': {
    in: ['body'],
    errorMessage: 'userId is required',
    notEmpty: {
      errorMessage: 'userId cannot be empty',
    },
    escape: {
      errorMessage: 'userId must not include HTML characters',
    },
  },
})

export const genChartUpdateSchema = checkSchema({
  'data.layout': {
    in: ['body'],
    errorMessage: 'Layout is required',
    // isString: {
    //   errorMessage: 'Layout must be a string',
    // },
    notEmpty: {
      errorMessage: 'Layout cannot be empty',
    },
    // escape: {
    //   errorMessage: 'Layout must not include HTML characters',
    // },
  },
  'data.userId': {
    in: ['body'],
    errorMessage: 'userId is required',
    notEmpty: {
      errorMessage: 'userId cannot be empty',
    },
    escape: {
      errorMessage: 'userId must not include HTML characters',
    },
  },
})

export const idParamSchema = checkSchema({
  id: {
    in: ['params'],
    errorMessage: 'ID must be an integer',
    isInt: {
      errorMessage: 'ID must be an integer',
      options: { min: 1 },
    },
  },
})
