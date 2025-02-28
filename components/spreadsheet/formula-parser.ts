type CellData = {
  value: string
  formula: string
  style: {
    bold: boolean
    italic: boolean
    fontSize: number
    color: string
    backgroundColor: string
  }
}

type SpreadsheetData = {
  [key: string]: CellData
}

// Helper to get cell range
function getCellRange(start: string, end: string): string[] {
  const startCol = start.charCodeAt(0) - 65 // A -> 0
  const startRow = Number.parseInt(start.substring(1)) - 1 // 1-indexed to 0-indexed
  const endCol = end.charCodeAt(0) - 65
  const endRow = Number.parseInt(end.substring(1)) - 1

  const cells: string[] = []

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const cellId = `${String.fromCharCode(col + 65)}${row + 1}`
      cells.push(cellId)
    }
  }

  return cells
}

// Helper to get cell value as number
function getCellValueAsNumber(cellId: string, data: SpreadsheetData): number {
  if (!data[cellId]) return 0
  const value = data[cellId].value
  const num = Number.parseFloat(value)
  return isNaN(num) ? 0 : num
}

// Mathematical functions
function sum(range: string[], data: SpreadsheetData): number {
  return range.reduce((acc, cellId) => acc + getCellValueAsNumber(cellId, data), 0)
}

function average(range: string[], data: SpreadsheetData): number {
  if (range.length === 0) return 0
  return sum(range, data) / range.length
}

function max(range: string[], data: SpreadsheetData): number {
  if (range.length === 0) return 0
  return Math.max(...range.map((cellId) => getCellValueAsNumber(cellId, data)))
}

function min(range: string[], data: SpreadsheetData): number {
  if (range.length === 0) return 0
  return Math.min(...range.map((cellId) => getCellValueAsNumber(cellId, data)))
}

function count(range: string[], data: SpreadsheetData): number {
  return range.filter((cellId) => {
    const value = data[cellId]?.value
    return value !== undefined && value !== "" && !isNaN(Number.parseFloat(value))
  }).length
}

// Data quality functions
function trim(value: string): string {
  return value.trim()
}

function upper(value: string): string {
  return value.toUpperCase()
}

function lower(value: string): string {
  return value.toLowerCase()
}

// Main formula evaluator
export function evaluateFormula(formula: string, data: SpreadsheetData): string {
  if (!formula.startsWith("=")) return formula

  // Remove the equals sign
  const expression = formula.substring(1)

  // Handle SUM function
  if (expression.startsWith("SUM(") && expression.endsWith(")")) {
    const range = expression.substring(4, expression.length - 1)
    const [start, end] = range.split(":")
    const cells = getCellRange(start, end)
    return sum(cells, data).toString()
  }

  // Handle AVERAGE function
  if (expression.startsWith("AVERAGE(") && expression.endsWith(")")) {
    const range = expression.substring(8, expression.length - 1)
    const [start, end] = range.split(":")
    const cells = getCellRange(start, end)
    return average(cells, data).toString()
  }

  // Handle MAX function
  if (expression.startsWith("MAX(") && expression.endsWith(")")) {
    const range = expression.substring(4, expression.length - 1)
    const [start, end] = range.split(":")
    const cells = getCellRange(start, end)
    return max(cells, data).toString()
  }

  // Handle MIN function
  if (expression.startsWith("MIN(") && expression.endsWith(")")) {
    const range = expression.substring(4, expression.length - 1)
    const [start, end] = range.split(":")
    const cells = getCellRange(start, end)
    return min(cells, data).toString()
  }

  // Handle COUNT function
  if (expression.startsWith("COUNT(") && expression.endsWith(")")) {
    const range = expression.substring(6, expression.length - 1)
    const [start, end] = range.split(":")
    const cells = getCellRange(start, end)
    return count(cells, data).toString()
  }

  // Handle TRIM function
  if (expression.startsWith("TRIM(") && expression.endsWith(")")) {
    const cellId = expression.substring(5, expression.length - 1)
    return trim(data[cellId]?.value || "")
  }

  // Handle UPPER function
  if (expression.startsWith("UPPER(") && expression.endsWith(")")) {
    const cellId = expression.substring(6, expression.length - 1)
    return upper(data[cellId]?.value || "")
  }

  // Handle LOWER function
  if (expression.startsWith("LOWER(") && expression.endsWith(")")) {
    const cellId = expression.substring(6, expression.length - 1)
    return lower(data[cellId]?.value || "")
  }

  // Handle cell references
  if (/^[A-Z][0-9]+$/.test(expression)) {
    return data[expression]?.value || ""
  }

  // Handle basic arithmetic
  try {
    // Replace cell references with their values
    let arithmeticExpression = expression
    const cellRefs = expression.match(/[A-Z][0-9]+/g) || []

    for (const cellRef of cellRefs) {
      const cellValue = data[cellRef]?.value || "0"
      arithmeticExpression = arithmeticExpression.replace(new RegExp(cellRef, "g"), cellValue)
    }

    // Evaluate the expression
    return eval(arithmeticExpression).toString()
  } catch (error) {
    return "#ERROR!"
  }
}

