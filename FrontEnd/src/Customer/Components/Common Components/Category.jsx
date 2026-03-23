import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';

export default function Category() {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

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

    const getImageUrl = useCallback((imgPath) => {
        // Final fallback - a known working image or placeholder
        const FALLBACK = 'https://raw.githubusercontent.com/THIYAGUSRI/THAAIMAN/main/uploads/1765434787902-366029619.png';

        if (!imgPath || typeof imgPath !== 'string' || imgPath.trim() === '') {
            return FALLBACK;
        }

        const normalized = imgPath
            .replace(/\\/g, '/')           // fix any backslashes
            .replace(/^\/+/, '')           // remove leading slashes
            .trim();

        // If already a full URL, keep it (in case backend sends full link sometimes)
        if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
            return normalized;
        }

        // Build correct GitHub RAW URL
        const repoOwner = 'THIYAGUSRI';
        const repoName = 'THAAIMAN';
        const branch = 'main';
        const folder = 'uploads';

        // If path already includes "uploads/", don't duplicate it
        let finalPath = normalized;
        if (!normalized.toLowerCase().startsWith('uploads/')) {
            finalPath = `${folder}/${normalized}`;
        }

        return `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/${finalPath}`;
    }, []);

    const handleCategoryClick = (category) => {
        navigate('/products', { state: { selectedCategory: category.categoryName } });
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -scrollContainerRef.current.clientWidth,
                behavior: 'smooth'
            });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: scrollContainerRef.current.clientWidth,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full py-10 scrollbar">
            <div className="flex justify-center">
                <div className='flex mx-2 items-center justify-center cursor-pointer'>
                    <KeyboardDoubleArrowLeftIcon sx={{width: '40px', height: '40px', border: '1px solid #ccc', borderRadius: '50%', padding: '5px'}}  onClick={scrollLeft} />
                </div>
                {/* Flex container that centers 5 items */}
                <div 
                    ref={scrollContainerRef}
                    className="flex gap-2 px-2 scrollbar" 
                    style={{ maxWidth: '1440px', overflowX: 'auto', paddingBottom: '10px' }}
                >
                    {categories.map((category, index) => (
                        <div
                            key={category._id || `category-${index}`}
                            className="flex flex-col rounded-xl items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
                            onClick={() => handleCategoryClick(category)}
                        >
                            {category.active !== false ? (
                                <>
                                    {/* Responsive Image Container - INCREASED SIZE */}
                                    <div className="
                                        w-25 h-25                                                  
                                        rounded-full 
                                        bg-gradient-to-br from-gray-100 to-gray-200 
                                        flex items-center justify-center 
                                        overflow-hidden 
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
                                    <div className="text-center px-2 max-w-full">
                                        <h2
                                            className="
                                            font-lora
                                            font-bold
                                            text-sm
                                            text-gray-800 
                                            truncate 
                                            hover:text-yellow-600 
                                            transition-colors 
                                            duration-200
                                        "
                                        >
                                            {category.categoryName || 'Unknown'}
                                        </h2>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    ))}
                </div>
                <div className='flex mx-2 items-center justify-center cursor-pointer'>
                    <KeyboardDoubleArrowRightIcon sx={{width: '40px', height: '40px', border: '1px solid #ccc', borderRadius: '50%', padding: '5px'}} onClick={scrollRight} />
                </div>
            </div>
        </div>
    );
}