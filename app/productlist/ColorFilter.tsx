"use client"

// import React from "react";

// interface ColorFilterProps {
//   colors: { name: string; hex: string }[];
//   selectedColors: string[];
//   onChange: (selected: string[]) => void;
// }

// export default function ColorFilter({
//   colors,
//   selectedColors,
//   onChange,
// }: ColorFilterProps) {
//   const toggleColor = (colorName: string) => {
//     if (selectedColors.includes(colorName)) {
//       onChange(selectedColors.filter((c) => c !== colorName));
//     } else {
//       onChange([...selectedColors, colorName]);
//     }
//   };

//   return (
//     <div>
//       <p className="font-semibold mb-2">Colors</p>
//       <div className="grid grid-cols-2 gap-2">
//         {colors.map((color, idx) => (
//           <label
//             key={idx}
//             className="flex items-center space-x-2 cursor-pointer"
//           >
//             <input
//               type="checkbox"
//               checked={selectedColors.includes(color.name)}
//               onChange={() => toggleColor(color.name)}
//               className="form-checkbox"
//             />
//             <div
//               className="w-4 h-4 rounded-full border"
//               style={{ backgroundColor: color.hex }}
//             />
//             <span className="text-sm">{color.name}</span>
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useState } from "react"

interface Color {
  name: string
  hex: string
  count?: number
}

interface ColorFilterProps {
  colors: Color[]
  selectedColors: string[]
  onChange: (selected: string[]) => void
}

export default function ColorFilter({ colors, selectedColors, onChange }: ColorFilterProps) {
  const [showMore, setShowMore] = useState(false)
  const initialVisibleCount = 5

  const toggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      onChange(selectedColors.filter((c) => c !== colorName))
    } else {
      onChange([...selectedColors, colorName])
    }
  }

  const visibleColors = showMore ? colors : colors.slice(0, initialVisibleCount)

  const handleShowMore = () => {
    setShowMore(true)
  }

  return (
    <div className="space-y-2">
      <p className="font-semibold mb-2">Colors</p>
      <div className="flex flex-col gap-2">
        {visibleColors.map((color, index) => (
          <label key={index} htmlFor={color.name} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id={color.name}
              type="checkbox"
              checked={selectedColors.includes(color.name)}
              onChange={() => toggleColor(color.name)}
              className="form-checkbox text-blue-600"
            />
            <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: color.hex }} />
            <span className="text-sm">
              {color.name}
              {color.count !== undefined && <span className="ml-1 text-gray-500">({color.count})</span>}
            </span>
          </label>
        ))}

        {!showMore && colors.length > initialVisibleCount && (
          <button onClick={handleShowMore} className="text-blue-600 text-sm hover:underline self-start">
            +{colors.length - initialVisibleCount} more
          </button>
        )}
      </div>
    </div>
  )
}
