
import { Suspense } from 'react';
import ProductListClient from './ProductListClient';

interface ProductListPageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductListPage({ searchParams }: ProductListPageProps) {
	const resolvedSearchParams = await searchParams;

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ProductListClient searchParams={resolvedSearchParams} />
		</Suspense>
	);
}
