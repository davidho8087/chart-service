import { handleError } from './errorHandler.js'

export const validateFunctionString = (typeFunctionString) => {
  // Check if typeFunctionString is a string
  if (typeof typeFunctionString !== 'string') {
    const error = new Error('typeFunctionString must be a string')
    handleError(error, 'validateAndConvertFunctionString')
    throw error
  }

  try {
    const typeFunction = eval(`(${typeFunctionString})`)
    if (typeof typeFunction !== 'function') {
      throw new Error('Evaluated expression is not a function')
    }
    return typeFunction
  } catch (error) {
    handleError(error, 'Error parsing typeFunction string')
    throw error
  }
}

export const validateGenChartFunctionGroup = (genCharts) => {
  let errorMessages = []

  genCharts.forEach(genChart => {
    const typeFunction = genChart.function
    const isValidFunction = validateFunctionString(typeFunction)

    // Accumulate errors if the function string is not valid
    if (!isValidFunction) {
      errorMessages.push(`Invalid function string in chart with ID ${genChart.id}`)  // Assuming genChart has an 'id' property
    }
  })

  return errorMessages
}
