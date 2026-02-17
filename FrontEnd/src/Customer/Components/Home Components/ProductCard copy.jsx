import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, updateCartItem, fetchCart, clearCart } from '../../../redux/cart/cartSlice';
import { fetchWhistlist, addToWhistlist, removeFromWhistlist, setWhistlistPopup, clearWhistlistMessage } from '../../../redux/whistlist/whistlistSlice';
import AddIcon from '@mui/icons-material/Add';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import { Tooltip } from '@mui/material';

export default function ProductCard({ products, onWishlistItemRemoved, disableWishlistFetch = false }) {
    const [selectedRates, setSelectedRates] = useState({});
    const [categoryMap, setCategoryMap] = useState({});
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);
    const currentUser = useSelector((state) => state.user.currentUser);
    const userId = currentUser?.userID;

    // Get wishlist state from Redux
    const whistlist = useSelector((state) => state.whistlist.items);
    const wishlistLoading = useSelector((state) => state.whistlist.loading);
    const wishlistMessage = useSelector((state) => state.whistlist.message);
    const wishlistError = useSelector((state) => state.whistlist.error);
    const popupCoords = useSelector((state) => state.whistlist.popupCoords);
    const popupProductId = useSelector((state) => state.whistlist.popupProductId);

    const popupRef = useRef(null);

    // Only fetch wishlist if not disabled (for WishList page)
    useEffect(() => {
        if (userId && !disableWishlistFetch) {
            console.log('ProductCard.js: Fetching wishlist for userId:', userId);
            dispatch(fetchWhistlist(userId));
        }
    }, [dispatch, userId, disableWishlistFetch]);

    // Auto-clear message after 1.5 seconds
    useEffect(() => {
        if (wishlistMessage || wishlistError) {
            const timer = setTimeout(() => {
                dispatch(clearWhistlistMessage());
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [wishlistMessage, wishlistError, dispatch]);

    // Fetch categories and initialize rates - RUNS ONCE
    useEffect(() => {
        if (isInitialized || !products.length) return;
        
        console.log('ProductCard.js: Initializing component');

        const fetchCategories = async () => {
            try {
                const response = await fetch('/categorys');
                if (!response.ok) {
                    throw new Error(`Category fetch error: ${response.status}`);
                }
                const data = await response.json();
                const catMap = data.reduce((map, item) => {
                    if (item.id && item.categoryName) {
                        map[item.id] = item.categoryName;
                    }
                    return map;
                }, {});
                setCategoryMap(catMap);
                console.log('ProductCard.js: Category map loaded');
            } catch (error) {
                console.error('ProductCard.js: Error fetching categories:', error);
            }
        };
        
        fetchCategories();

        const initRates = {};
        products.forEach((prod) => {
            const cartItem = cartItems.find((item) => item.prod_ID === prod.prod_ID);
            if (cartItem && cartItem.selectedRate && !isNaN(Number(cartItem.selectedRate.value)) && cartItem.selectedRate.key) {
                initRates[prod.prod_ID] = cartItem.selectedRate;
            } else {
                if (prod.prod_Rate && Array.isArray(prod.prod_Rate) && prod.prod_Rate.length > 0) {
                    const validRate = prod.prod_Rate.find(rateObj => {
                        if (!rateObj || typeof rateObj !== 'object') return false;
                        const keys = Object.keys(rateObj);
                        return keys.length === 1 && !isNaN(Number(rateObj[keys[0]])) && rateObj[keys[0]] !== null;
                    });
                    if (validRate) {
                        const firstKey = Object.keys(validRate)[0];
                        initRates[prod.prod_ID] = { key: firstKey, value: Number(validRate[firstKey]) };
                    } else {
                        initRates[prod.prod_ID] = { key: 'default', value: 0 };
                    }
                } else {
                    initRates[prod.prod_ID] = { key: 'default', value: 0 };
                }
            }
        });
        
        setSelectedRates(initRates);
        setIsInitialized(true);
        
        console.log('ProductCard.js: Initialization complete');

    }, [products, cartItems, isInitialized]); // Removed userId from dependencies

    // Fetch cart only once when userId changes
    useEffect(() => {
        if (userId && !isInitialized) {
            console.log(`ProductCard.js: Dispatching fetchCart for userId: ${userId}`);
            dispatch(fetchCart(userId));
        }
    }, [dispatch, userId, isInitialized]); // Added isInitialized to prevent multiple calls

    useEffect(() => {
        if (!currentUser) {
            console.log('ProductCard.js: User logged out, clearing cart and resetting selectedRates');
            dispatch(clearCart());
            setSelectedRates({});
            setIsInitialized(false);
        }
    }, [currentUser, dispatch]);

    // ADD TO WISHLIST
    const handleAddToWhistList = useCallback(async (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.currentTarget;

        try {
            const rect = btn.getBoundingClientRect();
            dispatch(setWhistlistPopup({
                coords: { x: rect.left + rect.width / 2, y: rect.top + window.scrollY },
                productId: product.prod_ID,
            }));

            console.log('Adding to wishlist:', { userId, productId: product.prod_ID });

            await dispatch(addToWhistlist({
                userId,
                productId: product.prod_ID
            })).unwrap();

            window.dispatchEvent(new Event('wishlistUpdated'));
        } catch (err) {
            console.error('Failed to add to wishlist:', err);
            dispatch(setWhistlistPopup({
                coords: {
                    x: btn.getBoundingClientRect().left + btn.getBoundingClientRect().width / 2,
                    y: btn.getBoundingClientRect().top + window.scrollY
                },
                productId: product.prod_ID,
            }));
        }
    }, [dispatch, userId]);

    // REMOVE FROM WISHLIST
    const handleRemoveFromWhistList = useCallback(async (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.currentTarget;

        const itemToRemove = whistlist.find(item => item.product_id === product.prod_ID);
        if (!itemToRemove) return;

        try {
            const rect = btn.getBoundingClientRect();
            dispatch(setWhistlistPopup({
                coords: { x: rect.left + rect.width / 2, y: rect.top + window.scrollY },
                productId: product.prod_ID,
            }));

            await dispatch(removeFromWhistlist({
                token,
                userId,
                itemId: itemToRemove.id
            })).unwrap();

            window.dispatchEvent(new Event('wishlistUpdated'));

            if (onWishlistItemRemoved) {
                onWishlistItemRemoved(product.prod_ID);
            }
        } catch (err) {
            console.error('Failed to remove from wishlist:', err);
        }
    }, [dispatch, userId, whistlist, onWishlistItemRemoved]);

    // Add to Cart function
    const handleAddToCart = useCallback((product) => {
        if (!userId) {
            console.log('ProductCard.js: No user logged in, cannot add to cart');
            window.location.href = '/login';
            return;
        }
        
        if (!product.prod_Rate || !Array.isArray(product.prod_Rate) || product.prod_Rate.length === 0) {
            console.warn(`ProductCard.js: Cannot add to cart, invalid prod_Rate for prod_ID: ${product.prod_ID}`);
            return;
        }
        
        const selectedRate = selectedRates[product.prod_ID] || {
            key: Object.keys(product.prod_Rate[0])[0],
            value: Number(Object.values(product.prod_Rate[0])[0]),
        };
        
        const image = product.prod_Images && product.prod_Images[0]?.image
            ? product.prod_Images[0].image.replace(/\\/g, '/')
            : 'default-image.jpg';

        dispatch(addToCart({
            userId,
            prod_ID: product.prod_ID,
            quantity: 1,
            selectedRate,
            prod_Name: product.prod_Name || 'Unknown Product',
            image,
            prod_Rate: product.prod_Rate,
            prod_category: categoryMap[product.prod_category] || product.prod_category,
        }));
    }, [dispatch, userId, selectedRates, categoryMap]);

    const handleIncrease = useCallback((prod_ID) => {
        const item = cartItems.find((item) => item.prod_ID === prod_ID);
        if (item) {
            dispatch(updateCartItem({ userId, prod_ID, quantity: item.quantity + 1 }));
        }
    }, [dispatch, userId, cartItems]);

    const handleDecrease = useCallback((prod_ID) => {
        const item = cartItems.find((item) => item.prod_ID === prod_ID);
        if (item && item.quantity > 0) {
            dispatch(updateCartItem({ userId, prod_ID, quantity: item.quantity - 1 }));
        }
    }, [dispatch, userId, cartItems]);

    const handleRateChange = useCallback((id, selectedKey) => {
        const product = products.find((p) => p.prod_ID === id);
        if (!product.prod_Rate || !Array.isArray(product.prod_Rate) || product.prod_Rate.length === 0) {
            setSelectedRates(prev => ({ ...prev, [id]: { key: 'default', value: 0 } }));
            return;
        }
        
        const matchedRate = product.prod_Rate.find((rateObj) => {
            if (!rateObj || typeof rateObj !== 'object') return false;
            return Object.keys(rateObj)[0] === selectedKey;
        });
        
        const value = matchedRate ? Number(matchedRate[selectedKey]) : Number(Object.values(product.prod_Rate[0])[0]);
        const newSelectedRate = { key: selectedKey, value };
        
        setSelectedRates(prev => ({ ...prev, [id]: newSelectedRate }));

        const item = cartItems.find((item) => item.prod_ID === id);
        if (item) {
            dispatch(updateCartItem({
                userId,
                prod_ID: id,
                quantity: item.quantity,
                selectedRate: newSelectedRate
            }));
        }
    }, [dispatch, userId, products, cartItems]);

    const getImageUrl = useCallback((imgPath) => {
        if (!imgPath) return '/uploads/default-image.jpg';
        const normalizedPath = imgPath.replace(/\\/g, '/');
        return normalizedPath.startsWith('http') ? normalizedPath : `/uploads/${normalizedPath}`;
    }, []);

    const handleCardClick = useCallback((id) => {
        navigate(`/product/${id}`);
    }, [navigate]);

    // Reset initialization when products change (for WhistList page)
    useEffect(() => {
        if (products.length > 0 && JSON.stringify(products) !== JSON.stringify(prevProductsRef.current)) {
            setIsInitialized(false);
            prevProductsRef.current = products;
        }
    }, [products]);

    const prevProductsRef = useRef([]);

    // Skip rendering until initialization is complete
    if (!isInitialized && products.length > 0) {
        return <div className="p-8 text-center">Loading products...</div>;
    }

    return (
        <>
            {/* Wishlist Popup */}
            {(wishlistMessage || wishlistError) && popupCoords && popupProductId && (
                <div
                    ref={popupRef}
                    style={{
                        position: 'absolute',
                        left: popupCoords.x,
                        top: popupCoords.y - 50,
                        transform: 'translateX(-50%)',
                        zIndex: 9999
                    }}
                    className={`flex items-center px-3 py-2 rounded-lg shadow-lg text-white text-md font-bold transition-all duration-300 ${wishlistMessage ? "bg-green-500" : "bg-red-600"}`}
                >
                    <span>{wishlistMessage || wishlistError}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(clearWhistlistMessage());
                        }}
                        className="ml-2 text-white text-md font-bold border-2 border-white px-1 rounded-md hover:border-2 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}
            <div className="container mx-auto px-4 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-15 mt-10">
                {products.map((product) => {
                    const cartItem = cartItems.find((item) => item.prod_ID === product.prod_ID);
                    const quantity = cartItem ? cartItem.quantity : 0;
                    const isWishlisted = whistlist.some(item => item.product_id === product.prod_ID);

                    const imageUrl = getImageUrl(product.prod_Images && product.prod_Images[0]?.image
                        ? product.prod_Images[0].image
                        : 'default-image.jpg');

                    const validRates = product.prod_Rate && Array.isArray(product.prod_Rate)
                        ? product.prod_Rate.filter(rateObj => {
                            if (!rateObj || typeof rateObj !== 'object') return false;
                            const keys = Object.keys(rateObj);
                            return keys.length === 1 && !isNaN(Number(rateObj[keys[0]])) && rateObj[keys[0]] !== null;
                        })
                        : [];
                    const hasValidRates = validRates.length > 0;

                    return (
                        <div
                            key={product.prod_ID}
                            className="card w-100 p-2 h-full max-w-xs bg-white shadow-lg backdrop-blur-md rounded-lg text-center cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center justify-between font-bold text-black hover:border-black hover:transform hover:scale-[1.02] hover:shadow-xl mx-auto relative"
                            onClick={() => handleCardClick(product.prod_ID)}
                        >
                            <div className='h-61'>
                                <div className='relative'>
                                    <h2 className="absolute flex flex-col top-0 right-0 w-15 bg-amber-300 text-black text-xs sm:text-sm px-3 rounded-3xl rounded-t-none shadow-lg">
                                        <span className='text-lg'>{product.prod_offer}%</span><span className='text-sm'>OFF</span>
                                    </h2>
                                </div>
                                <img
                                    src={imageUrl}
                                    alt={product.prod_Name || 'Product Image'}
                                    className="w-full h-full object-fill rounded-md mb-2"
                                />
                            </div>

                            <div className="flex flex-col gap-2 w-full mb-2 h-20">
                                <div className='flex justify-between mt-3'>
                                    <h5 className="text-lg text-center font-bold pl-3 uppercase">{product.prod_Name || 'Unknown Product'}</h5>
                                    {isWishlisted ? (
                                        <div className='pr-7'>
                                            <Tooltip title="Remove from wishlist" arrow placement="top">
                                                <button
                                                    onClick={(e) => handleRemoveFromWhistList(e, product)}
                                                    disabled={wishlistLoading}
                                                    className="text-red-500 hover:text-red-600 cursor-pointer"
                                                >
                                                    <Favorite color="error" fontSize="medium" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    ) : (
                                        <div className='pr-7'>
                                            <Tooltip title="Add to wishlist" arrow placement="top">
                                                <button
                                                    onClick={(e) => handleAddToWhistList(e, product)}
                                                    disabled={wishlistLoading}
                                                    className="text-gray-500 hover:text-red-500 cursor-pointer"
                                                >
                                                    <FavoriteBorderIcon fontSize="medium" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center w-full mt-1">
                                    <div
                                        className="relative w-20 text-sm"
                                        style={{ zIndex: 1 }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Select
                                            value={selectedRates[product.prod_ID]?.key || (hasValidRates ? Object.keys(validRates[0])[0] : 'default')}
                                            onChange={(e, value) => hasValidRates && handleRateChange(product.prod_ID, value)}
                                            indicator={<KeyboardArrowDown />}
                                            disabled={!hasValidRates}
                                            sx={{
                                                width: 95,
                                                height: 36,
                                                padding: '3px',
                                                paddingLeft: '8px',
                                                marginLeft: '10px',
                                                fontSize: '1.150rem',
                                                backgroundColor: 'white',
                                                border: '1px solid #6B7280',
                                                borderRadius: '6px',
                                                '&:focus': {
                                                    outline: 'none',
                                                    ring: '1px solid #4B5563',
                                                },
                                            }}
                                        >
                                            {hasValidRates ? (
                                                validRates.map((rateObj, idx) => {
                                                    const key = Object.keys(rateObj)[0];
                                                    return (
                                                        <Option key={`${product.prod_ID}-${key}-${idx}`} value={key}>
                                                            {key}
                                                        </Option>
                                                    );
                                                })
                                            ) : (
                                                <Option value="default" disabled>
                                                    No rates available
                                                </Option>
                                            )}
                                        </Select>
                                    </div>
                                    <p className="text-xl font-medium text-gray-600 pr-4">
                                        ₹ {typeof selectedRates[product.prod_ID]?.value === 'number' ? selectedRates[product.prod_ID].value.toFixed(2) : '0.00'}
                                    </p>
                                </div>
                            </div>
                            {quantity === 0 ? (
                                <button
                                    className="group relative w-full mb-2 mt-5 overflow-hidden rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 px-4 py-1.5 text-white transition-all duration-500 ease-in-out hover:from-blue-500 hover:to-blue-500 active:scale-95 transform animate-fade-in-scale"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(product);
                                        if (!userId) {
                                            window.location.href = '/login';
                                            return;
                                        }
                                    }}
                                    disabled={!hasValidRates}
                                >
                                    <div className="relative z-20 flex items-center justify-center gap-2 animate-slide-up-fade">
                                        <span className="font-medium tracking-wide transition-transform duration-300 group-hover:translate-x-1">
                                            Add to Cart
                                        </span>
                                        <AddShoppingCartIcon className="text-xl transition-all duration-300 group-hover:rotate-12 animate-spin-fade" />
                                    </div>
                                </button>
                            ) : (
                                <div className="flex items-center justify-between w-full mb-2 mt-5 gap-2">
                                    <button
                                        className="w-1/4 rounded-lg bg-gradient-to-r from-red-400 to-red-600 px-2 py-1.5 text-white transition-all duration-300 hover:from-red-500 hover:to-red-600 active:scale-95"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDecrease(product.prod_ID);
                                        }}
                                    >
                                        <RemoveIcon className="text-3xl font-bold" sx={{ fontSize: '20px' }} />
                                    </button>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={quantity}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            e.stopPropagation();

                                            let inputValue = e.target.value;
                                            inputValue = inputValue.replace(/[^0-9]/g, '');

                                            if (inputValue === '') return;

                                            const newQuantity = parseInt(inputValue, 10);
                                            if (newQuantity >= 1) {
                                                dispatch(updateCartItem({
                                                    userId,
                                                    prod_ID: product.prod_ID,
                                                    quantity: newQuantity
                                                }));
                                            }
                                        }}
                                        onFocus={(e) => {
                                            e.target.select();
                                        }}
                                        className="w-1/4 text-center border text-lg font-semibold text-gray-800 outline-none rounded focus:ring-1 focus:ring-blue-300"
                                        style={{ MozAppearance: 'textfield' }}
                                        onWheel={(e) => e.target.blur()}
                                    />
                                    <button
                                        className="w-1/4 rounded-lg bg-gradient-to-r from-green-400 to-green-600 px-2 py-1.5 text-white transition-all duration-300 hover:from-green-500 hover:to-green-600 active:scale-95"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleIncrease(product.prod_ID);
                                        }}
                                    >
                                        <AddIcon className="text-xl" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}