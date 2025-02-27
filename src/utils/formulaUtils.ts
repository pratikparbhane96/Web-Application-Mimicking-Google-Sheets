
type CellValue = string | number | null;
type CellRange = CellValue[][];

/**
 * Evaluates a formula based on the given spreadsheet data.
 */
export const evaluateFormula = (
  formula: string,
  data: CellValue[][],
  currentRow: number,
  currentCol: number
): CellValue => {
  if (!formula.startsWith("=")) {
    return formula;
  }
  
  try {
    const expression = formula.substring(1).toUpperCase();
    const functionMatch = expression.match(/^([A-Z_]+)\((.*)\)$/);
    
    if (!functionMatch) {
      // Basic arithmetic expressions or cell references will be handled later
      return "Error: Only functions are supported currently";
    }
    
    const functionName = functionMatch[1];
    const params = functionMatch[2];
    
    // Parse parameters - improved to handle both ranges and comma-separated values
    const parameters = parseParameters(params);
    
    switch (functionName) {
      case "SUM":
        return sum(extractValues(parameters, data));
      case "AVERAGE":
        return average(extractValues(parameters, data));
      case "MAX":
        return max(extractValues(parameters, data));
      case "MIN":
        return min(extractValues(parameters, data));
      case "COUNT":
        return count(extractValues(parameters, data));
      case "TRIM":
        if (parameters.length === 1) {
          const cellRef = parseCellReference(parameters[0]);
          if (cellRef) {
            const value = data[cellRef.row][cellRef.col];
            return typeof value === 'string' ? trim(value) : value;
          }
        }
        return "Error: TRIM requires a cell reference";
      case "UPPER":
        if (parameters.length === 1) {
          const cellRef = parseCellReference(parameters[0]);
          if (cellRef) {
            const value = data[cellRef.row][cellRef.col];
            return typeof value === 'string' ? upper(value) : value;
          }
        }
        return "Error: UPPER requires a cell reference";
      case "LOWER":
        if (parameters.length === 1) {
          const cellRef = parseCellReference(parameters[0]);
          if (cellRef) {
            const value = data[cellRef.row][cellRef.col];
            return typeof value === 'string' ? lower(value) : value;
          }
        }
        return "Error: LOWER requires a cell reference";
      default:
        return `Error: Unknown function ${functionName}`;
    }
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return "Error: Formula evaluation failed";
  }
};

/**
 * Parses a comma-separated parameter list and handles nested parentheses.
 */
export const parseParameters = (paramStr: string): string[] => {
  const params: string[] = [];
  let currentParam = '';
  let parenCount = 0;
  
  for (let i = 0; i < paramStr.length; i++) {
    const char = paramStr[i];
    
    if (char === '(') {
      parenCount++;
      currentParam += char;
    } else if (char === ')') {
      parenCount--;
      currentParam += char;
    } else if (char === ',' && parenCount === 0) {
      params.push(currentParam.trim());
      currentParam = '';
    } else {
      currentParam += char;
    }
  }
  
  if (currentParam.trim() !== '') {
    params.push(currentParam.trim());
  }
  
  return params;
};

/**
 * Extracts values from comma-separated parameters that can be either ranges or single cells.
 */
export const extractValues = (params: string[], data: CellValue[][]): CellValue[] => {
  const values: CellValue[] = [];
  
  params.forEach(param => {
    if (param.includes(':')) {
      // It's a range like A1:B3
      const range = extractRange(param, data);
      range.forEach(row => {
        row.forEach(cell => {
          values.push(cell);
        });
      });
    } else {
      // It's a single cell like A1
      const cellRef = parseCellReference(param);
      if (cellRef && data[cellRef.row] && data[cellRef.row][cellRef.col] !== undefined) {
        values.push(data[cellRef.row][cellRef.col]);
      }
    }
  });
  
  return values;
};

/**
 * Parses a cell reference (e.g., A1) into row and column indices.
 */
export const parseCellReference = (
  ref: string
): { row: number; col: number } | null => {
  const match = ref.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return null;
  
  const colStr = match[1];
  const rowStr = match[2];
  
  const col = colStrToIndex(colStr);
  const row = parseInt(rowStr, 10) - 1; // 0-based index
  
  return { row, col };
};

/**
 * Converts a column string (e.g., A, B, AA) to a column index.
 */
export const colStrToIndex = (colStr: string): number => {
  let result = 0;
  for (let i = 0; i < colStr.length; i++) {
    result = result * 26 + (colStr.charCodeAt(i) - 64);
  }
  return result - 1; // 0-based index
};

/**
 * Converts a column index to a column string (e.g., 0 -> A, 25 -> Z, 26 -> AA).
 */
