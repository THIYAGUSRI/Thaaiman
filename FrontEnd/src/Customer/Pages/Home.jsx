import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Common Components/Header';
import Carousel_Slider from '../Components/Home Components/Carousel_Slider';
import Category from '../Components/Common Components/Category';
import ProductCard from '../Components/Home Components/ProductCard';

export default function Home() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('Current User:', currentUser);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/getproducts', {
          method: 'GET',
          credentials: 'include',          // Important: sends cookies/session if backend uses them
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Home.js → Products fetched:', data);

        // Make sure we always set an array (even if backend sends null/undefined)
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Home.js → Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Optional: if products should refresh when user logs in/out
    // you can add currentUser as dependency: }, [currentUser]);
    // But usually once on mount is enough → }, []);

  }, []); // ← runs once when component mounts

  const handleViewMore = () => {
    navigate('/products');
  };

  return (
    <>
      <div className="pb-8">
        <Header />
        <Carousel_Slider />
        <Category />

        <h1 className="text-center text-5xl font-bold mb-8">Products</h1>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-yellow-500"></div>
            <p className="mt-6 text-lg text-gray-600 font-medium">
              Loading products...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-16 px-4">
            <div className="text-red-600 text-xl font-semibold mb-4">
              Oops! Something went wrong
            </div>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products + View More */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-600 text-lg">
                No products available at the moment.
              </div>
            ) : (
              <>
                <ProductCard products={products.slice(0, 8)} />

                {products.length > 8 && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={handleViewMore}
                      className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-8 py-3.5 text-white font-semibold text-lg shadow-md hover:from-yellow-500 hover:to-yellow-700 hover:shadow-lg active:scale-95 transition-all duration-300"
                    >
                      View More Products 
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}