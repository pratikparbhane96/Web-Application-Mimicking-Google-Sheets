
import { indexToColStr } from './formulaUtils';

export type CellData = {
  value: string | number | null;
  formula?: string;
  format?: CellFormat;
};

export type CellFormat = {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bgColor?: string;
  fontSize?: number;
};

export type SpreadsheetData = {
  cells: { [key: string]: CellData };
  columnWidths: { [key: number]: number };
  rowHeights: { [key: number]: number };
  numRows: number;
  numCols: number;
};

/**
 * Initializes an empty spreadsheet with default dimensions.
 */
export const createEmptySpreadsheet = (rows = 100, cols = 26): SpreadsheetData => {
  return {
    cells: {},
    columnWidths: {},
    rowHeights: {},
    numRows: rows,
    numCols: cols,
  };
};

/**
 * Generates a cell key from row and column indices.
 */
export const getCellKey = (row: number, col: number): string => {
  return `${row},${col}`;
};

/**
 * Gets the cell at the specified coordinates.
 */
export const getCell = (data: SpreadsheetData, row: number, col: number): CellData => {
  const key = getCellKey(row, col);
  return data.cells[key] || { value: null };
};

/**
 * Sets a cell's value and optional formula.
 */
export const setCell = (
  data: SpreadsheetData,
  row: number,
  col: number,
  value: string | number | null,
  formula?: string
): SpreadsheetData => {
  const key = getCellKey(row, col);
  
  return {
    ...data,
    cells: {
      ...data.cells,
      [key]: {
        ...data.cells[key],
        value,
        formula,
      },
    },
  };
};

/**
 * Updates a cell's formatting.
 */
export const setCellFormat = (
  data: SpreadsheetData,
  row: number,
  col: number,
  format: CellFormat
): SpreadsheetData => {
  const key = getCellKey(row, col);
  
  return {
    ...data,
    cells: {
      ...data.cells,
      [key]: {
        ...data.cells[key],
        format: {
          ...data.cells[key]?.format,
          ...format,
        },
      },
    },
  };
};

/**
 * Sets the width of a column.
 */
export const setColumnWidth = (
  data: SpreadsheetData,
  col: number,
  width: number
): SpreadsheetData => {
  return {
    ...data,
    columnWidths: {
      ...data.columnWidths,
      [col]: width,
    },
  };
};

/**
 * Sets the height of a row.
 */
export const setRowHeight = (
  data: SpreadsheetData,
  row: number,
  height: number
): SpreadsheetData => {
  return {
    ...data,
    rowHeights: {
      ...data.rowHeights,
      [row]: height,
    },
  };
};

/**
 * Adds a new row at the specified index.
 */
export const addRow = (data: SpreadsheetData, atIndex: number): SpreadsheetData => {
  const newCells = { ...data.cells };
  
  // Shift all rows below the insertion point
  Object.keys(newCells).forEach(key => {
    const [row, col] = key.split(',').map(Number);
    if (row >= atIndex) {
      const newKey = getCellKey(row + 1, col);
      newCells[newKey] = newCells[key];
      delete newCells[key];
    }
  });
  
  // Shift row heights
  const newRowHeights = { ...data.rowHeights };
  for (let i = data.numRows; i > atIndex; i--) {
    newRowHeights[i] = newRowHeights[i - 1];
  }
  delete newRowHeights[atIndex];
  
  return {
    ...data,
    cells: newCells,
    rowHeights: newRowHeights,
    numRows: data.numRows + 1,
  };
};

/**
 * Adds a new column at the specified index.
 */
export const addColumn = (data: SpreadsheetData, atIndex: number): SpreadsheetData => {
  const newCells = { ...data.cells };
  
  // Shift all columns to the right of the insertion point
  Object.keys(newCells).forEach(key => {
    const [row, col] = key.split(',').map(Number);
    if (col >= atIndex) {
      const newKey = getCellKey(row, col + 1);
      newCells[newKey] = newCells[key];
      delete newCells[key];
    }
  });
  
  // Shift column widths
  const newColumnWidths = { ...data.columnWidths };
  for (let i = data.numCols; i > atIndex; i--) {
    newColumnWidths[i] = newColumnWidths[i - 1];
  }
  delete newColumnWidths[atIndex];
  
  return {
    ...data,
    cells: newCells,
    columnWidths: newColumnWidths,
    numCols: data.numCols + 1,
  };
};

/**
 * Deletes the row at the specified index.
 */
export const deleteRow = (data: SpreadsheetData, atIndex: number): SpreadsheetData => {
  const newCells = { ...data.cells };
  
  // Remove the row
  Object.keys(newCells).forEach(key => {
    const [row, col] = key.split(',').map(Number);
    if (row === atIndex) {
      delete newCells[key];
    } else if (row > atIndex) {
      const newKey = getCellKey(row - 1, col);
      newCells[newKey] = newCells[key];
      delete newCells[key];
    }
  });
  
  // Shift row heights
  const newRowHeights = { ...data.rowHeights };
  delete newRowHeights[atIndex];
  for (let i = atIndex + 1; i < data.numRows; i++) {
    newRowHeights[i - 1] = newRowHeights[i];
  }
  delete newRowHeights[data.numRows - 1];
  
  return {
    ...data,
    cells: newCells,
    rowHeights: newRowHeights,
    numRows: data.numRows - 1,
  };
};

/**
 * Deletes the column at the specified index.
 */
export const deleteColumn = (data: SpreadsheetData, atIndex: number): SpreadsheetData => {
  const newCells = { ...data.cells };
  
  // Remove the column
  Object.keys(newCells).forEach(key => {
    const [row, col] = key.split(',').map(Number);
    if (col === atIndex) {
      delete newCells[key];
    } else if (col > atIndex) {
      const newKey = getCellKey(row, col - 1);
      newCells[newKey] = newCells[key];
      delete newCells[key];
    }
  });
  
  // Shift column widths
  const newColumnWidths = { ...data.columnWidths };
  delete newColumnWidths[atIndex];
  for (let i = atIndex + 1; i < data.numCols; i++) {
    newColumnWidths[i - 1] = newColumnWidths[i];
  }
  delete newColumnWidths[data.numCols - 1];
  
  return {
    ...data,
    cells: newCells,
    columnWidths: newColumnWidths,
    numCols: data.numCols - 1,
  };
};

/**
 * Converts the array of cells to a 2D array for formula evaluation.
 */
export const getCellsAs2DArray = (data: SpreadsheetData): (string | number | null)[][] => {
  const result: (string | number | null)[][] = Array(data.numRows)
    .fill(null)
    .map(() => Array(data.numCols).fill(null));
  
  Object.keys(data.cells).forEach(key => {
    const [row, col] = key.split(',').map(Number);
    if (row < data.numRows && col < data.numCols) {
      result[row][col] = data.cells[key].value;
    }
  });
  
  return result;
};

/**
 * Gets the display value for a cell (applying functions etc.)
 */
export const getCellDisplayValue = (cell: CellData): string => {
  if (cell.value === null) return '';
  return String(cell.value);
};

/**
 * Generates column headers (A, B, C, etc.)
 */
export const generateColumnHeaders = (numCols: number): string[] => {
  return Array(numCols)
    .fill(0)
    .map((_, index) => indexToColStr(index));
};

/**
 * Generates row headers (1, 2, 3, etc.)
 */
export const generateRowHeaders = (numRows: number): number[] => {
  return Array(numRows)
    .fill(0)
    .map((_, index) => index + 1);
};
