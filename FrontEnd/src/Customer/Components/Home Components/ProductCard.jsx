import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
    const [categoryActive, setCategoryActive] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [cartMessage, setCartMessage] = useState('');
    const [cartPopupCoords, setCartPopupCoords] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);
    const currentUser = useSelector((state) => state.user.currentUser);
    const userId = currentUser?.user?.userID;
    const token = currentUser?.token;
    const location = useLocation();
    const url = location.pathname.slice(0, 9);
    console.log('url:' + url);

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
            dispatch(fetchWhistlist({ token, userId }));
        }
    }, [dispatch, userId, disableWishlistFetch]);

    // Auto-hide cart message
    useEffect(() => {
        if (cartMessage && cartPopupCoords) {
            const timer = setTimeout(() => {
                setCartMessage('');
                setCartPopupCoords(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [cartMessage, cartPopupCoords]);

    // Auto-clear message after 1.5 seconds
    useEffect(() => {
        if (wishlistMessage || wishlistError) {
            const timer = setTimeout(() => {
                dispatch(clearWhistlistMessage());
            }, 700);
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
                setCategoryActive(data);
                console.log(categoryActive + 'vvvev');
                

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

    }, [products, cartItems, isInitialized]);

    // Fetch cart only once when userId changes
    useEffect(() => {
        if (token && !isInitialized) {
            console.log(`ProductCard.js: Dispatching fetchCart with token`);
            dispatch(fetchCart(token));
        }
    }, [dispatch, token, isInitialized]);

    useEffect(() => {
        if (!currentUser) {
            console.log('ProductCard.js: User logged out, clearing cart and resetting selectedRates');
            dispatch(clearCart());
            setIsInitialized(true);
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
                token,
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

    // Add to Cart function - UPDATED TO HANDLE UNIT SEPARATION
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

        // Check if this exact product with this exact unit is already in cart
        const existingCartItem = cartItems.find((item) => 
            item.prod_ID === product.prod_ID && 
            item.selectedRate.key === selectedRate.key
        );

        if (existingCartItem) {
            // If same product with same unit exists, increase quantity
            console.log(`ProductCard.js: Same product with same unit (${selectedRate.key}) already in cart, increasing quantity`);
            dispatch(updateCartItem({ 
                token, 
                userId, 
                prod_ID: product.prod_ID, 
                quantity: existingCartItem.quantity + 1, 
                currentRate: existingCartItem.selectedRate,
                selectedRate: existingCartItem.selectedRate 
            }));
            setCartMessage(`Added more ${selectedRate.key} to cart`);
        } else {
            // If product with different unit or not in cart at all, add as new item
            console.log(`ProductCard.js: Adding product with unit ${selectedRate.key} as new cart item`);
            const image = product.prod_Images && product.prod_Images[0]?.image
                ? product.prod_Images[0].image.replace(/\\/g, '/')
                : 'default-image.jpg';

            dispatch(addToCart({
                token,
                userId,
                prod_ID: product.prod_ID,
                quantity: 1,
                selectedRate,
                prod_Name: product.prod_Name || 'Unknown Product',
                image,
                prod_Rate: product.prod_Rate,
                prod_category: categoryMap[product.prod_category] || product.prod_category,
            }));
            setCartMessage(`Item added to cart (${selectedRate.key})`);
        }
        
        setCartPopupCoords({ x: window.innerWidth / 2, y: 40 });
    }, [dispatch, userId, selectedRates, categoryMap, cartItems]);

    const handleIncrease = useCallback((prod_ID) => {
        // Get the selected rate for this specific product
        const selectedRate = selectedRates[prod_ID];
        if (!selectedRate || !selectedRate.key) {
            console.log('ProductCard.js: No selected rate found for product:', prod_ID);
            return;
        }
        
        // Find the EXACT cart item by prod_ID AND selectedRate.key
        const item = cartItems.find((item) => 
            item.prod_ID === prod_ID && 
            item.selectedRate.key === selectedRate.key
        );
        
        if (item) {
            console.log(`ProductCard.js: Increasing quantity for ${prod_ID} with unit ${selectedRate.key}`);
            dispatch(updateCartItem({ 
                token, 
                userId, 
                prod_ID, 
                quantity: item.quantity + 1, 
                currentRate: item.selectedRate,
                selectedRate: item.selectedRate 
            }));
            setCartMessage('Quantity increased successfully');
            setCartPopupCoords({ x: window.innerWidth / 2, y: 40 });
        } else {
            console.log(`ProductCard.js: No cart item found for ${prod_ID} with unit ${selectedRate.key}`);
        }
    }, [dispatch, token, userId, cartItems, selectedRates]);

    const handleDecrease = useCallback((prod_ID) => {
        // Get the selected rate for this specific product
        const selectedRate = selectedRates[prod_ID];
        if (!selectedRate || !selectedRate.key) {
            console.log('ProductCard.js: No selected rate found for product:', prod_ID);
            return;
        }
        
        // Find the EXACT cart item by prod_ID AND selectedRate.key
        const item = cartItems.find((item) => 
            item.prod_ID === prod_ID && 
            item.selectedRate.key === selectedRate.key
        );
        
        if (item && item.quantity > 0) {
            const newQuantity = item.quantity - 1;
            console.log(`ProductCard.js: Decreasing quantity for ${prod_ID} with unit ${selectedRate.key}`);
            dispatch(updateCartItem({ 
                token, 
                userId, 
                prod_ID, 
                quantity: newQuantity, 
                currentRate: item.selectedRate,
                selectedRate: item.selectedRate 
            }));
            
            if (newQuantity === 0) {
                setCartMessage(`Item (${selectedRate.key}) removed from cart successfully`);
            } else {
                setCartMessage('Quantity decreased successfully');
            }
            setCartPopupCoords({ x: window.innerWidth / 2, y: 40 });
        } else {
            console.log(`ProductCard.js: No cart item found for ${prod_ID} with unit ${selectedRate.key}`);
        }
    }, [dispatch, token, userId, cartItems, selectedRates]);

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

        // Just update the selectedRate for the Add to Cart button
        // Do NOT try to update existing cart items here - cart items should be managed on the Cart page
        setSelectedRates(prev => ({ ...prev, [id]: newSelectedRate }));
        
        // Don't update cart when changing unit in dropdown
        // Let the user explicitly click "Add to Cart" to add as separate item
    }, [products]);

    const getImageUrl = useCallback((imgPath) => {
        if (!imgPath) return '/uploads/default-image.jpg';
        const normalizedPath = imgPath.replace(/\\/g, '/');
        return normalizedPath.startsWith('http') ? normalizedPath : `/uploads/${normalizedPath}`;
    }, []);

    const handleCardClick = useCallback((id) => {
        navigate(`/product/${id}`);
        setTimeout(() => {
            try {
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            } catch (e) {
                window.scrollTo(0, 0);
            }
        }, 50);
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

            {/* Cart Popup */}
            {cartMessage && cartPopupCoords && (
                <div
                    style={{
                        position: 'fixed',
                        left: cartPopupCoords.x,
                        bottom: cartPopupCoords.y,
                        transform: 'translate(-50%, 0)',
                        zIndex: 9999,
                        pointerEvents: 'none',
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-full shadow-2xl text-white font-bold bg-green-500"
                >
                    <span>{cartMessage}</span>
                </div>
            )}

            {(url == '/product/') ? (
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
                    {products.map((product) => {
                        // Find cart item with BOTH product ID AND selected unit
                        const selectedRate = selectedRates[product.prod_ID] || {
                            key: Object.keys(product.prod_Rate?.[0] || {})[0] || 'default',
                            value: 0
                        };
                        
                        const cartItem = cartItems.find((item) => 
                            item.prod_ID === product.prod_ID && 
                            item.selectedRate.key === selectedRate.key
                        );
                        const quantity = cartItem ? cartItem.quantity : 0;
                        const isWishlisted = whistlist.some(item => item.product_id === product.prod_ID);
                        const isCategoryActive = categoryActive.some(cat => cat.id === product.prod_category && cat.active !== false);
                        const isProductActive = product.prod_active === true;
                        const imageUrl = getImageUrl(product.prod_Images && product.prod_Images[0]?.image
                            ? product.prod_Images[0].image
                            : 'default-image.jpg');
                        
                        if (!isCategoryActive || !isProductActive) {
                            return null;
                        }

                        const validRates = product.prod_Rate && Array.isArray(product.prod_Rate)
                            ? product.prod_Rate.filter(rateObj => {
                                if (!rateObj || typeof rateObj !== 'object') return false;
                                const keys = Object.keys(rateObj);
                                return keys.length === 1 && !isNaN(Number(rateObj[keys[0]])) && rateObj[keys[0]] !== null;
                            })
                            : [];
                        const hasValidRates = validRates.length > 0;
                        const isOutOfStock = Number(product.prod_Stock) === 0;

                        return (                            
                            <div
                                key={product.prod_ID}
                                className="w-full max-w-sm bg-white shadow-lg overflow-hidden text-center cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02] flex flex-col mx-auto"
                                onClick={() => handleCardClick(product.prod_ID)}
                            >
                                <div className='h-65'>
                                    <div className='relative'>
                                        <h2 className="absolute flex flex-col top-0 right-0 w-15 bg-amber-300 text-black font-bold text-xs sm:text-sm sm:font-bold px-3 rounded-3xl rounded-t-none shadow-lg">
                                            <span className='text-lg'>{product.prod_offer}%</span><span className='text-sm'>OFF</span>
                                        </h2>
                                    </div>
                                    <img
                                        src={imageUrl}
                                        alt={product.prod_Name || 'Product Image'}
                                        className="w-full h-full object-fill mb-2"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 w-full mb-2 h-20">
                                    {currentUser ? (
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
                                    ) : (
                                        <div className='flex justify-between mt-3' onClick={(e) => e.stopPropagation()}>
                                            <h5 className="text-lg text-center font-bold pl-3 uppercase">{product.prod_Name || 'Unknown Product'}</h5>
                                            <div className='pr-7'>
                                                <Tooltip title="Login to save wishlist" arrow placement="top">
                                                    <Link
                                                        to='/login'
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-gray-500 hover:text-red-500 cursor-pointer block"
                                                    >
                                                        <FavoriteBorderIcon fontSize="medium" />
                                                    </Link>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )}
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
                                {isOutOfStock ? (
                                    <div className="w-full mb-2 mt-5 text-center font-bold text-red-600">
                                        Out of Stock
                                    </div>
                                ) : !cartItem ? (
                                    <button
                                        className="group relative w-full mb-1 mt-5 overflow-hidden rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-1.5 text-white transition-all duration-500 ease-in-out hover:from-yellow-500 hover:to-yellow-600 active:scale-95 transform animate-fade-in-scale"
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
                                                if (newQuantity >= 1 && cartItem) {
                                                    dispatch(updateCartItem({
                                                        token,
                                                        userId,
                                                        prod_ID: product.prod_ID,
                                                        quantity: newQuantity,
                                                        currentRate: cartItem.selectedRate,
                                                        selectedRate: cartItem.selectedRate
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
            ) : (
                <div className="container mx-auto px-4 sm:px-4 lg:px-6 xl:px-8 py-12 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => {
                        // Find cart item with BOTH product ID AND selected unit
                        const selectedRate = selectedRates[product.prod_ID] || {
                            key: Object.keys(product.prod_Rate?.[0] || {})[0] || 'default',
                            value: 0
                        };
                        
                        const cartItem = cartItems.find((item) => 
                            item.prod_ID === product.prod_ID && 
                            item.selectedRate.key === selectedRate.key
                        );
                        const quantity = cartItem ? cartItem.quantity : 0;
                        const isWishlisted = whistlist.some(item => item.product_id === product.prod_ID);
                        const isCategoryActive = categoryActive.some(cat => cat.id === product.prod_category && cat.active !== false);
                        const isProductActive = product.prod_active === true;
                        const imageUrl = getImageUrl(product.prod_Images && product.prod_Images[0]?.image
                            ? product.prod_Images[0].image
                            : 'default-image.jpg');
                        
                        if (!isCategoryActive || !isProductActive) {
                            return null;
                        }

                        const validRates = product.prod_Rate && Array.isArray(product.prod_Rate)
                            ? product.prod_Rate.filter(rateObj => {
                                if (!rateObj || typeof rateObj !== 'object') return false;
                                const keys = Object.keys(rateObj);
                                return keys.length === 1 && !isNaN(Number(rateObj[keys[0]])) && rateObj[keys[0]] !== null;
                            })
                            : [];
                        const hasValidRates = validRates.length > 0;
                        const isOutOfStock = Number(product.prod_Stock) === 0;

                        return (
                            <div
                                key={product.prod_ID}
                                className="w-full max-w-sm bg-white shadow-lg overflow-hidden text-center cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02] flex flex-col mx-auto"
                                onClick={() => handleCardClick(product.prod_ID)}
                            >
                                <div className='h-65'>
                                    <div className='relative'>
                                        <h2 className="absolute flex flex-col top-0 right-0 w-15 bg-amber-300 text-black font-bold text-xs sm:text-sm px-3 rounded-3xl rounded-t-none shadow-lg">
                                            <span className='text-lg'>{product.prod_offer}%</span><span className='text-sm'>OFF</span>
                                        </h2>
                                    </div>
                                    <img
                                        src={imageUrl}
                                        alt={product.prod_Name || 'Product Image'}
                                        className="w-full h-full object-fill mb-2"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 w-full mb-2 h-20">
                                    {currentUser ? (
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
                                    ) : (
                                        <div className='flex justify-between mt-3' onClick={(e) => e.stopPropagation()}>
                                            <h5 className="text-lg text-center font-bold pl-3 uppercase">{product.prod_Name || 'Unknown Product'}</h5>
                                            <div className='pr-7'>
                                                <Tooltip title="Login to save wishlist" arrow placement="top">
                                                    <Link
                                                        to='/login'
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-gray-500 hover:text-red-500 cursor-pointer block"
                                                    >
                                                        <FavoriteBorderIcon fontSize="medium" />
                                                    </Link>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )}
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
                                {isOutOfStock ? (
                                    <div className="w-full mb-2 mt-5 text-center font-bold text-red-600">
                                        Out of Stock
                                    </div>
                                ) : !cartItem ? (
                                    <button
                                        className="group relative w-full mb-2 mt-5 overflow-hidden rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-4 py-1.5 text-white transition-all duration-500 ease-in-out hover:from-yellow-500 hover:to-yellow-600 active:scale-95 transform animate-fade-in-scale"
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
                                                if (newQuantity >= 1 && cartItem) {
                                                    dispatch(updateCartItem({
                                                        token,
                                                        userId,
                                                        prod_ID: product.prod_ID,
                                                        quantity: newQuantity,
                                                        currentRate: cartItem.selectedRate,
                                                        selectedRate: cartItem.selectedRate
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
            )}
        </>
    );
}