'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image'; 

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

export function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        setResults(data.products || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) return <p>Loading...</p>;
  if (results.length === 0) return <p>No products found.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {results.map((product) => (
        <div key={product.id} className="border p-3 rounded shadow-sm">
          <div className="relative w-full h-40 mb-2">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
