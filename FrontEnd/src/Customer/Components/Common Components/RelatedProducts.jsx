import React, { useEffect, useState } from 'react';
import ProductCard from '../Home Components/ProductCard.jsx';

export default function RelatedProducts({ productCategoryId, productName }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('RelatedProducts: error fetching products', err);
        setError(err.message || 'Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="py-8 text-center">Loading related products...</div>;
  if (error) return <div className="py-8 text-center text-red-600">Error: {error}</div>;

  // Filter 1: Get related products (same category, NOT current product)
  const relatedProducts = products.filter(product => {
    const sameCategory = productCategoryId && product.prod_category === productCategoryId;
    const notCurrentProduct = productName ? product.prod_Name !== productName : true;
    return sameCategory && notCurrentProduct;
  });

  // Filter 2: Get other products (different category, NOT current product)
  const otherProducts = products.filter(product => {
    const differentCategory = productCategoryId ? product.prod_category !== productCategoryId : true;
    const notCurrentProduct = productName ? product.prod_Name !== productName : true;
    return differentCategory && notCurrentProduct;
  });

  // Determine what to display - KEEPING YOUR EXACT LOGIC
  let productsToShow = [];
  let otherProductsToShow = [];
  let showRelatedTitle = false;
  let showOtherTitle = false;

  if (relatedProducts.length > 0) {
    // Case 1: We have filtered products
    showRelatedTitle = true;

    // Start with filtered products
    productsToShow = [...relatedProducts];

    // If we need more products to reach 4, add from other products
    if (otherProducts.length > 0) {
      const additionalProducts = otherProducts;
      otherProductsToShow = [...additionalProducts];
      showOtherTitle = true;
    }
  } else {
    // Case 2: No filtered products, show other products (excluding current if possible)
    showRelatedTitle = false;
    productsToShow = [...otherProducts];
  }

  if (productsToShow.length === 0 && otherProductsToShow.length === 0) {
    return <div className="py-8 text-center text-gray-500">No products found.</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center px-4 md:px-8 lg:px-16'>
      {/* Related Products Section */}
      {showRelatedTitle && (
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Related Products
          </h2>
          
          {/* FIXED: Grid container for responsive layout */}
          <div className="w-full flex flex-row">
            {productsToShow.map((product) => (          
              <div key={product.prod_ID} className="w-full">
                <ProductCard products={[product]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* People also bought Section */}
      {showOtherTitle && (
        <div className="mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            People also bought
          </h2>
          
          {/* FIXED: Grid container for responsive layout */}
          <div className="w-full flex flex-row">
            {otherProductsToShow.map((product) => (          
              <div key={product.prod_ID} className="w-full">
                <ProductCard products={[product]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* When no related products, show other products */}
      {!showRelatedTitle && productsToShow.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            You may also like
          </h2>
          
          {/* FIXED: Grid container for responsive layout */}
          <div className="flex flex-wrap justify-center gap-4">
            {productsToShow.map((product) => (          
              <div key={product.prod_ID} className="w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)]">
                <ProductCard products={[product]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}