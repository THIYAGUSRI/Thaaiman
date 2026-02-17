import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Category() {
    const [categories, setCategories] = useState([]);
    const sliderRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/categorys');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Category.jsx: Raw category data:', data);
                // Store the full category objects, not just names
                setCategories(data.filter(item => item.categoryName && typeof item.categoryName === 'string'));
            } catch (error) {
                console.error('Category.jsx: Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleScroll = (direction) => {
        const slider = sliderRef.current;
        if (!slider) return;

        const scrollAmount = slider.offsetWidth / 3;
        if (direction === 'left') {
            slider.scrollLeft -= scrollAmount;
            if (slider.scrollLeft <= 0) {
                slider.scrollLeft = slider.scrollWidth - slider.offsetWidth;
            }
        } else {
            slider.scrollLeft += scrollAmount;
            if (slider.scrollLeft >= slider.scrollWidth - slider.offsetWidth) {
                slider.scrollLeft = 0;
            }
        }
    };

    const getImageUrl = (imgPath) => {
        if (!imgPath) return '/Uploads/default-image.jpg';
        const normalizedPath = imgPath.replace(/\\/g, '/');
        return normalizedPath.startsWith('http') ? normalizedPath : `/uploads/${normalizedPath}`;
    };

    const handleCategoryClick = (category) => {
        navigate('/products', { state: { selectedCategory: category.categoryName } });
    };

    return (
        <div className="w-full mx-auto px-4 py-8">
            <div className="relative">
                {/* Navigation Buttons - Hide on mobile */}
                <button
                    onClick={() => handleScroll('left')}
                    className="hidden md:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
                    aria-label="Scroll left"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={() => handleScroll('right')}
                    className="hidden md:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
                    aria-label="Scroll right"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Category Slider */}
                <div
                    ref={sliderRef}
                    className="flex overflow-x-auto scroll-smooth gap-4 md:gap-6 lg:gap-8 px-2 py-4 scrollbar-hide"
                >
                    {categories.map((category, index) => (
                        <div
                            key={category._id || `category-${index}`}
                            className="flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-105"
                            onClick={() => handleCategoryClick(category)}
                        >
                            <div className="flex flex-col items-center w-28 h-36 sm:w-32 sm:h-40 md:w-40 md:h-44 lg:w-44 lg:h-48">
                                {/* Image Container */}
                                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-white">
                                    <img
                                        src={getImageUrl(category.image)}
                                        alt={category.categoryName}
                                        className="w-full h-full object-cover p-1 hover:scale-110 transition-transform duration-300"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/Uploads/default-image.jpg';
                                        }}
                                    />
                                </div>
                                
                                {/* Category Name */}
                                <div className="mt-4 text-center w-full px-2">
                                    <h2 className="font-semibold text-sm sm:text-base md:text-lg text-gray-800 truncate hover:text-blue-600 transition-colors duration-200">
                                        {category.categoryName || 'Unknown'}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Navigation Dots - Only show if there are many categories */}
                {categories.length > 5 && (
                    <div className="flex justify-center mt-6 space-x-2 md:hidden">
                        {Array.from({ length: Math.min(5, Math.ceil(categories.length / 2)) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    const slider = sliderRef.current;
                                    if (slider) {
                                        const itemWidth = slider.children[0]?.offsetWidth || 120;
                                        const gap = 16; // gap-4 = 16px
                                        slider.scrollLeft = index * 2 * (itemWidth + gap); // Scroll 2 items at a time
                                    }
                                }}
                                className="w-2 h-2 rounded-full bg-gray-300 hover:bg-blue-500 transition-colors duration-200"
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Custom CSS */}
            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                
                .hover\\:scale-105:hover {
                    transform: scale(1.05);
                }
                
                /* Responsive adjustments */
                @media (max-width: 640px) {
                    .flex-col {
                        padding: 0 8px;
                    }
                }
            `}</style>
        </div>
    );
}