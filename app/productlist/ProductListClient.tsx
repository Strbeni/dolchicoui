// 'use client';

// import { useEffect, useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import MultiSelect from '@/components/ui/multi-select';
// import ColorFilter from './ColorFilter';
// import PriceFilter from './PriceFilter';
// import { useSearchParams } from 'next/navigation';
// import { Heart, ShoppingCart } from 'lucide-react';

// interface Product {
// 	id: number;
// 	name: string;
// 	description: string;
// 	price: number;
// 	image: string[];
// 	category: string;
// 	subCategory: string;
// 	sizes: string[];
// 	color?: string[];
// }

// export default function ProductListClient() {
// 	const [products, setProducts] = useState<Product[]>([]);
// 	const [loading, setLoading] = useState(true);
// 	const [error, setError] = useState('');
// 	const [selected, setSelected] = useState<string[]>([]);
// 	const [isLoading] = useState(false);
// 	const [selectedColors, setSelectedColors] = useState<string[]>([]);
// 	const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);

// 	const searchParams = useSearchParams();
// 	const searchQuery = searchParams.get('q') || '';

// 	const frameworks = [
// 		{ label: 'Next.js', value: 'nextjs' },
// 		{ label: 'React', value: 'react' },
// 		{ label: 'Vue.js', value: 'vue' },
// 	];

// 	const sizes = ['S', 'M', 'L', 'XL'];
// 	const colorOptions = [
// 		{ name: 'Red', hex: '#f87171', count: 10 },
// 		{ name: 'Blue', hex: '#60a5fa', count: 7 },
// 		{ name: 'Green', hex: '#34d399', count: 5 },
// 		{ name: 'Yellow', hex: '#facc15', count: 3 },
// 		{ name: 'Purple', hex: '#a78bfa', count: 4 },
// 	];

// 	useEffect(() => {
// 		const timeoutId = setTimeout(() => {
// 			const fetchProducts = async () => {
// 				setLoading(true);
// 				setError('');

// 				try {
// 					const endpoint = searchQuery
// 						? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product/search?q=${encodeURIComponent(searchQuery)}`
// 						: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product/list`;

// 					const res = await fetch(endpoint);
// 					const data = await res.json();

// 					if (res.ok && data.success) {
// 						const filteredProducts = data.products.filter((product: Product) => {
// 							const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
// 							const matchesColor = selectedColors.length === 0 || selectedColors.some(color => product.color?.includes(color));
// 							return matchesPrice && matchesColor;
// 						});
// 						setProducts(filteredProducts);
// 					} else {
// 						throw new Error('Invalid response structure');
// 					}
// 				} catch {
// 					setError('Failed to load products');
// 				} finally {
// 					setLoading(false);
// 				}
// 			};

// 			fetchProducts();
// 		}, 300);

// 		return () => clearTimeout(timeoutId);
// 	}, [searchQuery, priceRange, selectedColors]);

// 	return (
// 		<div className="px-6 lg:px-20 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
// 			{/* Filters */}
// 			<div className="space-y-6 px-6">
// 				<h1 className="text-3xl font-bold">ALL PRODUCTS</h1>

// 				{/* Sizes */}
// 				<div>
// 					<MultiSelect
// 						options={frameworks}
// 						value={selected}
// 						onChange={setSelected}
// 						placeholder="Select frameworks..."
// 						isLoading={isLoading}
// 					/>
// 					<p className="font-semibold mb-2">Size</p>
// 					<div className="flex gap-2 flex-wrap">
// 						{sizes.map(size => (
// 							<button key={size} className="border px-3 py-1 text-sm hover:bg-black hover:text-white">
// 								{size}
// 							</button>
// 						))}
// 					</div>
// 				</div>

// 				<ColorFilter colors={colorOptions} selectedColors={selectedColors} onChange={setSelectedColors} />
// 				<PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
// 			</div>

// 			{/* Product Grid */}
// 			<div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
// 				{searchQuery && (
// 					<p className="text-sm text-gray-500 mb-4">
// 						Showing results for <span className="font-semibold">&quot;{searchQuery}&quot;</span>
// 					</p>
// 				)}

