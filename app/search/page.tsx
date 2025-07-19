// import { Suspense } from 'react';
// import { SearchResults } from './search-results';

// interface SearchPageProps {
//   searchParams?: { q?: string };
// }

// export default function SearchPage({ searchParams }: SearchPageProps) {
//   const query = searchParams?.q || '';

//   return (
//     <section className="container py-6">
//       <h1 className="text-2xl font-semibold mb-4">
//         Search Results for &quot;{query}&quot;
//       </h1>
//       <Suspense fallback={<p>Loading...</p>}>
//         <SearchResults query={query} />
//       </Suspense>
//     </section>
//   );
// }

import { Suspense } from 'react';
import { SearchResults } from './search-results';

interface SearchPageProps {
  searchParams?: Promise<{ q?: string }>;  // searchParams is a Promise now
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q || '';

  return (
    <section className="container py-6">
      <h1 className="text-2xl font-semibold mb-4">
        Search Results for &quot;{query}&quot;
      </h1>
      <Suspense fallback={<p>Loading...</p>}>
        <SearchResults query={query} />
      </Suspense>
    </section>
  );
}
