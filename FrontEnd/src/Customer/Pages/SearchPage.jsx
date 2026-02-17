import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../Components/Home Components/ProductCard.jsx'; // Adjust the import path based on your file structure
import Header from '../Components/Common Components/Header.jsx';

export default function SearchPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || ''; // Get query from URL
  const navigate = useNavigate();


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const queryLower = query.toLowerCase();
    if (queryLower && products.length > 0) {
      const filtered = products.filter((product) => {
        const nameMatch = product.prod_Name?.toLowerCase().includes(queryLower);
        const categoryMatch = product.prod_category?.toLowerCase().includes(queryLower);
        return nameMatch || categoryMatch;
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchParams, products, query]);

  const handleViewMore = () => {
    navigate('/products');
  };

  return (
    <>
      <Header />
      <div className="container mt-30 mx-auto px-4 py-8">
        <h1 className='font-bold text-4xl text-center text-gray-500'>Search Results for "{query}"</h1>
        {filteredProducts.length > 0 ? (
          <div>
            <ProductCard products={filteredProducts} />
            <div className="flex justify-center gap-5 mt-8">
              <button
                className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-2 text-white font-medium text-3xl text-center transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 active:scale-95 cursor-pointer"
                onClick={handleViewMore}
              >
                &lt;
              </button>
              <button
                className="rounded-lg bg-white px-6 py-2.5 text-black shadow-md shadow-amber-500 font-medium text-lg transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 active:scale-95 cursor-pointer"
                onClick={handleViewMore}
              >
                1
              </button>
                          
              <button
                className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-2 text-white font-medium text-3xl transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 active:scale-95 cursor-pointer"
                
              >
                &gt;
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600">No matching products found.</p>
        )}


      </div>
    </>
  );
}