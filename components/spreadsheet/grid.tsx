"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { useSpreadsheet } from "./spreadsheet-context"
import { Input } from "@/components/ui/input"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function Grid() {
  const {
    data,
    selection,
    setSelection,
    activeCell,
    setActiveCell,
    editingCell,
    setEditingCell,
    editValue,
    setEditValue,
    updateCell,
    rowCount,
    colCount,
    evaluateCell,
    deleteRow,
    deleteColumn,
    addRow,
    addColumn,
    columnWidths,
    rowHeights,
    resizeColumn,
    resizeRow,
  } = useSpreadsheet()

  const gridRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ row: number; col: number } | null>(null)
  const [isResizingCol, setIsResizingCol] = useState(false)
  const [isResizingRow, setIsResizingRow] = useState(false)
  const [resizeIndex, setResizeIndex] = useState<number | null>(null)
  const [resizeStartPos, setResizeStartPos] = useState<number | null>(null)
  const [resizeStartSize, setResizeStartSize] = useState<number | null>(null)

  const getCellId = (row: number, col: number) => {
    const colLetter = String.fromCharCode(65 + col)
    return `${colLetter}${row + 1}`
  }

  const handleCellClick = (row: number, col: number) => {
    const cellId = getCellId(row, col)
    setActiveCell(cellId)
    setSelection({
      start: { row, col },
      end: { row, col },
      active: { row, col },
    })

    // Set edit value from cell data
    if (data[cellId]) {
      setEditValue(data[cellId].formula || data[cellId].value)
    } else {
      setEditValue("")
    }
  }

  const handleCellDoubleClick = (row: number, col: number) => {
    const cellId = getCellId(row, col)
    setEditingCell(cellId)

    // Set edit value from cell data
    if (data[cellId]) {
      setEditValue(data[cellId].formula || data[cellId].value)
    } else {
      setEditValue("")
    }
  }

  const handleCellMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    setDragStart({ row, col })

    const cellId = getCellId(row, col)
    setActiveCell(cellId)
    setSelection({
      start: { row, col },
      end: { row, col },
      active: { row, col },
    })
  }

  const handleCellMouseOver = (row: number, col: number) => {
    if (isDragging && dragStart) {
      setSelection({
        start: dragStart,
        end: { row, col },
        active: dragStart,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
    setIsResizingCol(false)
    setIsResizingRow(false)
    setResizeIndex(null)
    setResizeStartPos(null)
    setResizeStartSize(null)
  }

  const handleCellInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  const handleCellInputBlur = () => {
    if (editingCell) {
      const isFormula = editValue.startsWith("=")
      updateCell(editingCell, {
        value: editValue,
        formula: isFormula ? editValue : "",
      })
      setEditingCell(null)
    }
  }

  const handleCellInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCellInputBlur()
    } else if (e.key === "Escape") {
      setEditingCell(null)
      setEditValue("")
    }
  }

  const handleColResizeMouseDown = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizingCol(true)
    setResizeIndex(colIndex)
    setResizeStartPos(e.clientX)
    setResizeStartSize(columnWidths[colIndex] || 96) // Default width is 96px (w-24)
  }

  const handleRowResizeMouseDown = (e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizingRow(true)
    setResizeIndex(rowIndex)
    setResizeStartPos(e.clientY)
    setResizeStartSize(rowHeights[rowIndex] || 32) // Default height is 32px (h-8)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizingCol && resizeIndex !== null && resizeStartPos !== null && resizeStartSize !== null) {
      const diff = e.clientX - resizeStartPos
      const newWidth = Math.max(50, resizeStartSize + diff) // Minimum width of 50px
      resizeColumn(resizeIndex, newWidth)
    } else if (isResizingRow && resizeIndex !== null && resizeStartPos !== null && resizeStartSize !== null) {
      const diff = e.clientY - resizeStartPos
      const newHeight = Math.max(20, resizeStartSize + diff) // Minimum height of 20px
      resizeRow(resizeIndex, newHeight)
    }
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setDragStart(null)
      setIsResizingCol(false)
      setIsResizingRow(false)
      setResizeIndex(null)
      setResizeStartPos(null)
      setResizeStartSize(null)
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  // Generate column headers (A, B, C, ...)
  const columnHeaders = Array.from({ length: colCount }, (_, i) => String.fromCharCode(65 + i))

  // Generate row headers (1, 2, 3, ...)
  const rowHeaders = Array.from({ length: rowCount }, (_, i) => i + 1)

  // Check if a cell is in the current selection
  const isCellSelected = (row: number, col: number) => {
    const minRow = Math.min(selection.start.row, selection.end.row)
    const maxRow = Math.max(selection.start.row, selection.end.row)
    const minCol = Math.min(selection.start.col, selection.end.col)
    const maxCol = Math.max(selection.start.col, selection.end.col)

    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol
  }

  // Check if a cell is the active cell
  const isActiveCell = (row: number, col: number) => {
    return activeCell === getCellId(row, col)
  }

  // Get cell style
  const getCellStyle = (row: number, col: number) => {
    const cellId = getCellId(row, col)
    const cellData = data[cellId]

    if (!cellData) {
      return {}
    }

    return {
      fontWeight: cellData.style.bold ? "bold" : "normal",
      fontStyle: cellData.style.italic ? "italic" : "normal",
      fontSize: `${cellData.style.fontSize}px`,
      color: cellData.style.color,
      backgroundColor: cellData.style.backgroundColor,
    }
  }

  return (
    <div className="flex-1 overflow-auto" ref={gridRef} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      <div className="inline-block min-w-full">
        <div className="flex">
          {/* Empty corner cell */}
          <ContextMenu>
            <ContextMenuTrigger>
              <div className="w-10 h-8 bg-gray-100 border-b border-r flex items-center justify-center text-gray-500 sticky top-0 left-0 z-20"></div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => addRow()}>Insert Row</ContextMenuItem>
              <ContextMenuItem onClick={() => addColumn()}>Insert Column</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          {/* Column headers */}
          <div className="flex sticky top-0 z-10 bg-gray-100">
            {columnHeaders.map((header, col) => (
              <ContextMenu key={header}>
                <ContextMenuTrigger>
                  <div
                    className="h-8 border-b border-r flex items-center justify-center text-gray-500 relative"
                    style={{ width: `${columnWidths[col] || 96}px` }}
                  >
                    {header}
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500"
                      onMouseDown={(e) => handleColResizeMouseDown(e, col)}
                    />
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => addColumn()}>Insert Column</ContextMenuItem>
                  <ContextMenuItem onClick={() => deleteColumn(col)}>Delete Column</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        </div>

        {/* Grid rows */}
        {rowHeaders.map((header, row) => (
          <div key={row} className="flex">
            {/* Row header */}
            <ContextMenu>
              <ContextMenuTrigger>
                <div
                  className="w-10 bg-gray-100 border-b border-r flex items-center justify-center text-gray-500 sticky left-0 z-10 relative"
                  style={{ height: `${rowHeights[row] || 32}px` }}
                >
                  {header}
                  <div
                    className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-blue-500"
                    onMouseDown={(e) => handleRowResizeMouseDown(e, row)}
                  />
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => addRow()}>Insert Row</ContextMenuItem>
                <ContextMenuItem onClick={() => deleteRow(row)}>Delete Row</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

            {/* Row cells */}
            <div className="flex">
              {columnHeaders.map((_, col) => {
                const cellId = getCellId(row, col)
                const isEditing = editingCell === cellId
                const isSelected = isCellSelected(row, col)
                const isActive = isActiveCell(row, col)

                return (
                  <ContextMenu key={col}>
                    <ContextMenuTrigger>
                      <div
                        className={`
                          border-b border-r relative
                          ${isSelected ? "bg-blue-50" : ""}
                          ${isActive ? "ring-2 ring-blue-500 ring-inset" : ""}
                        `}
                        style={{
                          width: `${columnWidths[col] || 96}px`,
                          height: `${rowHeights[row] || 32}px`,
                        }}
                        onClick={() => handleCellClick(row, col)}
                        onDoubleClick={() => handleCellDoubleClick(row, col)}
                        onMouseDown={() => handleCellMouseDown(row, col)}
                        onMouseOver={() => handleCellMouseOver(row, col)}
                        style={{
                          ...getCellStyle(row, col),
                          width: `${columnWidths[col] || 96}px`,
                          height: `${rowHeights[row] || 32}px`,
                        }}
                      >
                        {isEditing ? (
                          <Input
                            value={editValue}
                            onChange={handleCellInputChange}
                            onBlur={handleCellInputBlur}
                            onKeyDown={handleCellInputKeyDown}
                            className="absolute inset-0 border-0 focus:ring-0 p-1 h-full"
                            autoFocus
                          />
                        ) : (
                          <div className="p-1 truncate h-full">
                            {data[cellId]?.formula ? evaluateCell(cellId) : data[cellId]?.value || ""}
                          </div>
                        )}
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleCellDoubleClick(row, col)}>Edit Cell</ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => addRow()}>Insert Row</ContextMenuItem>
                      <ContextMenuItem onClick={() => deleteRow(row)}>Delete Row</ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => addColumn()}>Insert Column</ContextMenuItem>
                      <ContextMenuItem onClick={() => deleteColumn(col)}>Delete Column</ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

