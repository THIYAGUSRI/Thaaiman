import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Category() {
    const [categories, setCategories] = useState([]);
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
                // Take only first 5 categories
                const filteredCategories = data
                    .filter(item => item.categoryName && typeof item.categoryName === 'string')
                    .slice(0, 5);
                setCategories(filteredCategories);
            } catch (error) {
                console.error('Category.jsx: Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const getImageUrl = (imgPath) => {
        if (!imgPath) return '/Uploads/default-image.jpg';
        const normalizedPath = imgPath.replace(/\\/g, '/');
        return normalizedPath.startsWith('http') ? normalizedPath : `/uploads/${normalizedPath}`;
    };

    const handleCategoryClick = (category) => {
        navigate('/products', { state: { selectedCategory: category.categoryName } });
    };

    return (
        <div className="w-full mx-auto py-20 px-4">
            <div className="flex flex-col items-center justify-center">
                {/* Flex container that centers 5 items */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 w-full max-w-7xl">
                    {categories.map((category, index) => (
                        <div
                            key={category._id || `category-${index}`}
                            className="flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
                            style={{
                                flex: '0 0 auto',
                                width: 'calc(50% - 1rem)', // 2 items per row on mobile
                            }}
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category.active !== false ? (
                                <>
                                    {/* Responsive Image Container - INCREASED SIZE */}
                                    <div className="
                                        w-30 h-30          
                                        sm:w-35 sm:h-35   
                                        md:w-40 md:h-40    
                                        lg:w-45 lg:h-45    
                                        xl:w-50 xl:h-50    
                                        rounded-full 
                                        bg-gradient-to-br from-gray-100 to-gray-200 
                                        flex items-center justify-center 
                                        overflow-hidden 
                                        shadow-xl         
                                        border-4 border-white
                                        hover:shadow-2xl    
                                        transition-shadow duration-300
                                    ">
                                        <img
                                            src={getImageUrl(category.image)}
                                            alt={category.categoryName}
                                            className="w-full h-full object-cover p-2" /* Increased padding */
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/Uploads/default-image.jpg';
                                            }}
                                        />
                                    </div>

                                    {/* Category Name - Adjusted for larger image */}
                                    <div className="mt-4 md:mt-5 lg:mt-6 text-center px-2 max-w-full">
                                        <h2 className="
                                            font-bold 
                                            text-sm 
                                            sm:text-base 
                                            md:text-lg 
                                            lg:text-xl
                                            xl:text-2xl     /* Added extra large */
                                            text-gray-800 
                                            truncate 
                                            hover:text-blue-600 
                                            transition-colors 
                                            duration-200
                                        ">
                                            {category.categoryName || 'Unknown'}
                                        </h2>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    ))}
                </div>

                {/* For tablet and larger screens - show 5 items in one row */}
                <style>{`
                    @media (min-width: 768px) {
                        .flex-wrap > div {
                            width: calc(20% - 2rem) !important; /* 5 items per row */
                        }
                    }
                    
                    @media (min-width: 640px) and (max-width: 767px) {
                        .flex-wrap > div {
                            width: calc(33.333% - 1.5rem) !important; /* 3 items per row */
                        }
                    }
                    
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-8px); }
                    }
                    
                    .hover\\:scale-105:hover {
                        transform: scale(1.05);
                    }
                `}</style>
            </div>
        </div>
    );
}