// 				{loading && <p>Loading products...</p>}
// 				{error && <p className="text-red-600">{error}</p>}

// 				{!loading && !error && products.length === 0 && (
// 					<p className="text-gray-500 col-span-full">No products found in this price range.</p>
// 				)}

// 				{!loading && !error && products.map(product => (
// 					// <div key={product.id} className="space-y-2 group">
// 					// 	<Link href={`/productdetail/${product.id}`}>
// 					// 		<div className="relative aspect-[3/4] overflow-hidden cursor-pointer">
// 					// 			<Image
// 					// 				src={product.image?.[0] || '/placeholder.png'}
// 					// 				alt={product.name}
// 					// 				width={300}
// 					// 				height={400}
// 					// 				className="object-cover w-full h-full"
// 					// 			/>
// 					// 			<button className="absolute inset-0 bg-opacity-30 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
// 					// 				Quick View
// 					// 			</button>
// 					// 		</div>
// 					// 	</Link>
// 					// 	<h3 className="font-medium text-sm">{product.name}</h3>
// 					// 	<p className="text-sm text-gray-800">₹{product.price}</p>
// 					// 	<div className="flex gap-1 mt-1">
// 					// 		{product.sizes?.map((size, i) => (
// 					// 			<span key={i} className="text-xs border px-2 py-0.5 rounded bg-gray-100">{size}</span>
// 					// 		))}
// 					// 	</div>
// 					// 	<Heart className="w-5 h-5 cursor-pointer" />
// 					// 	<Link href="/cartpage">
// 					// 		<ShoppingCart className="w-5 h-5 cursor-pointer" />
// 					// 	</Link>

// 					// </div>
// 					<div key={product.id} className="space-y-2 group">
// 						<div className="relative aspect-[3/4] overflow-hidden cursor-pointer">
// 							<Link href={`/productdetail/${product.id}`}>
// 								<Image
// 									src={product.image?.[0] || '/placeholder.png'}
// 									alt={product.name}
// 									width={300}
// 									height={400}
// 									className="object-cover w-full h-full"
// 								/>
// 								<button className="absolute inset-0 bg-black bg-opacity-30 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
// 									Quick View
// 								</button>
// 							</Link>
// 							{/* Heart icon at top-right corner */}
// 							<Heart className="absolute top-2 right-2 w-5 h-5 text-white bg-black bg-opacity-50 rounded-full p-1 cursor-pointer" />
// 						</div>

// 						<h3 className="font-medium text-sm">{product.name}</h3>
// 						<p className="text-sm text-gray-800">₹{product.price}</p>

// 						{/* Sizes and cart icon in a row */}
// 						<div className="flex items-center justify-between mt-1">
// 							<div className="flex gap-1">
// 								{product.sizes?.map((size, i) => (
// 									<span key={i} className="text-xs border px-2 py-0.5 rounded bg-gray-100">
// 										{size}
// 									</span>
// 								))}
// 							</div>
// 							<Link href="/cartpage">
// 								<ShoppingCart className="w-5 h-5 cursor-pointer" />
// 							</Link>
// 						</div>
// 					</div>

// 				))}
// 			</div>
// 		</div>
// 	);
// }

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MultiSelect from '@/components/ui/multi-select';
import ColorFilter from './ColorFilter';
import PriceFilter from './PriceFilter';
import { useSearchParams } from 'next/navigation';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/contexts/WishlistContext';

interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	image: string[];
	category: string;
	subCategory: string;
	sizes: string[];
	color?: string[];
}

