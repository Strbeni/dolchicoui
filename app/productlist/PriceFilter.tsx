"use client"

import { Slider } from "@/components/ui/slider"

interface PriceFilterProps {
  priceRange: [number, number]
  setPriceRange: (value: [number, number]) => void
}

export default function PriceFilter({ priceRange, setPriceRange }: PriceFilterProps) {
  return (
    <div>
      <p className="font-semibold mb-2">Prices</p>
      <div className="space-y-4">
        <Slider
          min={0}
          max={15000}
          step={10}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="w-full"
        />
        <div className="text-sm text-gray-600">
          ${priceRange[0]} – ${priceRange[1]}
        </div>
      </div>
    </div>
  )
}
