"use client"

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface FilterOption {
  value: string
  label: string
}

interface FilterTabsProps {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

export function FilterTabs({ options, value, onChange }: FilterTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm transition-colors ${
            value === option.value
              ? 'bg-orange-600 text-white'
              : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface AdvancedFilters {
  paymentStatus: string[]
  dateRange: {
    from: string
    to: string
  }
  eventId: string
  collegeName: string
}

interface SearchWithFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
  filterValue?: string
  onFilterChange?: (value: string) => void
  advancedFilters?: AdvancedFilters
  onAdvancedFiltersChange?: (filters: AdvancedFilters) => void
  events?: Array<{ id: string; name: string }>
}

export function SearchWithFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterOptions,
  filterValue,
  onFilterChange,
  advancedFilters,
  onAdvancedFiltersChange,
  events = []
}: SearchWithFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const paymentStatuses = [
    { id: 'paid', label: 'Paid' },
    { id: 'unpaid', label: 'Unpaid' },
    { id: 'cash', label: 'Cash Payment' },
    { id: 'online', label: 'Online Payment' }
  ]

  const handlePaymentStatusChange = (statusId: string, checked: boolean) => {
    if (!advancedFilters || !onAdvancedFiltersChange) return

    const newStatuses = checked
      ? [...advancedFilters.paymentStatus, statusId]
      : advancedFilters.paymentStatus.filter(s => s !== statusId)

    onAdvancedFiltersChange({
      ...advancedFilters,
      paymentStatus: newStatuses
    })
  }

  const clearAdvancedFilters = () => {
    if (!onAdvancedFiltersChange) return
    onAdvancedFiltersChange({
      paymentStatus: [],
      dateRange: { from: '', to: '' },
      eventId: '',
      collegeName: ''
    })
  }

  const hasActiveFilters = advancedFilters && (
    advancedFilters.paymentStatus.length > 0 ||
    advancedFilters.dateRange.from ||
    advancedFilters.dateRange.to ||
    advancedFilters.eventId ||
    advancedFilters.collegeName
  )

  const activeFilterCount = advancedFilters ? [
    advancedFilters.paymentStatus.length,
    advancedFilters.dateRange.from || advancedFilters.dateRange.to ? 1 : 0,
    advancedFilters.eventId ? 1 : 0,
    advancedFilters.collegeName ? 1 : 0
  ].reduce((a, b) => a + b, 0) : 0

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-neutral-900 border-neutral-800 text-sm"
          />
        </div>
        {advancedFilters && onAdvancedFiltersChange && (
          <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`border-neutral-700 bg-neutral-900 hover:bg-neutral-800 ${
                  hasActiveFilters ? 'border-orange-500 text-orange-400' : 'text-neutral-400'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced
                {hasActiveFilters && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-neutral-900 border-neutral-700" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Advanced Filters</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAdvancedFilters}
                      className="text-neutral-400 hover:text-white h-auto p-1"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">
                    Payment Status
                  </label>
                  <div className="space-y-2">
                    {paymentStatuses.map((status) => (
                      <div key={status.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={status.id}
                          checked={advancedFilters.paymentStatus.includes(status.id)}
                          onCheckedChange={(checked) =>
                            handlePaymentStatusChange(status.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={status.id}
                          className="text-sm text-neutral-400 cursor-pointer"
                        >
                          {status.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-neutral-500 block mb-1">From</label>
                      <Input
                        type="date"
                        value={advancedFilters.dateRange.from}
                        onChange={(e) => onAdvancedFiltersChange({
                          ...advancedFilters,
                          dateRange: { ...advancedFilters.dateRange, from: e.target.value }
                        })}
                        className="bg-neutral-800 border-neutral-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500 block mb-1">To</label>
                      <Input
                        type="date"
                        value={advancedFilters.dateRange.to}
                        onChange={(e) => onAdvancedFiltersChange({
                          ...advancedFilters,
                          dateRange: { ...advancedFilters.dateRange, to: e.target.value }
                        })}
                        className="bg-neutral-800 border-neutral-700 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">
                    Event
                  </label>
                  <Select
                    value={advancedFilters.eventId || 'all'}
                    onValueChange={(value) => onAdvancedFiltersChange({
                      ...advancedFilters,
                      eventId: value === 'all' ? '' : value
                    })}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700">
                      <SelectValue placeholder="All Events" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-neutral-700">
                      <SelectItem value="all">All Events</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">
                    College Name
                  </label>
                  <Input
                    placeholder="Filter by college..."
                    value={advancedFilters.collegeName}
                    onChange={(e) => onAdvancedFiltersChange({
                      ...advancedFilters,
                      collegeName: e.target.value
                    })}
                    className="bg-neutral-800 border-neutral-700 text-sm"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      {filterOptions && filterValue !== undefined && onFilterChange && (
        <FilterTabs
          options={filterOptions}
          value={filterValue}
          onChange={onFilterChange}
        />
      )}
    </div>
  )
}