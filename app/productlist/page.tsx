
import { Suspense } from 'react';
import ProductListClient from './ProductListClient';

export default function ProductListPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ProductListClient />
			
		</Suspense>
	);
}
