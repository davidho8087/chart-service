export const mockSQLStatement = {
  rawSqlStatement: `
SELECT store_code AS name, COUNT(*) AS count FROM cameras
GROUP BY store_code
  `,
  dbName:'health_monitoring_health_dior_db'
}
