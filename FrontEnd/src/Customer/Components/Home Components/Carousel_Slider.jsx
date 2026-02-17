import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function Carousel_Slider() {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();



  const titles = [
    'Organic Goodness, Delivered Fresh!',
    'Fresh Pure Organic!',
    'Clean Green At Doorstep!',
    'Pure Natural Organic.',
    'Organic Goodness, Delivered Fresh!'
  ];

  const images = [
    'https://c4.wallpaperflare.com/wallpaper/246/250/567/macro-cinnamon-spoon-depth-of-field-wallpaper-preview.jpg',
    'https://c4.wallpaperflare.com/wallpaper/315/739/723/berry-grape-fruit-food-wallpaper-preview.jpg',
    'https://c4.wallpaperflare.com/wallpaper/1007/982/548/fruits-fruit-apple-banana-wallpaper-preview.jpg',
    'https://c4.wallpaperflare.com/wallpaper/506/803/781/strawberries-raspberries-blueberries-blackberries-fruits-wallpaper-preview.jpg',
    'https://c4.wallpaperflare.com/wallpaper/246/250/567/macro-cinnamon-spoon-depth-of-field-wallpaper-preview.jpg',
  ];

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/categorys');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Filter active categories and take first 5
        const activeCategories = data
          .filter(item => item.categoryName && typeof item.categoryName === 'string' && item.active !== false)
          .slice(0, 5)
          .map(item => item.categoryName);
        setCategories(activeCategories);
      } catch (error) {
        console.error('Carousel_Slider.jsx: Error fetching categories:', error);
        // Fallback to static categories if API fails
        setCategories(['Vegetables', 'Seeds', 'Fruits', 'Oil', 'Grocery']);
      }
    };
    fetchCategories();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  // Handle next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  // Handle previous slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle pagination click
  const handlePaginationClick = (index) => {
    setCurrentSlide(index);
  };


  return (
  <div className="relative h-[400px] mt-30 overflow-hidden bg-black/10 z-20">
    {/* Slider */}
    <main className="relative h-full">
      {/* Image Slider */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-full h-full relative"
            >
              {/* Image */}
              <img
                src={img}
                alt={titles[index]}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                <h3
                  className={`text-white text-4xl font-bold ${
                    index === 1 || index === 3 ? "text-left" : "text-right"
                  }`}
                >
                  {titles[index]}
                </h3>
                {/* Shop Now Button */}
                <button
                  className="mt-8 px-4 py-2 bg-white text-black font-bold rounded-xl hover:bg-black hover:text-white transition-colors duration-300"
                  onClick={() => categories[index] && navigate("/products", { state: { selectedCategory: categories[index] } })}
                  disabled={!categories[index]}
                >
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex space-x-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => handlePaginationClick(index)}
              className={`w-8 h-2 transition-all duration-300 rounded-lg ${
                currentSlide === index
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 font-extrabold text-white text-6xl opacity-75 hover:opacity-100 transition-opacity duration-300"
      >
        ←
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 font-extrabold text-white text-6xl opacity-75 hover:opacity-100 transition-opacity duration-300"
      >
        →
      </button>
    </main>

    {/* Play/Pause Button */}
    <button
      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
      className="absolute top-4 right-4 z-10 text-white bg-black/50 px-4 py-2 rounded-full hover:bg-black/75 transition-colors duration-300"
    >
      {isAutoPlaying ? "Pause" : "Play"}
    </button>
  </div>
);

};
