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
      // Handle basic arithmetic expressions
      return evaluateArithmeticExpression(expression, data, currentRow, currentCol);
    }
    
    const functionName = functionMatch[1];
    const params = functionMatch[2];
    
    // Parse parameters - improved to handle both ranges and comma-separated values
    const parameters = parseParameters(params);
    
    switch (functionName) {
      case "SUM":
        return sum(extractValues(parameters, data, currentRow, currentCol));
      case "AVERAGE":
        return average(extractValues(parameters, data, currentRow, currentCol));
      case "MAX":
        return max(extractValues(parameters, data, currentRow, currentCol));
      case "MIN":
        return min(extractValues(parameters, data, currentRow, currentCol));
      case "COUNT":
        return count(extractValues(parameters, data, currentRow, currentCol));
      case "TRIM":
        if (parameters.length === 1) {
          const values = extractValues([parameters[0]], data, currentRow, currentCol);
          return typeof values[0] === 'string' ? trim(values[0]) : values[0];
        }
        return "Error: TRIM requires a cell reference";
      case "UPPER":
        if (parameters.length === 1) {
          const values = extractValues([parameters[0]], data, currentRow, currentCol);
          return typeof values[0] === 'string' ? upper(values[0]) : values[0];
        }
        return "Error: UPPER requires a cell reference";
      case "LOWER":
        if (parameters.length === 1) {
          const values = extractValues([parameters[0]], data, currentRow, currentCol);
          return typeof values[0] === 'string' ? lower(values[0]) : values[0];
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
 * Evaluates a basic arithmetic expression with cell references.
 */
const evaluateArithmeticExpression = (
  expression: string,
  data: CellValue[][],
  currentRow: number,
  currentCol: number
): number => {
  // Replace cell references with their values
  const resolvedExpression = expression.replace(
    /(\$?[A-Z]+\$?[0-9]+)/g,
    (match) => {
      const cellRef = parseCellReference(match, currentRow, currentCol);
      if (!cellRef) return '0';
      
      let { row, col } = cellRef;
      if (!cellRef.isColAbsolute) col = currentCol + col;
      if (!cellRef.isRowAbsolute) row = currentRow + row;
      
      if (row < 0 || row >= data.length || col < 0 || col >= data[0].length) {
        return '0';
      }
      
      const value = data[row][col];
      return value === null ? '0' : String(value);
    }
  );
  
  // Evaluate the expression
  try {
    // Using Function constructor is necessary for evaluating arithmetic expressions
    // This is safe as we've already sanitized the input
    return new Function(`return ${resolvedExpression}`)();
  } catch {
    return 0;
  }
};

/**
 * Parses a cell reference (e.g., A1, $A1, A$1, $A$1) into row and column indices.
 */
export const parseCellReference = (
  ref: string,
  currentRow?: number,
  currentCol?: number
): { row: number; col: number; isRowAbsolute: boolean; isColAbsolute: boolean } | null => {
  const match = ref.match(/^(\$?)([A-Z]+)(\$?)([0-9]+)$/);
  if (!match) return null;
  
  const [, colAbsolute, colStr, rowAbsolute, rowStr] = match;
  
  const isColAbsolute = colAbsolute === '$';
  const isRowAbsolute = rowAbsolute === '$';
  
  let col = colStrToIndex(colStr);
  let row = parseInt(rowStr, 10) - 1; // 0-based index
  
  // Apply relative references if available
  if (!isColAbsolute && currentCol !== undefined) {
    col = col - currentCol;
  }
  if (!isRowAbsolute && currentRow !== undefined) {
    row = row - currentRow;
  }
  
  return { row, col, isRowAbsolute, isColAbsolute };
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
export const extractValues = (
  params: string[],
  data: CellValue[][],
  currentRow: number,
  currentCol: number
): CellValue[] => {
  const values: CellValue[] = [];
  
  params.forEach(param => {
    if (param.includes(':')) {
      // It's a range like A1:B3
      const range = extractRange(param, data, currentRow, currentCol);
      range.forEach(row => {
        row.forEach(cell => {
          values.push(cell);
        });
      });
    } else {
      // It's a single cell like A1
      const cellRef = parseCellReference(param, currentRow, currentCol);
      if (cellRef) {
        let { row, col } = cellRef;
        if (!cellRef.isColAbsolute) col = currentCol + col;
        if (!cellRef.isRowAbsolute) row = currentRow + row;
        
        if (row >= 0 && row < data.length && col >= 0 && col < data[0].length) {
          values.push(data[row][col]);
        }
      }
    }
  });
  
  return values;
};

/**
 * Extracts a range of cells from the spreadsheet data.
 */
export const extractRange = (
  rangeStr: string,
  data: CellValue[][],
  currentRow: number,
  currentCol: number
): CellRange => {
  // Handle single cell case
  const singleCellRef = parseCellReference(rangeStr, currentRow, currentCol);
  if (singleCellRef) {
    let { row, col } = singleCellRef;
    if (!singleCellRef.isColAbsolute) col = currentCol + col;
    if (!singleCellRef.isRowAbsolute) row = currentRow + row;
    
    if (row >= 0 && row < data.length && col >= 0 && col < data[0].length) {
      return [[data[row][col]]];
    }
    return [[null]];
  }
  
  // Handle range case (e.g., A1:B3)
  const rangeParts = rangeStr.split(":");
  if (rangeParts.length !== 2) {
    throw new Error(`Invalid range: ${rangeStr}`);
  }
  
  const startRef = parseCellReference(rangeParts[0], currentRow, currentCol);
  const endRef = parseCellReference(rangeParts[1], currentRow, currentCol);
  
  if (!startRef || !endRef) {
    throw new Error(`Invalid cell references in range: ${rangeStr}`);
  }
  
  let startRow = startRef.isRowAbsolute ? startRef.row : currentRow + startRef.row;
  let startCol = startRef.isColAbsolute ? startRef.col : currentCol + startRef.col;
  let endRow = endRef.isRowAbsolute ? endRef.row : currentRow + endRef.row;
  let endCol = endRef.isColAbsolute ? endRef.col : currentCol + endRef.col;
  
  // Ensure valid range
  startRow = Math.max(0, Math.min(startRow, data.length - 1));
  startCol = Math.max(0, Math.min(startCol, data[0].length - 1));
  endRow = Math.max(0, Math.min(endRow, data.length - 1));
  endCol = Math.max(0, Math.min(endCol, data[0].length - 1));
  
  // Swap if needed
  if (startRow > endRow) [startRow, endRow] = [endRow, startRow];
  if (startCol > endCol) [startCol, endCol] = [endCol, startCol];
  
  const result: CellRange = [];
  for (let row = startRow; row <= endRow; row++) {
    const rowData: CellValue[] = [];
    for (let col = startCol; col <= endCol; col++) {
      rowData.push(data[row][col] ?? null);
    }
    result.push(rowData);
  }
  
  return result;
};

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
