import { Suspense } from "react"
import ProductListClient from "../productlist/ProductListClient"

export default function AccessoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductListClient category="Accessories" />
    </Suspense>
  )
}
