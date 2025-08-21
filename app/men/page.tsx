import { Suspense } from "react";
import ProductListClient from "../productlist/ProductListClient";

export default function MenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductListClient category="Men" />
    </Suspense>
  );
}
