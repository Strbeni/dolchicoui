"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePickerComponent({
  date,
  onDateChange,
  placeholder = "Select date",
  disabled = false,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [view, setView] = React.useState<'year' | 'month' | 'date'>('date')
  const [selectedYear, setSelectedYear] = React.useState<number>(date?.getFullYear() || new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = React.useState<number>(date?.getMonth() || new Date().getMonth())

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i)
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    setView('month')
  }

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month)
    setView('date')
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedYear, selectedMonth, day)
    onDateChange?.(newDate)
    setIsOpen(false)
    setView('date')
  }

  const handleClear = () => {
    onDateChange?.(null)
    setIsOpen(false)
  }

  const renderYearView = () => {
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Select Year</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('date')}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {years.map((year) => (
            <Button
              key={year}
              variant={year === selectedYear ? "default" : "ghost"}
              size="sm"
              onClick={() => handleYearSelect(year)}
              className="h-8 text-xs"
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const renderMonthView = () => {
    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('year')}
            className="h-6 text-sm font-semibold"
          >
            {selectedYear}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('date')}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <Button
              key={month}
              variant={index === selectedMonth ? "default" : "ghost"}
              size="sm"
              onClick={() => handleMonthSelect(index)}
              className="h-8 text-xs"
            >
              {month.slice(0, 3)}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  const renderDateView = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    const emptyDays = Array.from({ length: firstDay }, (_, i) => null)

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('month')}
              className="h-6 text-sm font-semibold"
            >
              {months[selectedMonth]}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('year')}
              className="h-6 text-sm font-semibold"
            >
              {selectedYear}
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 text-xs text-red-600"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </div>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-8" />
          ))}
          {days.map((day) => (
            <Button
              key={day}
              variant={
                date && 
                date.getFullYear() === selectedYear && 
                date.getMonth() === selectedMonth && 
                date.getDate() === day 
                  ? "default" 
                  : "ghost"
              }
              size="sm"
              onClick={() => handleDateSelect(day)}
              className="h-8 w-8 p-0 text-xs"
            >
              {day}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !date && "text-muted-foreground",
              disabled && "cursor-not-allowed opacity-50"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? date.toLocaleDateString() : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {view === 'year' && renderYearView()}
          {view === 'month' && renderMonthView()}
          {view === 'date' && renderDateView()}
        </PopoverContent>
      </Popover>
    </div>
  )
}
