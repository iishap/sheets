"use client"
import { Toolbar } from "./toolbar"
import { FormulaBar } from "./formula-bar"
import { Grid } from "./grid"
import { SheetTabs } from "./sheet-tabs"
import { SpreadsheetProvider } from "./spreadsheet-context"

export default function Spreadsheet() {
  return (
    <SpreadsheetProvider>
      <div className="flex flex-col h-screen bg-white">
        <Toolbar />
        <FormulaBar />
        <Grid />
        <SheetTabs />
      </div>
    </SpreadsheetProvider>
  )
}

