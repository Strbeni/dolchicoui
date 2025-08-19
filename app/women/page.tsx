import { Suspense } from "react"
import ProductListClient from "../productlist/ProductListClient";
export default function WomenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductListClient category="Women" />
    </Suspense>
  );
}
