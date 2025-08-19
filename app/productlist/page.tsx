
import { Suspense } from 'react';
import ProductListClient from './ProductListClient';
import PriceFilter from './PriceFilter';

export default function ProductListPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ProductListClient />
		</Suspense>
	);
}
