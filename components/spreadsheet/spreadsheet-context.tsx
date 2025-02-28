"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback, useMemo } from "react"
import { initialData } from "./initial-data"
import { evaluateFormula } from "./formula-parser"

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

type Selection = {
  start: { row: number; col: number }
  end: { row: number; col: number }
  active: { row: number; col: number }
}

type SpreadsheetContextType = {
  data: SpreadsheetData
  selection: Selection
  activeCell: string | null
  editingCell: string | null
  editValue: string
  rowCount: number
  colCount: number
  setData: (data: SpreadsheetData) => void
  updateCell: (cellId: string, updates: Partial<CellData>) => void
  setSelection: (selection: Selection) => void
  setActiveCell: (cellId: string | null) => void
  setEditingCell: (cellId: string | null) => void
  setEditValue: (value: string) => void
  getCellValue: (cellId: string) => string
  evaluateCell: (cellId: string) => string
  addRow: () => void
  addColumn: () => void
  deleteRow: (rowIndex: number) => void
  deleteColumn: (colIndex: number) => void
  applyFormatting: (formatting: Partial<CellData["style"]>) => void
  findAndReplace: (find: string, replace: string) => void
  removeDuplicates: () => void
  sheets: string[]
  activeSheet: string
  setActiveSheet: (sheet: string) => void
  addSheet: () => void
  renameSheet: (oldName: string, newName: string) => void
  deleteSheet: (name: string) => void
  resizeColumn: (colIndex: number, width: number) => void
  resizeRow: (rowIndex: number, height: number) => void
  columnWidths: { [key: number]: number }
  rowHeights: { [key: number]: number }
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined)

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SpreadsheetData>(initialData)
  const [selection, setSelection] = useState<Selection>({
    start: { row: 0, col: 0 },
    end: { row: 0, col: 0 },
    active: { row: 0, col: 0 },
  })
  const [activeCell, setActiveCell] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>("")
  const [rowCount, setRowCount] = useState<number>(100)
  const [colCount, setColCount] = useState<number>(26)
  const [sheets, setSheets] = useState<string[]>(["Sheet1"])
  const [activeSheet, setActiveSheet] = useState<string>("Sheet1")
  const [columnWidths, setColumnWidths] = useState<{ [key: number]: number }>({})
  const [rowHeights, setRowHeights] = useState<{ [key: number]: number }>({})

  const getCellId = useCallback((row: number, col: number) => {
    const colLetter = String.fromCharCode(65 + col)
    return `${colLetter}${row + 1}`
  }, [])

  const getCellValue = useCallback(
    (cellId: string) => {
      if (!data[cellId]) return ""
      return data[cellId].value
    },
    [data],
  )

  const evaluateCell = useCallback(
    (cellId: string) => {
      if (!data[cellId]) return ""
      if (!data[cellId].formula) return data[cellId].value

      try {
        return evaluateFormula(data[cellId].formula, data)
      } catch (error) {
        return "#ERROR!"
      }
    },
    [data],
  )

  const updateCell = useCallback((cellId: string, updates: Partial<CellData>) => {
    setData((prevData) => {
      const newData = { ...prevData }

      if (!newData[cellId]) {
        newData[cellId] = {
          value: "",
          formula: "",
          style: {
            bold: false,
            italic: false,
            fontSize: 14,
            color: "#000000",
            backgroundColor: "#ffffff",
          },
        }
      }

      newData[cellId] = {
        ...newData[cellId],
        ...updates,
      }

      // If this is a formula, evaluate it
      if (updates.formula !== undefined) {
        try {
          newData[cellId].value = evaluateFormula(updates.formula, newData)
        } catch (error) {
          newData[cellId].value = "#ERROR!"
        }
      }

      // Update dependent cells
      Object.keys(newData).forEach((key) => {
        if (newData[key].formula && newData[key].formula.includes(cellId)) {
          try {
            newData[key].value = evaluateFormula(newData[key].formula, newData)
          } catch (error) {
            newData[key].value = "#ERROR!"
          }
        }
      })

      return newData
    })
  }, [])

  const addRow = useCallback(() => {
    setRowCount((prev) => prev + 1)
  }, [])

  const addColumn = useCallback(() => {
    setColCount((prev) => prev + 1)
  }, [])

  const deleteRow = useCallback(
    (rowIndex: number) => {
      setData((prevData) => {
        const newData = { ...prevData }

        // Delete cells in the row
        for (let col = 0; col < colCount; col++) {
          const cellId = getCellId(rowIndex, col)
          delete newData[cellId]
        }

        // Shift cells up
        for (let row = rowIndex + 1; row < rowCount; row++) {
          for (let col = 0; col < colCount; col++) {
            const oldCellId = getCellId(row, col)
            const newCellId = getCellId(row - 1, col)

            if (newData[oldCellId]) {
              newData[newCellId] = { ...newData[oldCellId] }
              delete newData[oldCellId]
            }
          }
        }

        return newData
      })

      setRowCount((prev) => prev - 1)
    },
    [colCount, rowCount, getCellId],
  )

  const deleteColumn = useCallback(
    (colIndex: number) => {
      setData((prevData) => {
        const newData = { ...prevData }

        // Delete cells in the column
        for (let row = 0; row < rowCount; row++) {
          const cellId = getCellId(row, colIndex)
          delete newData[cellId]
        }

        // Shift cells left
        for (let col = colIndex + 1; col < colCount; col++) {
          for (let row = 0; row < rowCount; row++) {
            const oldCellId = getCellId(row, col)
            const newCellId = getCellId(row, col - 1)

            if (newData[oldCellId]) {
              newData[newCellId] = { ...newData[oldCellId] }
              delete newData[oldCellId]
            }
          }
        }

        return newData
      })

      setColCount((prev) => prev - 1)
    },
    [colCount, rowCount, getCellId],
  )

  const applyFormatting = useCallback(
    (formatting: Partial<CellData["style"]>) => {
      if (!activeCell) return

      updateCell(activeCell, {
        style: {
          ...(data[activeCell]?.style || {
            bold: false,
            italic: false,
            fontSize: 14,
            color: "#000000",
            backgroundColor: "#ffffff",
          }),
          ...formatting,
        },
      })
    },
    [activeCell, data, updateCell],
  )

  const findAndReplace = useCallback(
    (find: string, replace: string) => {
      setData((prevData) => {
        const newData = { ...prevData }

        // Get selected cells
        const selectedCells: string[] = []
        for (let row = selection.start.row; row <= selection.end.row; row++) {
          for (let col = selection.start.col; col <= selection.end.col; col++) {
            selectedCells.push(getCellId(row, col))
          }
        }

        // Replace in selected cells
        selectedCells.forEach((cellId) => {
          if (newData[cellId] && newData[cellId].value.includes(find)) {
            const newValue = newData[cellId].value.replaceAll(find, replace)
            newData[cellId] = {
              ...newData[cellId],
              value: newValue,
            }
          }
        })

        return newData
      })
    },
    [selection, getCellId],
  )

  const removeDuplicates = useCallback(() => {
    // This is a simplified implementation that works on the selected range
    const selectedCells: string[][] = []
    const seenValues = new Set<string>()
    const duplicateRows = new Set<number>()

    // Collect rows in the selection
    for (let row = selection.start.row; row <= selection.end.row; row++) {
      const rowCells: string[] = []
      for (let col = selection.start.col; col <= selection.end.col; col++) {
        rowCells.push(getCellId(row, col))
      }
      selectedCells.push(rowCells)
    }

    // Find duplicates
    selectedCells.forEach((rowCells, rowIndex) => {
      const rowValues = rowCells.map((cellId) => data[cellId]?.value || "").join("|")
      if (seenValues.has(rowValues)) {
        duplicateRows.add(rowIndex + selection.start.row)
      } else {
        seenValues.add(rowValues)
      }
    })

    // Remove duplicates (starting from the bottom to avoid shifting issues)
    const rowsToDelete = Array.from(duplicateRows).sort((a, b) => b - a)
    rowsToDelete.forEach((row) => {
      deleteRow(row)
    })
  }, [data, deleteRow, selection, getCellId])

  const addSheet = useCallback(() => {
    setSheets((prev) => {
      const newSheetNumber = prev.length + 1
      const newSheetName = `Sheet${newSheetNumber}`
      return [...prev, newSheetName]
    })
  }, [])

  const renameSheet = useCallback(
    (oldName: string, newName: string) => {
      if (newName.trim() === "") return

      setSheets((prev) => {
        const index = prev.indexOf(oldName)
        if (index === -1) return prev

        const newSheets = [...prev]
        newSheets[index] = newName
        return newSheets
      })

      if (activeSheet === oldName) {
        setActiveSheet(newName)
      }
    },
    [activeSheet],
  )

  const deleteSheet = useCallback(
    (name: string) => {
      setSheets((prev) => {
        if (prev.length <= 1) return prev // Don't delete the last sheet

        const newSheets = prev.filter((sheet) => sheet !== name)
        return newSheets
      })

      if (activeSheet === name) {
        setActiveSheet(sheets[0] === name ? sheets[1] : sheets[0])
      }
    },
    [activeSheet, sheets],
  )

  const resizeColumn = useCallback((colIndex: number, width: number) => {
    setColumnWidths((prev) => ({
      ...prev,
      [colIndex]: width,
    }))
  }, [])

  const resizeRow = useCallback((rowIndex: number, height: number) => {
    setRowHeights((prev) => ({
      ...prev,
      [rowIndex]: height,
    }))
  }, [])

  const value = useMemo(
    () => ({
      data,
      selection,
      activeCell,
      editingCell,
      editValue,
      rowCount,
      colCount,
      setData,
      updateCell,
      setSelection,
      setActiveCell,
      setEditingCell,
      setEditValue,
      getCellValue,
      evaluateCell,
      addRow,
      addColumn,
      deleteRow,
      deleteColumn,
      applyFormatting,
      findAndReplace,
      removeDuplicates,
      sheets,
      activeSheet,
      setActiveSheet,
      addSheet,
      renameSheet,
      deleteSheet,
      resizeColumn,
      resizeRow,
      columnWidths,
      rowHeights,
    }),
    [
      data,
      selection,
      activeCell,
      editingCell,
      editValue,
      rowCount,
      colCount,
      updateCell,
      getCellValue,
      evaluateCell,
      addRow,
      addColumn,
      deleteRow,
      deleteColumn,
      applyFormatting,
      findAndReplace,
      removeDuplicates,
      sheets,
      activeSheet,
      addSheet,
      renameSheet,
      deleteSheet,
      resizeColumn,
      resizeRow,
      columnWidths,
      rowHeights,
    ],
  )

  return <SpreadsheetContext.Provider value={value}>{children}</SpreadsheetContext.Provider>
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext)
  if (context === undefined) {
    throw new Error("useSpreadsheet must be used within a SpreadsheetProvider")
  }
  return context
}

