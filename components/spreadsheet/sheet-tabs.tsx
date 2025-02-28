"use client"

import { useState } from "react"
import { useSpreadsheet } from "./spreadsheet-context"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, X } from "lucide-react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function SheetTabs() {
  const { sheets, activeSheet, setActiveSheet, addSheet, renameSheet, deleteSheet } = useSpreadsheet()

  const [isRenaming, setIsRenaming] = useState(false)
  const [sheetToRename, setSheetToRename] = useState("")
  const [newSheetName, setNewSheetName] = useState("")

  const handleRenameClick = (sheet: string) => {
    setSheetToRename(sheet)
    setNewSheetName(sheet)
    setIsRenaming(true)
  }

  const handleRenameSubmit = () => {
    renameSheet(sheetToRename, newSheetName)
    setIsRenaming(false)
  }

  const handleDeleteSheet = (sheet: string) => {
    if (sheets.length > 1) {
      deleteSheet(sheet)
    }
  }

  return (
    <div className="flex items-center border-t bg-gray-100 h-9 overflow-x-auto">
      <div className="flex">
        {sheets.map((sheet) => (
          <ContextMenu key={sheet}>
            <ContextMenuTrigger>
              <Button
                variant={activeSheet === sheet ? "secondary" : "ghost"}
                size="sm"
                className={`
                  h-8 rounded-none border-r px-4 
                  ${activeSheet === sheet ? "bg-white" : ""}
                `}
                onClick={() => setActiveSheet(sheet)}
              >
                {sheet}
              </Button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => handleRenameClick(sheet)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Rename
              </ContextMenuItem>
              {sheets.length > 1 && (
                <ContextMenuItem onClick={() => handleDeleteSheet(sheet)}>
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      <Button variant="ghost" size="icon" className="h-8 w-8 min-w-8" onClick={addSheet}>
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Sheet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button onClick={handleRenameSubmit}>Save</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

