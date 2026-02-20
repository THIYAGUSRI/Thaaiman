import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../Components/Common Components/Header';
import ProductCard from '../Components/Home Components/ProductCard';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';

export default function Product() {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [showCategories, setShowCategories] = useState(false); // Closed by default on mobile/tablet
    const [categoryMap, setCategoryMap] = useState({});
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const categoryResponse = await fetch('/categorys');
                if (!categoryResponse.ok) {
                    throw new Error(`Category fetch error: ${categoryResponse.status}`);
                }
                const categoryData = await categoryResponse.json();
                console.log('Product.js: Categories fetched:', categoryData);
                setCategory(categoryData);
                const catMap = categoryData.reduce((map, item) => {
                    if (item.id && item.categoryName) {
                        map[item.id] = item.categoryName;
                    }
                    return map;
                }, {});
                setCategoryMap(catMap);                
                console.log('Product.js: Category map:', catMap);

                // Fetch products
                const productResponse = await fetch('/products');
                if (!productResponse.ok) {
                    throw new Error(`Product fetch error: ${productResponse.status}`);
                }
                const productData = await productResponse.json();
                console.log('Product.js: Products fetched:', productData);
                setProducts(productData);
            } catch (error) {
                console.error('Product.js: Error fetching data:', error);
            }
        };
        fetchData();

        if (location.state?.selectedCategory) {
            setShowCategories(true);
            setSelectedCategory([location.state.selectedCategory]);
        }
    }, [location.state]);

    const handleCategoryChange = (catName) => {
        if (selectedCategory.includes(catName)) {
            setSelectedCategory(selectedCategory.filter(c => c !== catName));
        } else {
            setSelectedCategory([...selectedCategory, catName]);
        }
    };

    const toggleCategories = () => {
        setShowCategories(!showCategories);
    };

    const filteredProducts = selectedCategory.length > 0
        ? products.filter(product => {
            const categoryName = categoryMap[product.prod_category];
            const categoryObj = category.find(cat => cat.id === product.prod_category);
            const isCategoryActive = categoryObj ? categoryObj.active !== false : false;
            const isProductActive = product.prod_active === true;
            return categoryName && selectedCategory.includes(categoryName) && isCategoryActive && isProductActive;
        })
        : products.filter(product => {
            const categoryObj = category.find(cat => cat.id === product.prod_category);
            const isCategoryActive = categoryObj ? categoryObj.active !== false : false;
            const isProductActive = product.prod_active === true;
            return isCategoryActive && isProductActive;
        });

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

    return (
        <>
            <div className='pb-3'>
                <Header />
                <div className='flex mt-33  relative'>
                    {/* Original Laptop/Desktop Sidebar - Unchanged */}
                    <div className={`${showCategories ? 'w-1/6' : 'w-16'} transition-all duration-300  lg:flex lg:flex-col h-screen sticky top-0`} >
                        {showCategories ? (
                            <Drawer
                                variant="persistent"
                                anchor="left"
                                open={showCategories}
                                sx={{
                                    '& .MuiDrawer-paper': {
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        bgcolor: 'white',
                                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                        borderRadius: '0 8px 8px 0',
                                        top: 125,
                                        position: 'sticky',
                                        height: '100vh',
                                        backgroundColor: '#f9fafb',
                                        transition: 'all 0.3s ease-in-out',
                                    },
                                }}
                            >
                                <Box sx={{ width: '100%', height: '100%' }} role="presentation">
                                    <div className="flex justify-between items-center border-b border-gray-200 pt-3 pb-2 bg-green-500">
                                        <h2 className="text-2xl font-bold pl-3 text-white pr-5">Filter</h2>
                                        <IconButton onClick={toggleCategories} className="text-white mr-2">
                                            <FilterListIcon
                                                className="bg-white rounded-full p-1"
                                                sx={{ height: 40, width: 40, color: 'black' }}
                                            />
                                        </IconButton>
                                    </div>
                                    <Divider />
                                    <div className='bg-yellow-300/50 h-full'>
                                        <List sx={{ overflowY: 'auto' }}>
                                            {category.length > 0 ? (
                                                category.filter(cat => cat.active !== false).map((cat) => (
                                                    <ListItem key={cat.id} disablePadding sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <ListItemButton
                                                            sx={{ py: 1 }}
                                                            onClick={() => handleCategoryChange(cat.categoryName)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategory.includes(cat.categoryName)}
                                                                onChange={() => handleCategoryChange(cat.categoryName)}
                                                                className="mr-2 h-5 w-5"
                                                            />
                                                            <ListItemIcon sx={{ minWidth: 50 }}>
                                                                <img
                                                                    src={getImageUrl(cat.image)}
                                                                    alt={cat.categoryName}
                                                                    className="w-10 h-10 object-cover rounded-full"
                                                                />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={cat.categoryName}
                                                                sx={{ color: '#000', }}
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                ))
                                            ) : (
                                                <ListItem>
                                                    <ListItemText primary="No categories available" />
                                                </ListItem>
                                            )}
                                        </List>
                                    </div>
                                </Box>
                            </Drawer>
                        ) : (
                            <div className="lg:flex lg:flex-col items-center top-30 bg-yellow-300/50 shadow-md w-25 h-screen sticky hidden">
                                <div className='bg-green-500 mb-2 w-full flex justify-center py-2 rounded-tr-lg rounded-tl-lg'>
                                    <IconButton onClick={toggleCategories} className="bg-white mb-2">
                                        <FilterListIcon sx={{ height: 40, width: 40, color: 'black' }} className="bg-white rounded-full cursor-pointer hover:scale-105 transition-transform duration-300" />
                                    </IconButton>
                                </div>
                                <List sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
                                    {category.length > 0 ? (
                                        category.filter(cat => cat.active !== false).map((cat) => (
                                            <ListItem
                                                key={cat.id}
                                                sx={{ justifyContent: 'center' }}
                                                onClick={() => handleCategoryChange(cat.categoryName)}
                                            >
                                                <img
                                                    src={getImageUrl(cat.image)}
                                                    alt={cat.categoryName}
                                                    className={`w-17 h-17 object-cover rounded-full border border-gray-300 p-1 shadow-xl cursor-pointer hover:scale-105 transition-transform duration-200 ${selectedCategory.includes(cat.categoryName) ? 'bg-green-400' : 'bg-white'
                                                        }`}
                                                />
                                            </ListItem>
                                        ))
                                    ) : (
                                        <ListItem>
                                            <img
                                                src={getImageUrl(null)}
                                                alt="Default"
                                                className="w-17 h-17 object-cover rounded-full shadow-sm"
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </div>
                        )}
                    </div>

                    {/* Mobile & Tablet Only: Temporary Drawer */}
                    <Drawer
                        variant="persistent"
                        anchor="left"
                        open={showCategories}
                        onClose={toggleCategories}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: 'block', lg: 'none' },
                            '& .MuiDrawer-paper': {
                                width: '100%',
                                marginTop: '135px',
                                maxWidth: '300px',
                                bgcolor: '#facc15',
                                boxShadow: '0px 4px 10px rgba(0,0,0,0.2)',
                            },
                        }}
                    >
                        <Box>
                            <div className="flex justify-between items-center border-b border-gray-200 pt-3 pb-2 bg-green-500">
                                <h2 className="text-2xl font-bold pl-4 text-white">Filter</h2>
                                <IconButton onClick={toggleCategories} className="text-white mr-3">
                                    <FilterListIcon sx={{ height: 40, width: 40, color: 'black' }} className="bg-white rounded-full p-1" />
                                </IconButton>
                            </div>
                            <Divider />
                            <List>
                                {category.filter(cat => cat.active !== false).map((cat) => (
                                    <ListItem key={cat.id} disablePadding>
                                        <ListItemButton onClick={() => handleCategoryChange(cat.categoryName)}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCategory.includes(cat.categoryName)}
                                                onChange={() => handleCategoryChange(cat.categoryName)}
                                                className="mr-3 h-5 w-5 accent-green-600"
                                            />
                                            <ListItemIcon sx={{ minWidth: 45 }}>
                                                <img
                                                    src={getImageUrl(cat.image)}
                                                    alt={cat.categoryName}
                                                    className="w-10 h-10 object-cover rounded-full"
                                                />
                                            </ListItemIcon>
                                            <ListItemText primary={cat.categoryName} sx={{ color: '#000' }} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Drawer>

                    {/* Main Content Area - Adjusted for all devices */}
                    <div className={`${showCategories ? 'lg:w-5/6' : 'lg:w-11/12 lg:ml-28'} w-full transition-all duration-300`}>
                        {filteredProducts.length > 0 ? (
                            <ProductCard products={filteredProducts} />
                        ) : (
                            <div className="flex items-center justify-center">
                                <p className="text-gray-500 text-lg">No products found.</p>
                            </div>
                        )}
                    </div>

                    {/* Floating Filter Button - Only on Mobile & Tablet */}
                    <IconButton
                        onClick={toggleCategories}
                        sx={{
                            display: { xs: 'flex', lg: 'none' },
                            position: 'fixed',
                            bottom: { xs: 16, sm: 24 },
                            left: { xs: 16, sm: 24 },
                            bgcolor: '#38a169',
                            color: 'white',
                            zIndex: 1300,
                            width: { xs: 56, sm: 64 },
                            height: { xs: 56, sm: 64 },
                            '&:hover': { bgcolor: '#38a169' },
                            boxShadow: 4,
                        }}
                    >
                        <FilterListIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
                    </IconButton>
                </div>
            </div>

        </>
    );
}