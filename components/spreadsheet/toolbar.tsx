"use client"

import type React from "react"

import { useState } from "react"
import { useSpreadsheet } from "./spreadsheet-context"
import {
  Bold,
  Italic,
  Plus,
  Search,
  Save,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
  Grid,
  BarChart,
  Image,
  Link,
  Type,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function Toolbar() {
  const {
    applyFormatting,
    addRow,
    addColumn,
    deleteRow,
    deleteColumn,
    selection,
    findAndReplace,
    removeDuplicates,
    data,
    setData,
  } = useSpreadsheet()

  const [findText, setFindText] = useState("")
  const [replaceText, setReplaceText] = useState("")

  const handleSave = () => {
    const jsonData = JSON.stringify(data)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "spreadsheet.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        setData(jsonData)
      } catch (error) {
        console.error("Error loading file:", error)
        alert("Invalid file format")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col border-b">
      <div className="flex items-center p-1 border-b bg-white">
        <div className="flex items-center space-x-1 mr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => document.getElementById("load-file")?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Open
                <input id="load-file" type="file" accept=".json" className="hidden" onChange={handleLoad} />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                Edit
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Undo</DropdownMenuItem>
              <DropdownMenuItem>Redo</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cut</DropdownMenuItem>
              <DropdownMenuItem>Copy</DropdownMenuItem>
              <DropdownMenuItem>Paste</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Grid className="h-4 w-4 mr-2" />
                Gridlines
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Type className="h-4 w-4 mr-2" />
                Formula bar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                Insert
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" />
                Row
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addColumn}>
                <Plus className="h-4 w-4 mr-2" />
                Column
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <BarChart className="h-4 w-4 mr-2" />
                Chart
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Image className="h-4 w-4 mr-2" />
                Image
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link className="h-4 w-4 mr-2" />
                Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                Format
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => applyFormatting({ bold: true })}>
                <Bold className="h-4 w-4 mr-2" />
                Bold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyFormatting({ italic: true })}>
                <Italic className="h-4 w-4 mr-2" />
                Italic
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <AlignLeft className="h-4 w-4 mr-2" />
                Align left
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlignCenter className="h-4 w-4 mr-2" />
                Align center
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlignRight className="h-4 w-4 mr-2" />
                Align right
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={removeDuplicates}>Remove duplicates</DropdownMenuItem>
              <Dialog>
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Search className="h-4 w-4 mr-2" />
                    Find and replace
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Find and Replace</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="find" className="text-right">
                        Find:
                      </label>
                      <Input
                        id="find"
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="replace" className="text-right">
                        Replace:
                      </label>
                      <Input
                        id="replace"
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <DialogClose asChild>
                      <Button onClick={() => findAndReplace(findText, replaceText)}>Replace All</Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center p-1 bg-gray-50">
        <div className="flex items-center space-x-1 mr-4">
          <Select defaultValue="Arial">
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Calibri">Calibri</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="10">
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="14">14</SelectItem>
              <SelectItem value="18">18</SelectItem>
              <SelectItem value="24">24</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-1 mr-4">
          <Button variant="ghost" size="icon" onClick={() => applyFormatting({ bold: true })} className="h-8 w-8">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => applyFormatting({ italic: true })} className="h-8 w-8">
            <Italic className="h-4 w-4" />
          </Button>
          <div className="h-6 w-px bg-gray-300 mx-1" />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

