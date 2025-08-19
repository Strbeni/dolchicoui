
import { Suspense } from "react";
import ProductListClient from "../productlist/ProductListClient";

export default function KidsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Suspense fallback={<div>Loading...</div>}>
        {/* ProductListClient handles sidebar, filters, grid, sorting, and count */}
        <ProductListClient category="Kids" />
      </Suspense>
    </main>
  );
}
