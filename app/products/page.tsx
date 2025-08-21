import { Suspense } from "react"
import ProductListClient from "../productlist/ProductListClient";
export default function ProductListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductListClient category="All" />
    </Suspense>
  )
}
