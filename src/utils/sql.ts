import { BadRequestError } from '../utils/expressError';

/**
 * Helper for making selective update queries.
 * 
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 * 
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 * @param jsToSql {Object} maps js-style data fields to database column names
 *
 * @returns {Object} { sqlSetCols, values }
 * 
 * @example { recipeName: 'Quinoa', cookingTime: 32 }, { recipeName: "recipe_name", cookingTime: "cooking_time"} =>
 *   { setCols: `"recipe_name"=$1, "cooking_time"=$2`, values: ['Quinoa', 32] }
 */
function sqlForPartialUpdate(
  dataToUpdate: Record<string, string | number>,
  jsToSql: Record<string, string>
): object {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError('No data');

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(', '),
    values: Object.values(dataToUpdate),
  };
}

export { sqlForPartialUpdate };