export const indexToColStr = (index: number): string => {
  let temp = index + 1;
  let result = "";
  
  while (temp > 0) {
    const remainder = (temp - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    temp = Math.floor((temp - remainder) / 26);
  }
  
  return result;
};

/**
 * Extracts a range of cells from the spreadsheet data.
 */
export const extractRange = (rangeStr: string, data: CellValue[][]): CellRange => {
  // Handle single cell case
  const singleCellRef = parseCellReference(rangeStr);
  if (singleCellRef) {
    return [[data[singleCellRef.row][singleCellRef.col]]];
  }
  
  // Handle range case (e.g., A1:B3)
  const rangeParts = rangeStr.split(":");
  if (rangeParts.length !== 2) {
    throw new Error(`Invalid range: ${rangeStr}`);
  }
  
  const startRef = parseCellReference(rangeParts[0]);
  const endRef = parseCellReference(rangeParts[1]);
  
  if (!startRef || !endRef) {
    throw new Error(`Invalid cell references in range: ${rangeStr}`);
  }
  
  const result: CellRange = [];
  
  for (let row = startRef.row; row <= endRef.row; row++) {
    const rowData: CellValue[] = [];
    for (let col = startRef.col; col <= endRef.col; col++) {
      if (data[row] && data[row][col] !== undefined) {
        rowData.push(data[row][col]);
      } else {
        rowData.push(null);
      }
    }
    result.push(rowData);
  }
  
  return result;
};

// Mathematical functions

/**
 * Calculates the sum of values in a range.
 */
export const sum = (values: CellValue[]): number => {
  let total = 0;
  values.forEach(cell => {
    if (typeof cell === 'number') {
      total += cell;
    } else if (typeof cell === 'string') {
      const num = parseFloat(cell);
      if (!isNaN(num)) {
        total += num;
      }
    }
  });
  return total;
};

/**
 * Calculates the average of values in a range.
 */
export const average = (values: CellValue[]): number => {
  const total = sum(values);
  const count = countNumbers(values);
  return count > 0 ? total / count : 0;
};

/**
 * Finds the maximum value in a range.
 */
export const max = (values: CellValue[]): number => {
  let maxVal = Number.NEGATIVE_INFINITY;
  let found = false;
  
  values.forEach(cell => {
    if (typeof cell === 'number') {
      maxVal = Math.max(maxVal, cell);
      found = true;
    } else if (typeof cell === 'string') {
      const num = parseFloat(cell);
      if (!isNaN(num)) {
        maxVal = Math.max(maxVal, num);
        found = true;
      }
    }
  });
  
  return found ? maxVal : 0;
};

/**
 * Finds the minimum value in a range.
 */
export const min = (values: CellValue[]): number => {
  let minVal = Number.POSITIVE_INFINITY;
  let found = false;
  
  values.forEach(cell => {
    if (typeof cell === 'number') {
      minVal = Math.min(minVal, cell);
      found = true;
    } else if (typeof cell === 'string') {
      const num = parseFloat(cell);
      if (!isNaN(num)) {
        minVal = Math.min(minVal, num);
        found = true;
      }
    }
  });
  
  return found ? minVal : 0;
};

/**
 * Counts numeric values in a range.
 */
export const count = (values: CellValue[]): number => {
  return countNumbers(values);
};

/**
 * Helper to count the number of numeric cells in a range.
 */
const countNumbers = (values: CellValue[]): number => {
  let count = 0;
  
  values.forEach(cell => {
    if (typeof cell === 'number' || (typeof cell === 'string' && !isNaN(parseFloat(cell)))) {
      count++;
    }
  });
  
  return count;
};

// Data quality functions

/**
 * Removes leading and trailing whitespace from a string.
 */
export const trim = (value: string): string => {
  return value.trim();
};

/**
 * Converts a string to uppercase.
 */
export const upper = (value: string): string => {
  return value.toUpperCase();
};

/**
 * Converts a string to lowercase.
 */
export const lower = (value: string): string => {
  return value.toLowerCase();
};

/**
 * Removes duplicate rows from a range.
 */
export const removeDuplicates = (range: CellRange): CellRange => {
  // Create a string representation of each row for comparison
  const seen = new Set<string>();
  const result: CellRange = [];
  
  range.forEach(row => {
    const rowStr = JSON.stringify(row);
    if (!seen.has(rowStr)) {
      seen.add(rowStr);
      result.push([...row]);
    }
  });
  
  return result;
};

/**
 * Finds and replaces text in a range.
 */
export const findAndReplace = (
  range: CellRange,
  findText: string,
  replaceText: string
): CellRange => {
  return range.map(row => {
    return row.map(cell => {
      if (typeof cell === 'string') {
        return cell.replace(new RegExp(findText, 'g'), replaceText);
      }
      return cell;
    });
  });
};
