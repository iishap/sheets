"use client"

import type React from "react"

import { useSpreadsheet } from "./spreadsheet-context"
import { Input } from "@/components/ui/input"
import { ActivityIcon as Function } from "lucide-react"

export function FormulaBar() {
  const { activeCell, editValue, setEditValue, updateCell } = useSpreadsheet()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && activeCell) {
      const isFormula = editValue.startsWith("=")
      updateCell(activeCell, {
        value: editValue,
        formula: isFormula ? editValue : "",
      })
    }
  }

  return (
    <div className="flex items-center p-1 border-b">
      <div className="flex items-center justify-center w-10 h-8 bg-gray-100 border rounded mr-2">
        <Function className="h-4 w-4 text-gray-500" />
      </div>
      <div className="flex-1">
        <Input
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter a value or formula starting with ="
          className="h-8"
        />
      </div>
    </div>
  )
}

