
# Sheetopia - Spreadsheet Application

A web-based spreadsheet application that mimics the core functionalities of Google Sheets, with a focus on mathematical and data quality functions.
![Screenshot 2025-02-27 225757](https://github.com/user-attachments/assets/e2184e36-c733-4765-adad-259242c466bf)
![Screenshot 2025-02-27 225827](https://github.com/user-attachments/assets/76601b55-9bc0-4cbb-b536-22d1e79e08ad)

## Features

- Complete spreadsheet interface with rows, columns, and cells
- Formula support with mathematical functions (SUM, AVERAGE, MAX, MIN, COUNT)
- Data quality functions (TRIM, UPPER, LOWER)
- Cell formatting options (bold, italic, text color, background color)
- Add, delete, and resize rows and columns
- Keyboard navigation for spreadsheet cells
- Clean, minimalist UI with a light green theme

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Vite
- shadcn-ui components

## Mathematical Functions

The application supports the following mathematical functions:

1. SUM: Calculates the sum of a range of cells. Example: `=SUM(A1:A10)`
2. AVERAGE: Calculates the average of a range of cells. Example: `=AVERAGE(B1:B5)`
3. MAX: Returns the maximum value from a range of cells. Example: `=MAX(C1:C20)`
4. MIN: Returns the minimum value from a range of cells. Example: `=MIN(D1:D20)`
5. COUNT: Counts the number of cells containing numerical values in a range. Example: `=COUNT(A1:D10)`

## Data Quality Functions

The application also includes these data quality functions:

1. TRIM: Removes leading and trailing whitespace from a cell. Example: `=TRIM(A1)`
2. UPPER: Converts the text in a cell to uppercase. Example: `=UPPER(B3)`
3. LOWER: Converts the text in a cell to lowercase. Example: `=LOWER(C5)`

## Getting Started

1. Clone this repository
2. Install dependencies with `npm install`
3. Start the development server with `npm run dev`
4. Open your browser to the URL shown in the terminal

## Future Enhancements

- REMOVE_DUPLICATES function for removing duplicate rows
- FIND_AND_REPLACE functionality
- Support for more complex formulas and cell referencing
- Save and load spreadsheet functionality
- Data visualization capabilities (charts, graphs)
