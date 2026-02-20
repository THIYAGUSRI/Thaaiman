import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, updateCartItem, clearCart } from '../../redux/cart/cartSlice';
import { fetchWhistlist, addToWhistlist, removeFromWhistlist, setWhistlistPopup, clearWhistlistMessage } from '../../redux/whistlist/whistlistSlice';
import Header from '../Components/Common Components/Header';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import { Tooltip } from '@mui/material';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import ProductCard from '../Components/Home Components/ProductCard';

export default function ProductDetail() {
  const [product, setProduct] = useState({});
  const [selectedRate, setSelectedRate] = useState({ key: '', value: 0 });
  const [mainImage, setMainImage] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [cartPopupCoords, setCartPopupCoords] = useState(null);

  const { id } = useParams();
  const dispatch = useDispatch();

  // Add a ref to track if we should skip rate reset
  const skipRateResetRef = useRef(false);

  // Get all state from Redux
  const cartItems = useSelector((state) => state.cart.items);
  const currentUser = useSelector((state) => state.user.currentUser);
  const whistlist = useSelector((state) => state.whistlist.items);
  const wishlistLoading = useSelector((state) => state.whistlist.loading);
  const wishlistMessage = useSelector((state) => state.whistlist.message);
  const wishlistError = useSelector((state) => state.whistlist.error);
  const popupCoords = useSelector((state) => state.whistlist.popupCoords);
  const popupProductId = useSelector((state) => state.whistlist.popupProductId);

  // Find cart item with BOTH product ID AND selected unit
  const cartItem = cartItems.find((item) =>
    item.prod_ID === id &&
    item.selectedRate.key === selectedRate.key
  );
  const quantity = cartItem ? cartItem.quantity : 0;
  const userId = currentUser?.user?.userID;
  const token = currentUser?.token;
  const productCategoryId = product.prod_category;
  const productName = product.prod_Name;

  console.log('user detail', currentUser?.userID);
  console.log('ProductDetail.js: User ID from Redux:', userId);
  console.log('whistlist', whistlist);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log(`ProductDetail.js: Fetching product details for prod_ID: ${id}`);
        const res = await fetch(`/product/${id}`);
        if (res.ok) {
          const data = await res.json();
          console.log('ProductDetail.js: Product details fetched:', data);
          console.log('ProductDetail.js: Raw prod_Rate:', data.prod_Rate);
          setProduct(data);

          // Set default main image from index 0
          if (data.prod_Images && data.prod_Images.length > 0) {
            const imagePath = data.prod_Images[0].image.replace(/\\/g, '/');
            const imageUrl = imagePath.startsWith('http')
              ? imagePath
              : `/Uploads/${imagePath}`;
            setMainImage(imageUrl);
            console.log('ProductDetail.js: Set main image:', imageUrl);
          }

          // Only reset selectedRate if we're not skipping it
          if (!skipRateResetRef.current) {
            // Set default or existing selected rate
            if (data.prod_Rate && Array.isArray(data.prod_Rate) && data.prod_Rate.length > 0) {
              console.log('ProductDetail.js: prod_Rate is an array with length:', data.prod_Rate.length);

              // First, try to find if this exact unit is already in cart
              const itemInCart = cartItems.find(item =>
                item.prod_ID === id &&
                data.prod_Rate.some(rateObj => {
                  const key = Object.keys(rateObj)[0];
                  return key === item.selectedRate.key;
                })
              );

              if (itemInCart) {
                // Use the unit that's already in cart
                setSelectedRate(itemInCart.selectedRate);
                console.log('ProductDetail.js: Set selected rate from cart item:', itemInCart.selectedRate);
              } else {
                // Find the first valid rate object
                const validRate = data.prod_Rate.find(rateObj => {
                  const keys = Object.keys(rateObj);
                  return keys.length === 1 && !isNaN(Number(rateObj[keys[0]]));
                });
                if (validRate) {
                  const firstKey = Object.keys(validRate)[0];
                  setSelectedRate({ key: firstKey, value: Number(validRate[firstKey]) });
                  console.log('ProductDetail.js: Set default selected rate:', {
                    key: firstKey,
                    value: Number(validRate[firstKey]),
                  });
                } else {
                  console.warn('ProductDetail.js: No valid rate objects found in prod_Rate:', data.prod_Rate);
                  setSelectedRate({ key: 'default', value: 0 });
                }
              }
            } else {
              console.warn('ProductDetail.js: prod_Rate is invalid or empty:', data.prod_Rate);
              setSelectedRate({ key: 'default', value: 0 });
            }
          }

          // Reset the skip flag after product fetch
          skipRateResetRef.current = false;
        } else {
          console.error('ProductDetail.js: Failed to fetch product details:', res.statusText);
        }
      } catch (error) {
        console.error('ProductDetail.js: Error fetching product details:', error);
      }
    };
    fetchProduct();
  }, [id]); // Removed cartItems dependency

  useEffect(() => {
    if (!currentUser) {
      console.log('ProductDetail.js: User logged out, clearing cart');
      dispatch(clearCart());
    }
  }, [currentUser, dispatch]);

  // Fetch wishlist when user is available
  useEffect(() => {
    if (userId && token) {
      console.log('ProductDetail.js: Fetching wishlist for userId:', userId);
      dispatch(fetchWhistlist({ token, userId }));
    }
  }, [dispatch, userId, token]);

  // Auto-clear wishlist messages
  useEffect(() => {
    if (wishlistMessage || wishlistError) {
      const timer = setTimeout(() => {
        dispatch(clearWhistlistMessage());
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [wishlistMessage, wishlistError, dispatch]);

  // Fetch related products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('RelatedProducts: error fetching products', err);
        setError(err.message || 'Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  // --- UPDATED: handleRateChange now only updates selectedRate, no cart updates ---
  const handleRateChange = (value) => {
    const selectedKey = value;
    console.log(`ProductDetail.js: Changing rate for prod_ID: ${id}, selectedKey: ${selectedKey}`);
    if (product.prod_Rate && Array.isArray(product.prod_Rate) && product.prod_Rate.length > 0) {
      const matchedRate = product.prod_Rate.find(
        (rateObj) => Object.keys(rateObj)[0] === selectedKey
      );
      const newRate = matchedRate
        ? { key: selectedKey, value: Number(matchedRate[selectedKey]) }
        : { key: selectedKey, value: Number(Object.values(product.prod_Rate[0])[0]) || 0 };

      // Simply update the selected rate – no cart updates
      setSelectedRate(newRate);

      console.log('ProductDetail.js: Updated selected rate:', newRate);
    } else {
      console.warn('ProductDetail.js: No valid prod_Rate for rate change:', product.prod_Rate);
      setSelectedRate({ key: selectedKey || 'default', value: 0 });
    }
  };

  const handleAddToCart = () => {
    console.log('ProductDetail.js: handleAddToCart called');
    console.log('ProductDetail.js: userId:', userId);
    console.log('ProductDetail.js: token:', token ? 'present' : 'missing');
    console.log('ProductDetail.js: product:', product);
    console.log('ProductDetail.js: selectedRate:', selectedRate);

    if (!userId) {
      console.log('ProductDetail.js: No user logged in, cannot add to cart');
      return;
    }

    if (!selectedRate.key || selectedRate.value === 0) {
      console.log('ProductDetail.js: selectedRate not properly set, cannot add to cart');
      return;
    }

    console.log(`ProductDetail.js: Adding product to cart: prod_ID=${id}, userId=${userId}`);

    // Check if this exact product with this exact unit is already in cart
    const existingCartItem = cartItems.find((item) =>
      item.prod_ID === id &&
      item.selectedRate.key === selectedRate.key
    );

    if (existingCartItem) {
      // If same product with same unit exists, increase quantity
      console.log(`ProductDetail.js: Same product with same unit (${selectedRate.key}) already in cart, increasing quantity`);
      dispatch(updateCartItem({
        token,
        userId,
        prod_ID: id,
        quantity: existingCartItem.quantity + 1,
        selectedRate: existingCartItem.selectedRate
      }));
      setCartMessage(`Added more ${selectedRate.key} to cart`);
    } else {
      // If product with different unit or not in cart at all, add as new item
      console.log(`ProductDetail.js: Adding product with unit ${selectedRate.key} as new cart item`);
      const imagePath = product.prod_Images[0]?.image
        ? product.prod_Images[0].image.replace(/\\/g, '/')
        : 'default-image.jpg';

      const cartData = {
        token,
        userId,
        prod_ID: id,
        quantity: 1,
        selectedRate,
        prod_Name: product.prod_Name,
        image: imagePath,
        prod_Rate: product.prod_Rate,
      };

      console.log('ProductDetail.js: Dispatching addToCart with:', cartData);

      dispatch(
        addToCart(cartData)
      );

      setCartMessage(`Item added to cart (${selectedRate.key})`);
    }

    setCartPopupCoords({ x: window.innerWidth / 2, y: 40 });
  };

  const handleIncrease = () => {
    if (!cartItem) {
      console.log('ProductDetail.js: Product not in cart, cannot increase');
      return;
    }

    console.log(`ProductDetail.js: Increasing quantity for prod_ID: ${id}, unit: ${cartItem.selectedRate.key}`);
    const newQuantity = cartItem.quantity + 1;

    // Set flag to prevent rate reset during this update
    skipRateResetRef.current = true;

    dispatch(updateCartItem({
      token,
      userId,
      prod_ID: id,
      quantity: newQuantity,
      selectedRate: cartItem.selectedRate  // Use cartItem.selectedRate, not component's selectedRate
    }));
    setCartMessage('Quantity increased successfully');
    setCartPopupCoords({ x: window.innerWidth / 2, y: 40 });
  };

  const handleDecrease = () => {
    if (!cartItem) {
      console.log('ProductDetail.js: Product not in cart, cannot decrease');
      return;
    }

    console.log(`ProductDetail.js: Decreasing quantity for prod_ID: ${id}, unit: ${cartItem.selectedRate.key}`);
    if (cartItem.quantity > 0) {
      const newQuantity = cartItem.quantity - 1;

      // Set flag to prevent rate reset during this update
      skipRateResetRef.current = true;

      dispatch(updateCartItem({
        token,
        userId,
        prod_ID: id,
        quantity: newQuantity,
        selectedRate: cartItem.selectedRate  // Use cartItem.selectedRate, not component's selectedRate
      }));

      if (newQuantity === 0) {
        setCartMessage(`Item (${cartItem.selectedRate.key}) removed from cart successfully`);
      } else {
        setCartMessage('Quantity decreased successfully');
      }
      setCartPopupCoords({ x: window.innerWidth / 2, y: 40 });
    } else {
      console.log('ProductDetail.js: Cannot decrease quantity, already 0');
    }
  };

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

  const handleAddToWhistList = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;

    try {
      const rect = btn.getBoundingClientRect();
      // Set popup position using Redux
      dispatch(setWhistlistPopup({
        coords: { x: rect.left + rect.width / 2, y: rect.top + window.scrollY },
        productId: product.prod_ID,
      }));

      console.log('ProductDetail.js: Adding to wishlist:', { userId, productId: product.prod_ID });

      await dispatch(addToWhistlist({
        token,
        userId,
        productId: product.prod_ID
      })).unwrap();

      // Dispatch event to update header count
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
  };

  const handleRemoveFromWhistList = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;

    const itemToRemove = whistlist.find(item => item.product_id === product.prod_ID);
    if (!itemToRemove) return;

    try {
      const rect = btn.getBoundingClientRect();
      // Set popup position using Redux
      dispatch(setWhistlistPopup({
        coords: { x: rect.left + rect.width / 2, y: rect.top + window.scrollY },
        productId: product.prod_ID,
      }));

      await dispatch(removeFromWhistlist({
        token,
        userId,
        itemId: itemToRemove.id
      })).unwrap();

      // Dispatch event to update header count
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
    }
  };

  if (!product.prod_ID) {
    console.log('ProductDetail.js: Product not loaded yet');
    return <div className="text-center text-gray-600 mt-10">Loading product...</div>;
  }

  // Check if product is in wishlist using Redux state
  const isWishlisted = whistlist.some(item => String(item.product_id) === String(product.prod_ID));


  if (loading) return <div className="py-8 text-center">Loading related products...</div>;
  if (error) return <div className="py-8 text-center text-red-600">Error: {error}</div>;

  // Filter 1: Get related products (same category, NOT current product)
  const relatedProducts = products.filter(product => {
    const sameCategory = productCategoryId && product.prod_category === productCategoryId;
    const notCurrentProduct = productName ? product.prod_Name !== productName : true;
    return sameCategory && notCurrentProduct;
  }).slice(0, 4);

  // Filter 2: Get other products (different category, NOT current product)
  const otherProducts = products.filter(product => {
    const differentCategory = productCategoryId ? product.prod_category !== productCategoryId : true;
    const notCurrentProduct = productName ? product.prod_Name !== productName : true;
    return differentCategory && notCurrentProduct;
  }).slice(0, 8);

  // Determine what to display - KEEPING YOUR EXACT LOGIC
  let productsToShow = [];
  let otherProductsToShow = [];
  let showRelatedTitle = false;
  let showOtherTitle = false;

  if (relatedProducts.length > 0) {
    // Case 1: We have filtered products
    showRelatedTitle = true;

    // Start with filtered products
    productsToShow = [...relatedProducts];

    // If we need more products to reach 4, add from other products
    if (otherProducts.length > 0) {
      const additionalProducts = otherProducts;
      otherProductsToShow = [...additionalProducts];
      showOtherTitle = true;
    }
  } else {
    // Case 2: No filtered products, show other products (excluding current if possible)
    showRelatedTitle = false;
    productsToShow = [...otherProducts];
  }

  if (productsToShow.length === 0 && otherProductsToShow.length === 0) {
    return <div className="py-8 text-center text-gray-500">No products found.</div>;
  }

  return (
    <>
      <Header />

      {/* Wishlist Popup from Redux */}
      {(wishlistMessage || wishlistError) && popupCoords && popupProductId && (
        <div
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

      {/* Product Detail Section - Improved Responsive Design */}
      <div className="w-full mt-30 mx-auto px-4 sm:px-6 lg:px-8 xl:px-25 py-8 sm:py-12 lg:py-15">
        <div className="flex flex-col lg:flex-row bg-white gap-8 lg:gap-8">

          {/* Main Image + Thumbnails (All screen sizes now show thumbnails below the main image) */}
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            {/* Main Image */}
            <div className="w-full mb-6">
              <img
                src={mainImage}
                alt={product.prod_Name}
                className="w-full h-auto max-h-[500px] object-fill rounded-md shadow-lg"
              />
            </div>

            {/* Thumbnails - Below main image on ALL devices */}
            <div className="w-full overflow-x-auto py-4">
              <div className="flex justify-center gap-3 mx-auto">
                {product.prod_Images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={getImageUrl(img.image)}
                    alt={`Thumbnail ${idx}`}
                    className={`w-30 h-25 sm:w-40 object-contain rounded-md cursor-pointer hover:scale-105 transition-all flex-shrink-0 ${mainImage === getImageUrl(img.image)
                      ? 'border-yellow-400 border-4 rounded-md shadow-lg'
                      : 'border border-gray-200'
                      }`}
                    onClick={() => {
                      const newMainImage = getImageUrl(img.image);
                      console.log(`ProductDetail.js: Changing main image to: ${newMainImage}`);
                      setMainImage(newMainImage);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Product Details - Right Side (Desktop) / Full Width (Mobile & Tablet) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 px-4 sm:px-6 md:px-8">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold break-words pr-4">
                {product.prod_Name}
              </h1>
              {isWishlisted ? (
                <Tooltip title="Remove from wishlist" arrow placement="bottom">
                  <button
                    onClick={(e) => handleRemoveFromWhistList(e)}
                    disabled={wishlistLoading}
                    className="text-red-500 hover:text-red-600 cursor-pointer flex-shrink-0 mt-1"
                  >
                    <Favorite color="error" fontSize="medium" />
                  </button>
                </Tooltip>
              ) : (
                <Tooltip title="Add to wishlist" arrow placement="bottom">
                  <button
                    onClick={(e) => handleAddToWhistList(e)}
                    disabled={wishlistLoading}
                    className="text-gray-500 hover:text-red-500 cursor-pointer flex-shrink-0 mt-1"
                  >
                    <FavoriteBorderIcon fontSize="medium" />
                  </button>
                </Tooltip>
              )}
            </div>

            <div className='flex justify-between bg-green-50 border border-green-200 py-2 rounded-lg'>
              {product.prod_offer && (
                <div className="inline-block  rounded-lg px-4 py-2">
                  <p className="text-green-700 font-semibold text-lg">
                    🎉 Offer: {product.prod_offer}
                  </p>
                </div>
              )}
              {/* Stock Status */}
              {product.prod_Stock !== undefined && (
                <div className={`inline-flex items-center px-4 py-2 rounded-lg ${product.prod_Stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <span className="font-semibold text-lg">
                    {product.prod_Stock > 0
                      ? `✓ In Stock (${product.prod_Stock})`
                      : '✗ Out of Stock'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg">
              <div className="relative">
                <Select
                  value={selectedRate.key || ''}
                  onChange={(e, value) => handleRateChange(value)}
                  indicator={<KeyboardArrowDown />}
                  sx={{
                    width: '120px',
                    height: '40px',
                    padding: '4px',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    border: '2px solid #E5E7EB',
                    borderRadius: '8px',
                    '&:focus': {
                      outline: 'none',
                      borderColor: '#F59E0B',
                    },
                  }}
                >
                  {product.prod_Rate && Array.isArray(product.prod_Rate) && product.prod_Rate.length > 0 ? (
                    product.prod_Rate.map((rateObj, idx) => {
                      const keys = Object.keys(rateObj);
                      if (keys.length === 1 && !isNaN(Number(rateObj[keys[0]]))) {
                        const key = keys[0];
                        return (
                          <Option key={idx} value={key}>
                            {key}
                          </Option>
                        );
                      }
                      return null;
                    }).filter(Boolean)
                  ) : (
                    <Option value="default" disabled>
                      No rates available
                    </Option>
                  )}
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-900 text-xl">₹</span>
                <p className="text-3xl sm:text-4xl font-bold text-gray-800">
                  {typeof selectedRate.value === 'number'
                    ? selectedRate.value.toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>

            {/* Cart Actions */}
            <div>
              {Number(product.prod_Stock) === 0 ? (
                <div className="w-full sm:w-64 text-center text-3xl font-serif font-bold text-red-600">
                  ✗ Out of Stock
                </div>
              ) : !cartItem ? (
                !userId ? (
                  <button
                    className="w-full sm:w-64 flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-all cursor-pointer text-lg font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = '/login';
                    }}
                  >
                    <AddShoppingCartIcon fontSize="medium" />
                    Add to Cart
                  </button>
                ) : (
                  <button
                    className="w-full sm:w-64 flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:from-yellow-500 hover:to-yellow-700 transition-all cursor-pointer text-lg font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                  >
                    <AddShoppingCartIcon fontSize="medium" />
                    Add to Cart
                  </button>
                )
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    className="w-12 h-12 flex items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer shadow-md"
                    onClick={handleDecrease}
                  >
                    <RemoveIcon fontSize="large" />
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

                      // Prevent 0 or negative
                      if (newQuantity >= 1 && cartItem) {
                        // Set flag to prevent rate reset during this update
                        skipRateResetRef.current = true;

                        dispatch(updateCartItem({
                          token,
                          userId,
                          prod_ID: product.prod_ID,
                          quantity: newQuantity,
                          selectedRate: cartItem.selectedRate  // Use cartItem.selectedRate
                        }));
                      }
                    }}
                    onFocus={(e) => {
                      e.target.select();
                    }}
                    className="w-35 h-12 text-center border-2 border-gray-200 text-2xl font-bold text-gray-800 outline-none rounded-lg focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                    style={{ MozAppearance: 'textfield' }}
                    onWheel={(e) => e.target.blur()}
                  />
                  <button
                    className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all cursor-pointer shadow-md"
                    onClick={handleIncrease}
                    disabled={product.prod_Stock <= quantity}
                  >
                    <AddIcon fontSize="large" />
                  </button>
                </div>
              )}
            </div>

            {/* Description - Below everything on mobile/tablet */}
            {product.prod_Description && product.prod_Description.length > 0 && (
              <div className="pt-8 border-t border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                  Description
                </h2>

                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                    {showMore
                      ? product.prod_Description
                      : product.prod_Description.split(" ").slice(0, 100).join(" ")}

                    {product.prod_Description.split(" ").length > 100 && (
                      <span
                        onClick={() => setShowMore(!showMore)}
                        className="ml-2 text-blue-600 font-medium cursor-pointer hover:underline "
                      >
                        {showMore ? "See Less" : "... See More"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <div className='mx-15'>
        {showRelatedTitle && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Related Products
            </h2>
            <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsToShow.map((pro) => (
                <div key={pro.prod_ID} className="w-full">
                  <ProductCard products={[pro]} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People also bought Section */}
        {showOtherTitle && (
          <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              People also bought
            </h2>
            <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {otherProductsToShow.map((pro) => (
                <div key={pro.prod_ID} className="w-full">
                  <ProductCard products={[pro]} />
                </div>
              ))}
            </div>
            <Link to="/products">
              <div className="flex justify-center mt-8 mb-8">
                <button
                  className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-2.5 text-white font-medium text-lg transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 active:scale-95"
                >
                  View More
                </button>
              </div>
            </Link>
          </div>

        )}

        {/* When no related products, show other products */}
        {!showRelatedTitle && productsToShow.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              You may also like
            </h2>
            <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {productsToShow.map((pro) => (
                <div key={pro.prod_ID} className='w-full'>
                  <ProductCard products={[pro]} />
                </div>
              ))}
            </div>
            <Link to="/products">
              <div className="flex justify-center mt-8 mb-8">
                <button
                  className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-2.5 text-white font-medium text-lg transition-all duration-300 hover:from-yellow-500 hover:to-yellow-600 active:scale-95"
                >
                  View More
                </button>
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}