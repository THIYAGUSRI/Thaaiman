import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../Components/Common Components/Header';
import Carousel_Slider from '../Components/Home Components/Carousel_Slider';
import Featured_Slide from '../Components/Home Components/Featured_Slide';
import Category from '../Components/Common Components/Category';
import ProductCard from '../Components/Home Components/ProductCard';

export default function Home() {
  // Access the currentUser from the Redux store
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  console.log('Current User:', currentUser);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/products');
        const data = await response.json();
        console.log('Home.js: Products fetched:', data);
        setProducts(data);
      } catch (error) {
        console.error('Home.js: Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleViewMore = () => {    
    navigate('/products');
  };

  return (
    <>
      <div className='pb-8'>
        <Header />
        <Carousel_Slider />
        <Category />
        <h1 className="text-center text-5xl font-bold mb-8">Product</h1>
        <ProductCard products={products.slice(0, 8)} />
        <div className="flex justify-center mt-8">
          <button
            className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-2.5 text-white font-medium text-lg transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 active:scale-95"
            onClick={handleViewMore}
          >
            View More
          </button>
        </div>
      </div>
    </>
  );
}