export default function ProductListClient() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [selected, setSelected] = useState<string[]>([]);
	const [isLoading] = useState(false);
	const [selectedColors, setSelectedColors] = useState<string[]>([]);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);

	const searchParams = useSearchParams();
	const searchQuery = searchParams.get('q') || '';

	const { addToCart } = useCart();
	const router = useRouter();
	const { addToWishlist } = useWishlist();

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			const fetchProducts = async () => {
				setLoading(true);
				setError('');

				try {
					const endpoint = searchQuery
						? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product/search?q=${encodeURIComponent(searchQuery)}`
						: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product/list`;

					const res = await fetch(endpoint);
					const data = await res.json();

					if (res.ok && data.success) {
						const filteredProducts = data.products.filter((product: Product) => {
							const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
							const matchesColor =
								selectedColors.length === 0 ||
								selectedColors.some(color => product.color?.includes(color));
							return matchesPrice && matchesColor;
						});
						setProducts(filteredProducts);
					} else {
						throw new Error('Invalid response structure');
					}
				} catch {
					setError('Failed to load products');
				} finally {
					setLoading(false);
				}
			};

			fetchProducts();
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, priceRange, selectedColors]);

	const handleAddToCart = () => {
		addToCart();
		router.push('/cartpage');
	};

	return (
		<div className="px-6 lg:px-20 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
			{/* Filters */}
			<div className="space-y-6 px-6">
				<h1 className="text-3xl font-bold">ALL PRODUCTS</h1>

				<div>
					<MultiSelect
						options={[
							{ label: 'Next.js', value: 'nextjs' },
							{ label: 'React', value: 'react' },
							{ label: 'Vue.js', value: 'vue' },
						]}
						value={selected}
						onChange={setSelected}
						placeholder="Select frameworks..."
						isLoading={isLoading}
					/>

					<p className="font-semibold mb-2">Size</p>
					<div className="flex gap-2 flex-wrap">
						{['S', 'M', 'L', 'XL'].map(size => (
							<button key={size} className="border px-3 py-1 text-sm hover:bg-black hover:text-white">
								{size}
							</button>
						))}
					</div>
				</div>

				<ColorFilter colors={[
					{ name: 'Red', hex: '#f87171', count: 10 },
					{ name: 'Blue', hex: '#60a5fa', count: 7 },
					{ name: 'Green', hex: '#34d399', count: 5 },
					{ name: 'Yellow', hex: '#facc15', count: 3 },
					{ name: 'Purple', hex: '#a78bfa', count: 4 },
				]} selectedColors={selectedColors} onChange={setSelectedColors} />

				<PriceFilter priceRange={priceRange} setPriceRange={setPriceRange} />
			</div>

			{/* Product Grid */}
			<div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{searchQuery && (
					<p className="text-sm text-gray-500 mb-4">
						Showing results for <span className="font-semibold">&quot;{searchQuery}&quot;</span>
					</p>
				)}

				{loading && <p>Loading products...</p>}
				{error && <p className="text-red-600">{error}</p>}

				{!loading && !error && products.length === 0 && (
					<p className="text-gray-500 col-span-full">No products found in this price range.</p>
				)}

				{!loading && !error && products.map(product => (
					<div key={product.id} className="space-y-2 group">
						<div className="relative aspect-[3/4] overflow-hidden cursor-pointer">
							<Link href={`/productdetail/${product.id}`}>
								<Image
									src={product.image?.[0] || '/placeholder.png'}
									alt={product.name}
									width={300}
									height={400}
									className="object-cover w-full h-full"
								/>
								<button className="absolute inset-0 bg-black bg-opacity-30 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
									Quick View
								</button>
							</Link>
							{/* <Heart className="absolute top-2 right-2 w-5 h-5 text-white bg-black bg-opacity-50 rounded-full p-1 cursor-pointer" /> */}
							<Heart
  onClick={addToWishlist}
  className="absolute top-2 right-2 w-5 h-5 text-white bg-black bg-opacity-50 rounded-full p-1 cursor-pointer hover:scale-110 transition"
/>

						</div>

						<h3 className="font-medium text-sm">{product.name}</h3>
						<p className="text-sm text-gray-800">₹{product.price}</p>

						<div className="flex items-center justify-between mt-1">
							<div className="flex gap-1">
								{product.sizes?.map((size, i) => (
									<span key={i} className="text-xs border px-2 py-0.5 rounded bg-gray-100">
										{size}
									</span>
								))}
							</div>
							<ShoppingCart onClick={handleAddToCart} className="w-5 h-5 cursor-pointer" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
