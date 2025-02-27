import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Cell from './Cell';
import FormulaBar from './FormulaBar';
import Toolbar from './Toolbar';
import {
  SpreadsheetData,
  CellData,
  CellFormat,
  createEmptySpreadsheet,
  getCell,
  setCell,
  setCellFormat,
  addRow,
  addColumn,
  deleteRow,
  deleteColumn,
  getCellsAs2DArray,
  generateColumnHeaders,
  generateRowHeaders,
  getCellKey,
} from '../utils/spreadsheetUtils';
import { evaluateFormula } from '../utils/formulaUtils';
import { useToast } from '../hooks/use-toast';

const DEFAULT_COLUMN_WIDTH = 64;
const DEFAULT_ROW_HEIGHT = 24;
const MIN_ROWS = 50;
const MIN_COLS = 26;

const Spreadsheet = forwardRef<any, {}>((props, ref) => {
  
  const [data, setData] = useState<SpreadsheetData>(
    createEmptySpreadsheet(MIN_ROWS, MIN_COLS)
  );
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [formulaValue, setFormulaValue] = useState('');
  const [currentFormat, setCurrentFormat] = useState<CellFormat>({});
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [resizingCol, setResizingCol] = useState<number | null>(null);
  
  const gridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const columnHeaders = generateColumnHeaders(data.numCols);
  const rowHeaders = generateRowHeaders(data.numRows);
  
  // Expose methods for parent components
  useImperativeHandle(ref, () => ({
    getSpreadsheetData: () => data,
    loadSpreadsheetData: (newData: SpreadsheetData) => {
      setData(newData);
      setSelectedCell(null);
      setEditingCell(null);
      setFormulaValue('');
      setCurrentFormat({});
    }
  }));
  
  // Update formula bar value when selected cell changes
  useEffect(() => {
    if (selectedCell) {
      const cell = getCell(data, selectedCell.row, selectedCell.col);
      setFormulaValue(cell.formula || cell.value === null ? '' : String(cell.value));
      setCurrentFormat(cell.format || {});
    }
  }, [selectedCell, data]);
  
  const handleSelectCell = (row: number, col: number) => {
    setSelectedCell({ row, col });
    
    // If we're already editing a different cell, commit those changes first
    if (editingCell && (editingCell.row !== row || editingCell.col !== col)) {
      commitCellEdit();
    }
  };
  
  const handleDoubleClickCell = () => {
    if (selectedCell) {
      setEditingCell(selectedCell);
    }
  };
  
  const handleCellChange = (value: string) => {
    if (editingCell) {
      const isFormula = value.startsWith('=');
      
      const newData = setCell(
        data,
        editingCell.row,
        editingCell.col,
        value,
        isFormula ? value : undefined
      );
      
      setData(newData);
      
      // If it's a formula, we'll evaluate it after committing
      if (!isFormula) {
        evaluateCell(newData, editingCell.row, editingCell.col);
      }
    }
  };
  
  const handleFormulaChange = (value: string) => {
    setFormulaValue(value);
  };
  
  const handleFormulaSubmit = () => {
    if (selectedCell) {
      const isFormula = formulaValue.startsWith('=');
      
      const newData = setCell(
        data,
        selectedCell.row,
        selectedCell.col,
        formulaValue,
        isFormula ? formulaValue : undefined
      );
      
      setData(newData);
      
      if (isFormula) {
        evaluateCell(newData, selectedCell.row, selectedCell.col);
      }
    }
  };
  
  const evaluateCell = (spreadsheetData: SpreadsheetData, row: number, col: number) => {
    const cell = getCell(spreadsheetData, row, col);
    
    if (cell.formula) {
      try {
        const cellsArray = getCellsAs2DArray(spreadsheetData);
        const result = evaluateFormula(cell.formula, cellsArray, row, col);
        
        const updatedData = setCell(
          spreadsheetData,
          row,
          col,
          result,
          cell.formula
        );
        
        setData(updatedData);
      } catch (error) {
        console.error('Error evaluating formula:', error);
        toast({
          title: 'Formula Error',
          description: `Error evaluating formula in cell ${columnHeaders[col]}${row + 1}`,
          variant: 'destructive',
        });
      }
    }
  };
  
  const commitCellEdit = () => {
    if (editingCell) {
      // If it's a formula, evaluate it now
      const cell = getCell(data, editingCell.row, editingCell.col);
      if (cell.formula) {
        evaluateCell(data, editingCell.row, editingCell.col);
      }
      
      setEditingCell(null);
    }
  };
  
  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (editingCell) {
        commitCellEdit();
      } else {
        setEditingCell(selectedCell);
      }
      
      // Move to the cell below
      if (row < data.numRows - 1) {
        setSelectedCell({ row: row + 1, col });
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      if (editingCell) {
        commitCellEdit();
      }
      
      // Move to the next cell (or previous if Shift is pressed)
      if (e.shiftKey) {
        if (col > 0) {
          setSelectedCell({ row, col: col - 1 });
        } else if (row > 0) {
          setSelectedCell({ row: row - 1, col: data.numCols - 1 });
        }
      } else {
        if (col < data.numCols - 1) {
          setSelectedCell({ row, col: col + 1 });
        } else if (row < data.numRows - 1) {
          setSelectedCell({ row: row + 1, col: 0 });
        }
      }
    } else if (e.key === 'Escape') {
      if (editingCell) {
        // Cancel editing
        setEditingCell(null);
        
        // Restore previous value
        const cell = getCell(data, row, col);
        setFormulaValue(cell.formula || cell.value === null ? '' : String(cell.value));
      }
    } else if (!editingCell) {
      // Navigation keys when not editing
      if (e.key === 'ArrowUp' && row > 0) {
        setSelectedCell({ row: row - 1, col });
      } else if (e.key === 'ArrowDown' && row < data.numRows - 1) {
        setSelectedCell({ row: row + 1, col });
      } else if (e.key === 'ArrowLeft' && col > 0) {
        setSelectedCell({ row, col: col - 1 });
      } else if (e.key === 'ArrowRight' && col < data.numCols - 1) {
        setSelectedCell({ row, col: col + 1 });
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
        // Start editing with the typed character
        setEditingCell(selectedCell);
        setFormulaValue(e.key);
        
        const newData = setCell(
          data,
          row,
          col,
          e.key,
          undefined
        );
        
        setData(newData);
      }
    }
  };
  
  const handleFormatChange = (format: Partial<CellFormat>) => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      const currentCellFormat = getCell(data, row, col).format || {};
      const newFormat = { ...currentCellFormat, ...format };
      
      const newData = setCellFormat(data, row, col, newFormat);
      setData(newData);
      setCurrentFormat(newFormat);
    }
  };
  
  const handleAddRow = () => {
    if (selectedCell) {
      const { row } = selectedCell;
      const newData = addRow(data, row + 1);
      setData(newData);
      toast({
        title: 'Row Added',
        description: `Row ${row + 2} has been added`,
      });
    }
  };
  
  const handleAddColumn = () => {
    if (selectedCell) {
      const { col } = selectedCell;
      const newData = addColumn(data, col + 1);
      setData(newData);
      toast({
        title: 'Column Added',
        description: `Column ${columnHeaders[col + 1]} has been added`,
      });
    }
  };
  
  const handleDeleteRow = () => {
    if (selectedCell && data.numRows > 1) {
      const { row } = selectedCell;
      const newData = deleteRow(data, row);
      setData(newData);
      
      // Adjust selectedCell if needed
      if (row >= newData.numRows) {
        setSelectedCell({ row: newData.numRows - 1, col: selectedCell.col });
      }
      
      toast({
        title: 'Row Deleted',
        description: `Row ${row + 1} has been deleted`,
      });
    }
  };
  
  const handleDeleteColumn = () => {
    if (selectedCell && data.numCols > 1) {
      const { col } = selectedCell;
      const newData = deleteColumn(data, col);
      setData(newData);
      
      // Adjust selectedCell if needed
      if (col >= newData.numCols) {
        setSelectedCell({ row: selectedCell.row, col: newData.numCols - 1 });
      }
      
      toast({
        title: 'Column Deleted',
        description: `Column ${columnHeaders[col]} has been deleted`,
      });
    }
  };
  
  const handleColumnResizeStart = (colIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingCol(colIndex);
    setDragStart(e.clientX);
  };
  
  const handleColumnResizeMove = (e: React.MouseEvent) => {
    if (isResizing && resizingCol !== null && dragStart !== null) {
      const delta = e.clientX - dragStart;
      const currentWidth = data.columnWidths[resizingCol] || DEFAULT_COLUMN_WIDTH;
      const newWidth = Math.max(50, currentWidth + delta);
      
      const headerElem = document.querySelector(`.col-header[data-col="${resizingCol}"]`);
      if (headerElem) {
        headerElem.setAttribute('style', `width: ${newWidth}px; min-width: ${newWidth}px; max-width: ${newWidth}px;`);
      }
      
      const cells = document.querySelectorAll(`.cell[data-col="${resizingCol}"]`);
      cells.forEach((cell) => {
        cell.setAttribute('style', `width: ${newWidth}px; min-width: ${newWidth}px; max-width: ${newWidth}px;`);
      });
    }
  };
  
  const handleColumnResizeEnd = () => {
    if (isResizing && resizingCol !== null && dragStart !== null) {
      const headerElem = document.querySelector(`.col-header[data-col="${resizingCol}"]`);
      if (headerElem) {
        const style = window.getComputedStyle(headerElem);
        const width = parseInt(style.width);
        
        const newData = { ...data };
        newData.columnWidths[resizingCol] = width;
        setData(newData);
      }
      
      setIsResizing(false);
      setResizingCol(null);
      setDragStart(null);
    }
  };
  
  useEffect(() => {
    window.addEventListener('mousemove', handleColumnResizeMove as any);
    window.addEventListener('mouseup', handleColumnResizeEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleColumnResizeMove as any);
      window.removeEventListener('mouseup', handleColumnResizeEnd);
    };
  }, [isResizing, resizingCol, dragStart]);
  
  // Re-evaluate all formulas when data changes
  useEffect(() => {
    const evaluateAllFormulas = () => {
      let updatedData = { ...data };
      Object.keys(data.cells).forEach(key => {
        const [row, col] = key.split(',').map(Number);
        const cell = data.cells[key];
        
        if (cell.formula) {
          try {
            const cellsArray = getCellsAs2DArray(updatedData);
            const result = evaluateFormula(cell.formula, cellsArray, row, col);
            
            updatedData = setCell(
              updatedData,
              row,
              col,
              result,
              cell.formula
            );
          } catch (error) {
            console.error(`Error evaluating formula in cell [${row}, ${col}]:`, error);
          }
        }
      });
      
      if (JSON.stringify(updatedData) !== JSON.stringify(data)) {
        setData(updatedData);
      }
    };
    
    // Evaluate all formulas on initial load
    if (Object.keys(data.cells).some(key => data.cells[key].formula)) {
      evaluateAllFormulas();
    }
  }, []);
  
  return (
    <div className="spreadsheet-container animate-fade-in">
      <Toolbar
        currentFormat={currentFormat}
        onFormatChange={handleFormatChange}
        onAddRow={handleAddRow}
        onAddColumn={handleAddColumn}
        onDeleteRow={handleDeleteRow}
        onDeleteColumn={handleDeleteColumn}
        canDeleteRow={data.numRows > 1}
        canDeleteColumn={data.numCols > 1}
      />
      
      <FormulaBar
        value={formulaValue}
        onChange={handleFormulaChange}
        selectedCell={selectedCell}
        onSubmit={handleFormulaSubmit}
      />
      
      <div className="spreadsheet-grid" ref={gridRef}>
        <div className="sticky left-0 top-0 z-30">
          <div className="corner-header"></div>
        </div>
        
        <div className="sticky top-0 z-20 flex">
          {columnHeaders.map((header, colIndex) => (
            <div
              key={`col-${colIndex}`}
              className="col-header"
              style={{
                width: `${data.columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH}px`,
                minWidth: `${data.columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH}px`,
                maxWidth: `${data.columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH}px`,
              }}
              data-col={colIndex}
            >
              {header}
              <div
                className="resizer"
                onMouseDown={(e) => handleColumnResizeStart(colIndex, e)}
              ></div>
            </div>
          ))}
        </div>
        
        <div className="relative">
          {rowHeaders.map((header, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex" style={{ height: '24px', minHeight: '24px', maxHeight: '24px' }}>
              <div
                className="row-header"
                style={{
                  height: `${data.rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT}px`,
                  lineHeight: `${data.rowHeights[rowIndex] || DEFAULT_ROW_HEIGHT}px`,
                }}
              >
                {header}
              </div>
              
              {columnHeaders.map((_, colIndex) => {
                const key = getCellKey(rowIndex, colIndex);
                const cellData = data.cells[key] || { value: null };
                const isSelected = 
                  selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isEditing = 
                  editingCell?.row === rowIndex && editingCell?.col === colIndex;
                
                return (
                  <Cell
                    key={`cell-${rowIndex}-${colIndex}`}
                    data={cellData}
                    row={rowIndex}
                    col={colIndex}
                    isSelected={isSelected}
                    isEditing={isEditing}
                    onSelect={handleSelectCell}
                    onChange={handleCellChange}
                    onDoubleClick={handleDoubleClickCell}
                    onKeyDown={handleCellKeyDown}
                    width={data.columnWidths[colIndex] || DEFAULT_COLUMN_WIDTH}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

Spreadsheet.displayName = 'Spreadsheet';

export default Spreadsheet;
