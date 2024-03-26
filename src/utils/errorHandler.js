import logger from '../lib/logger.js'

export const handleError = (error, source) => {
  logger.error(`Error in ${source}:`, error.message);

  // const errorCode = error.code || (error.cause && error.cause.code);
  // if (errorCode) {
  //   logger.error(`Error-Code in ${source}:`, errorCode);
  // } else {
  //
  // }
  logger.error(`Full-Error in ${source}:`, error);
}

