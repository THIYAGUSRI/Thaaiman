import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateCartItem, removeFromCart, fetchCart, clearCart, createOrder } from '../../redux/cart/cartSlice';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import Select, { selectClasses } from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import Header from '../Components/Common Components/Header';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Box, Modal, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Carts from '../../Images/empty-cart.png';
import Unlock from '../../Images/loginusercart.png'
import OrderConfirm from '../Components/Common Components/OrderConfirm';
import { useCallback } from 'react';

export default function Cart() {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const cartItems = cart.items;
  const cartStatus = cart.status;
  const { total, gst, deliveryCharge, discount, grandTotal } = cart;
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?.user?.userID;
  const token = currentUser?.token;
  const [deliveryAddress, setDeliveryAddress] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [deliveryDay, setDeliveryDay] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [direction, setDirection] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState(['9 AM To 10 AM', '6pm to 7pm']);
  const [availableDays, setAvailableDays] = useState(['Sunday', 'Wednesday']);
  const [timeSlotError, setTimeSlotError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    deliveryDay: '',
    deliveryTime: '',
    direction: '',
    address: ''
  });
  const [deliveryCentres, setDeliveryCentres] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  // === PERSIST DELIVERY DAY ===
  useEffect(() => {
    const savedDay = localStorage.getItem('cart_deliveryDay');
    if (savedDay) {
      setDeliveryDay(savedDay);
    }
  }, []);

  useEffect(() => {
    if (deliveryDay) {
      localStorage.setItem('cart_deliveryDay', deliveryDay);
    } else {
      localStorage.removeItem('cart_deliveryDay');
    }
  }, [deliveryDay]);

  // === PERSIST DELIVERY TIME ===
  useEffect(() => {
    const savedTime = localStorage.getItem('cart_deliveryTime');
    if (savedTime) {
      setDeliveryTime(savedTime);
    }
  }, []);

  useEffect(() => {
    if (deliveryTime) {
      localStorage.setItem('cart_deliveryTime', deliveryTime);
    } else {
      localStorage.removeItem('cart_deliveryTime');
    }
  }, [deliveryTime]);

  // === PERSIST DELIVERY CENTRE (DIRECTION) ===
  useEffect(() => {
    const savedDirection = localStorage.getItem('cart_deliveryCentre');
    if (savedDirection) {
      setDirection(savedDirection);
    }
  }, []);

  useEffect(() => {
    if (direction) {
      localStorage.setItem('cart_deliveryCentre', direction);
    } else {
      localStorage.removeItem('cart_deliveryCentre');
    }
  }, [direction]);

  console.log('Cart.js: User ID from Redux:', userId);
  console.log('Cart.js: Cart state:', cart);

  const isUserCartValid = userId ? cart.user_id === userId || cart.user_id === '' : false;

  console.log('Cart.js: Is user cart valid?', isUserCartValid);
  console.log('Cart.js: Delivery addresses:', deliveryAddress);
  console.log(deliveryCentres);
  console.log(deliveryCentres.length > 0 ? deliveryCentres[0].deliveryNickName : 'No delivery centre data');

  useEffect(() => {
    const fetchDeliveryCentre = async () => {
      try {
        const response = await fetch('/deliverycentres');
        if (!response.ok) {
          throw new Error('Failed to fetch delivery centres');
        }
        const data = await response.json();
        // Normalize response to an array of centres
        let centres = [];
        if (data && Array.isArray(data)) {
          centres = data;
        } else if (data && Array.isArray(data.deliveryCentres)) {
          centres = data.deliveryCentres;
        } else {
          console.error('Cart.js: Unexpected delivery centres format:', data);
          setDeliveryCentres([]);
          return;
        }

        // Keep only centres with availability === 'Active'
        const activeCentres = centres.filter((c) => c && c.availability === 'Active');
        setDeliveryCentres(activeCentres);
        console.log('Cart.js: Delivery Centres data (active only):', activeCentres);

        // If there's a centre with a nickname, use it as the default (only set if not already set)
        if (activeCentres.length > 0) {
          const defaultNick = activeCentres.find((c) => c.deliveryNickName && c.deliveryNickName.trim())?.deliveryNickName || '';
          if (defaultNick) {
            setDirection((prev) => prev || defaultNick);
          }
        }
      } catch (error) {
        console.error('Cart.js: Error fetching delivery centres:', error);
        setDeliveryCentres([]);
      }
    };
    fetchDeliveryCentre();
  }, []);

  useEffect(() => {
    if (userId) {
      console.log(`Cart.js: Dispatching fetchCart for userId: ${userId}`);
      dispatch(fetchCart(token));
    } else {
      console.log('Cart.js: Skipping fetchCart, no userId available');
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (!currentUser) {
      console.log('Cart.js: User logged out, clearing cart');
      dispatch(clearCart());
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (deliveryAddress.length > 0 && !selectedAddress) {
      setSelectedAddress(deliveryAddress[0].id);
    }
  }, [deliveryAddress]);

  useEffect(() => {
    const fetchDeliveryAddress = async () => {
      if (!userId) {
        console.log('Cart.js: No userId, skipping delivery address fetch');
        return;
      }
      try {
        const response = await fetch(`/deliveryaddress/${userId}`);
        if (!response.ok) {
          console.error('Cart.js: Failed to fetch delivery addresses:', response.statusText);
          setDeliveryAddress([]);
          return;
        }
        const data = await response.json();
        console.log('Cart.js: Fetched delivery addresses:', data);
        setDeliveryAddress(data);
      } catch (error) {
        console.error('Cart.js: Error fetching delivery addresses:', error);
        setDeliveryAddress([]);
      }
    };
    fetchDeliveryAddress();
  }, [userId]);

  useEffect(() => {
    const nowDay = new Date();
    if (nowDay.getDay(0) === availableDays[0] || nowDay.getDay(3) === availableDays[1]) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes;
      const cutoff9amTo1pm = 9 * 60 + 30; // 1:30 PM (adjusted if needed)

      if (currentTime < cutoff9amTo1pm) {
        setAvailableTimeSlots(['6 PM To 7 PM']);
        setDeliveryTime('');
        setTimeSlotError('');
      } else {
        setAvailableTimeSlots([]);
        setDeliveryTime('');
        setTimeSlotError('Orders for today must be placed before 9:00 AM');
      }
    } else {
      setAvailableTimeSlots(['9 AM To 10 AM', '6 PM To 7 PM']);
      setTimeSlotError('');
    }
  }, [deliveryDay]);

  useEffect(() => {
    const order = {
      orderdetails: {
        order: {
          order_items: cartItems.map((item) => ({
            prod_ID: item.prod_ID,
            prod_Name: item.prod_Name,
            selectedRate: item.selectedRate,
            order_quantity: item.quantity,
            subtotal: item.subtotal,
            image: item.image,
          })),
          total,
          gst,
          deliveryCharge,
          discount,
          grandTotal,
          order_deliveryDay: deliveryDay,
          order_deliveryTime: deliveryTime,
          order_direction: direction,
          order_selectedAddress: deliveryAddress.find((addr) => addr.id === selectedAddress) || {},
        },
      },
    };
  }, [cartItems, total, gst, deliveryCharge, discount, grandTotal, deliveryDay, deliveryTime, direction, selectedAddress, deliveryAddress]);

  const handleIncrease = (prod_ID, selectedRate) => {
    console.log(`Cart.js: Increasing quantity for prod_ID: ${prod_ID}, unit: ${selectedRate.key}`);
    const item = cartItems.find((item) =>
      item.prod_ID === prod_ID &&
      item.selectedRate.key === selectedRate.key
    );
    if (item && isUserCartValid) {
      dispatch(updateCartItem({
        token,
        userId,
        prod_ID,
        quantity: item.quantity + 1,
        selectedRate: item.selectedRate
      }));
    } else {
      console.log('Cart.js: Cannot increase quantity, invalid user cart or item not found');
    }
  };

  const handleDecrease = (prod_ID, selectedRate) => {
    console.log(`Cart.js: Decreasing quantity for prod_ID: ${prod_ID}, unit: ${selectedRate.key}`);
    const item = cartItems.find((item) =>
      item.prod_ID === prod_ID &&
      item.selectedRate.key === selectedRate.key
    );
    if (item && item.quantity > 0 && isUserCartValid) {
      dispatch(updateCartItem({
        token,
        userId,
        prod_ID,
        quantity: item.quantity - 1,
        selectedRate: item.selectedRate
      }));
    } else {
      console.log('Cart.js: Cannot decrease quantity, invalid user cart or item not found');
    }
  };

  const handleRemove = (prod_ID, selectedRate) => {
    console.log(`Cart.js: Removing item with prod_ID: ${prod_ID}, unit: ${selectedRate?.key}`);
    if (isUserCartValid && userId) {
      dispatch(removeFromCart({ prod_ID, selectedRate }));
    } else {
      console.log('Cart.js: Cannot remove item, invalid user cart or userId undefined');
    }
  };

  const handleRateChange = (prod_ID, selectedKey) => {
    console.log(`Cart.js: Changing rate for prod_ID: ${prod_ID}, selectedKey: ${selectedKey}`);
    const item = cartItems.find((item) => item.prod_ID === prod_ID);
    if (item && item.prod_Rate && isUserCartValid) {
      const matchedRate = item.prod_Rate.find((rateObj) => Object.keys(rateObj)[0] === selectedKey);
      const newSelectedRate = matchedRate
        ? { key: selectedKey, value: matchedRate[selectedKey] }
        : { key: selectedKey, value: item.selectedRate.value };
      dispatch(updateCartItem({ token, userId, prod_ID, quantity: item.quantity, currentRate: item.selectedRate, selectedRate: newSelectedRate }));
    } else {
      console.log('Cart.js: Fetching product for rate change due to missing prod_Rate or invalid user cart');
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/product/${prod_ID}`);
          if (res.ok) {
            const product = await res.json();
            const matchedRate = product.prod_Rate.find((rateObj) => Object.keys(rateObj)[0] === selectedKey);
            if (matchedRate && isUserCartValid) {
              const newSelectedRate = { key: selectedKey, value: matchedRate[selectedKey] };
              dispatch(updateCartItem({ token, userId, prod_ID, quantity: item.quantity, currentRate: item.selectedRate, selectedRate: newSelectedRate }));
            } else {
              console.log('Cart.js: No matched rate or invalid user cart');
            }
          } else {
            console.error('Cart.js: Failed to fetch product:', res.statusText);
          }
        } catch (error) {
          console.error('Cart.js: Error fetching product for rate change:', error);
        }
      };
      fetchProduct();
    }
  };

  const handleConfirmOrder = async () => {
    setValidationErrors({
      deliveryDay: '',
      deliveryTime: '',
      direction: '',
      address: ''
    });
    let isValid = true;
    const newErrors = {
      deliveryDay: '',
      deliveryTime: '',
      direction: '',
      address: ''
    };

    if (!deliveryDay) {
      newErrors.deliveryDay = 'Please select delivery day';
      isValid = false;
    }
    if (!deliveryTime) {
      newErrors.deliveryTime = 'Please select delivery time';
      isValid = false;
    }
    if (!direction) {
      newErrors.direction = 'Please select delivery centre';
      isValid = false;
    }
    if (!selectedAddress) {
      newErrors.address = 'Please select delivery address';
      isValid = false;
    }

    if (!isValid) {
      setValidationErrors(newErrors);
      return;
    }
    if (!isUserCartValid || cartItems.length === 0) {
      console.log('Cart.js: Cannot confirm order, invalid user cart or empty cart');
      return;
    }
    if (!selectedAddress || !deliveryDay || !deliveryTime || !direction) {
      console.log('Cart.js: Missing required order fields:', { selectedAddress, deliveryDay, deliveryTime, direction });
      alert('Please select delivery address, day, time, and delivery centre.');
      return;
    }

    const orderDetails = {
      orderdetails: {
        order: {
          order_items: cartItems.map((item) => ({
            prod_ID: item.prod_ID,
            prod_Name: item.prod_Name,
            selectedRate: item.selectedRate,
            order_quantity: item.quantity,
            subtotal: item.subtotal,
            image: item.image,
          })),
          notes: notes,
          total,
          gst,
          deliveryCharge,
          discount,
          grandTotal,
          order_deliveryDay: deliveryDay,
          order_deliveryTime: deliveryTime,
          order_direction: direction,
          order_selectedAddress: deliveryAddress.find((addr) => addr.id === selectedAddress) || {},
        },
      },
    };

    console.log('Cart.js: Confirming order with details:', JSON.stringify(orderDetails, null, 2));

    try {
      const result = await dispatch(createOrder({ token, userId, orderDetails })).unwrap();
      console.log('Cart.js: Order created successfully:', result);
      // Clear persisted values after successful order (optional)
      localStorage.removeItem('cart_deliveryDay');
      localStorage.removeItem('cart_deliveryTime');
      localStorage.removeItem('cart_deliveryCentre');
      setOrderSuccess(true);

      setTimeout(() => {
        navigate('/order');
      }, 3000);

    } catch (error) {
      console.error('Cart.js: Error creating order:', error);
      alert('Failed to place order. Please try again.');
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

  if (!currentUser) {
    console.log('Cart.js: No user logged in, displaying empty cart');
    return (
      <>
        <Header />
        <div className="mx-auto mt-25 px-4 py-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
          <img src={Unlock} alt="Login User" className='w-125 h-115' />
          <div className="bg-white p-6 text-center">
            <p className="text-gray-600 text-lg">Please log in to view your cart.</p>
            <Link
              to="/login"
              className="mt-4 inline-block bg-indigo-600 text-white text-2xl font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Log In
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (cartStatus === 'loading') {
    console.log('Cart.js: Cart status is loading');
    return (
      <>
        <Header />
        <div className="container mt-25 mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>
          <div className="text-center text-gray-600 mt-10">Loading cart...</div>
        </div>
      </>
    );
  }

  if (!orderSuccess && (!isUserCartValid || cartItems.length === 0)) {
    console.log('Cart.js: Displaying empty cart, user_id mismatch or no items:', { isUserCartValid, cartItemsLength: cartItems.length });
    return (
      <>
        <Header />
        <div className="container mt-35 mx-auto px-4 py-8 ">
          <h1 className="text-3xl text-center font-bold text-gray-900 ">Your Cart</h1>
          <div className="bg-white text-center">
            <img src={Carts} alt="Cart" className='flex items-center content-center m-auto w-lg h-lg' />
            <Link
              to="/products"
              className="inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className='bg-green-50'>
      {orderSuccess && <OrderConfirm />}
      <Header />
      <div className="container mx-auto mt-30 px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center"><ShoppingCartIcon sx={{ fontSize: 35, color: 'brown' }} /> Shopping Cart</h1>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="w-full lg:w-2/3 lg:p-6 p-1">
            <div className="overflow-x-auto">
              <table className="w-full table-auto min-w-[800px]">
                <thead>
                  <tr className="bg-green-500 text-white text-left text-sm font-semibold">
                    <th className="py-3 text-center text-lg w-40">Product Image</th>
                    <th className="py-3 text-center text-lg w-40">Product Name</th>
                    <th className="py-3 text-center text-lg w-40">Unit</th>
                    <th className="py-3 text-center text-lg w-20">Price</th>
                    <th className="py-3 text-center text-lg w-45">Quantity</th>
                    <th className="py-3 text-center text-lg w-30">Subtotal</th>
                    <th className="py-3 text-center text-lg"></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={`${item.prod_ID}-${item.selectedRate.key}`} className="border-b border-gray-200 bg-white hover:bg-gray- 50 transition duration-200">

                      <td className="py-4">
                        <Link to={`/product/${item.prod_ID}`}>
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.prod_Name}
                            className="flex items-center content-center m-auto w-16 h-16 object-fill rounded-md"
                          />
                        </Link>
                      </td>

                      <td className="py-4 text-center text-lg font-semibold"><Link to={`/product/${item.prod_ID}`}>{item.prod_Name}</Link></td>
                      <td className="py-4">
                        <div className="flex items-center justify-end w-25 h-3">
                          <div className="border border-gray-200 rounded-lg text-sm bg-gray-50 px-3 py-2 text-center font-semibold">
                            {item.selectedRate.key}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-lg font-semibold text-center">₹ {item.selectedRate.value.toFixed(2)}</td>
                      <td className="py-4 text-center">
                        <div className="flex items-center content-center m-auto gap-2 w-30">
                          <button
                            className="w-5 h-5 p-3 flex items-center justify-center rounded-xl bg-red-500 text-white hover:bg-red-600 transition duration-200 cursor-pointer"
                            onClick={() => handleDecrease(item.prod_ID, item.selectedRate)}
                          >
                            <RemoveIcon />
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item.quantity}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();

                              let inputValue = e.target.value;

                              inputValue = inputValue.replace(/[^0-9]/g, '');

                              if (inputValue === '') return;

                              const newQuantity = parseInt(inputValue, 10);

                              if (newQuantity >= 1) {
                                dispatch(updateCartItem({
                                  token,
                                  userId,
                                  prod_ID: item.prod_ID,
                                  quantity: newQuantity,
                                  selectedRate: item.selectedRate
                                }));
                              }
                            }}
                            onFocus={(e) => {
                              e.target.select();
                            }}
                            className="w-15 text-center border text-lg font-semibold text-gray-800 outline-none rounded focus:ring-1 focus:ring-blue-300"
                            style={{ MozAppearance: 'textfield' }}
                            onWheel={(e) => e.target.blur()}
                          />
                          <button
                            className="w-5 h-5 p-3 flex items-center justify-center rounded-xl bg-green-500 text-white hover:bg-green-600 transition duration-200 cursor-pointer"
                            onClick={() => handleIncrease(item.prod_ID, item.selectedRate)}
                          >
                            <AddIcon />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 text-md text-center font-semibold text-gray-800">
                        ₹ {(item.quantity * item.selectedRate.value).toFixed(2)}
                      </td>
                      <td className="py-4 text-center">
                        <button
                          className="text-red-600 hover:text-red-800 transition duration-200 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete({ prod_ID: item.prod_ID, selectedRate: item.selectedRate });
                            setDeleteModalOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="medium" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-full lg:w-1/3 bg-white rounded-2xl mt-6 shadow-xl">
            <h2 className="text-xl font-bold pl-5 bg-green-500 text-white pt-3 pb-3 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6 pl-6 pr-6 mt-10">
              <p className="flex justify-between text-sm">
                <span className='font-semibold'>Total:</span>
                <span className="font-semibold">₹ {total.toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-sm">
                <span className='font-semibold'>GST (18%):</span>
                <span className="font-semibold">₹ {gst.toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-sm">
                <span className='font-semibold'>Delivery Charge:</span>
                <span className="font-semibold">₹ {deliveryCharge.toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-sm">
                <span className='font-semibold'>Discount:</span>
                <span className="font-semibold">₹ {discount.toFixed(2)}</span>
              </p>
              <p className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Grand Total:</span>
                <span>₹ {grandTotal.toFixed(2)}</span>
              </p>
            </div>
            <div className='flex flex-col sm:flex sm:flex-row mb-6 pl-6 pr-6'>
              <div className='flex-col sm:flex-col'>
                <div>
                  <label className='font-bold text-lg'>Delivery Day <span className='text-red-500'>*</span></label>
                  <Select
                    placeholder="Select Duration"
                    indicator={<KeyboardArrowDown />}
                    sx={{
                      width: 167,
                      [`& .${selectClasses.indicator}`]: {
                        transition: '0.2s',
                        [`&.${selectClasses.expanded}`]: {
                          transform: 'rotate(-180deg)',
                        },
                      },
                      marginTop: '10px',
                      padding: '10px 10px'
                    }}
                    className='mr-30'
                    value={deliveryDay}
                    onChange={(event, value) => {
                      setDeliveryDay(value);
                      setValidationErrors(prev => ({ ...prev, deliveryDay: '' }));
                    }}
                    required
                  >
                    {availableDays.map((day) => (
                      <Option key={day} value={day}>{day}</Option>
                    ))}
                  </Select>
                  {validationErrors.deliveryDay && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.deliveryDay}</p>
                  )}
                </div>

                <div>
                  <label className='font-bold text-lg'>Delivery Time <span className='text-red-500'>*</span></label>
                  <Select
                    placeholder="Select Time Slot"
                    indicator={<KeyboardArrowDown />}
                    sx={{
                      width: 167,
                      [`& .${selectClasses.indicator}`]: {
                        transition: '0.2s',
                        [`&.${selectClasses.expanded}`]: {
                          transform: 'rotate(-180deg)',
                        },
                      },
                      marginTop: '10px',
                      padding: '10px 10px'
                    }}
                    disabled={availableTimeSlots.length === 0}
                    value={deliveryTime}
                    onChange={(event, value) => {
                      setDeliveryTime(value);
                    }}
                    required
                  >
                    {availableTimeSlots.map((slot) => (
                      <Option key={slot} value={slot}>{slot}</Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
            {validationErrors.deliveryTime && (
              <p className="text-sm text-red-600 mt-2 mb-2">{validationErrors.deliveryTime}</p>
            )}
            {timeSlotError && (
              <p className="text-sm text-red-600 mt-2 mb-2">{timeSlotError}</p>
            )}
            <div className='mb-6 pl-6 pr-6'>
              <label className='font-bold text-lg'>Delivery Centre <span className='text-red-500'>*</span></label>
              <Select
                placeholder="Select Delivery Centre"
                indicator={<KeyboardArrowDown />}
                sx={{
                  [`& .${selectClasses.indicator}`]: {
                    transition: '0.2s',
                    [`&.${selectClasses.expanded}`]: {
                      transform: 'rotate(-180deg)',
                    },
                  },
                  marginTop: '10px',
                  padding: '10px 10px'
                }}
                value={direction}
                onChange={(event, value) => {
                  setDirection(value);
                  setValidationErrors(prev => ({ ...prev, direction: '' }));
                }}
                defaultValue={(deliveryCentres.length > 0 ? deliveryCentres[0].deliveryNickName : '')}
                required
              >
                {deliveryCentres.length > 0 ? (
                  deliveryCentres.map((centre) => (
                    <Option key={centre.id} value={centre.deliveryNickName}>
                      {centre.deliveryNickName}
                    </Option>
                  ))
                ) : (
                  <Option value="" disabled>Loading delivery centres...</Option>
                )}
              </Select>
              {validationErrors.direction && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.direction}</p>
              )}
            </div>

            <div className='mb-6 border border-gray-300 rounded-md ml-6 mr-6 p-2'>
              <div className=''>
                <label className='mr-55 font-bold text-lg'>Address <span className='text-red-500 font-bold'>*</span></label>
              </div>
              <button className='w-full py-2'><Link
                to="/delivery-address"
                className="flex items-center justify-center w-full py-3 bg-white border border-gray-300 rounded-lg shadow hover:bg-green-50 hover:border-green-500 transition-colors duration-200"
              >
                <span className="flex items-center justify-center border-3 border-green-400 rounded-full mr-3">
                  <AddIcon className="text-black" />
                </span>
                <span className="text-black text-lg font-bold hover:text-green-500">
                  Add Address
                </span>
              </Link>
              </button>
              <div>
                {deliveryAddress.length > 0 ? (
                  deliveryAddress.map((addr) => (
                    <div
                      key={addr.id}
                      className={`flex items-center mb-2 p-2 mt-2 cursor-pointer ${selectedAddress === addr.id ? 'border-3 border-green-300 rounded-lg p-2 cursor-pointer' : 'cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        id={addr.id}
                        name="deliveryAddress"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => {
                          setSelectedAddress(addr.id);
                          setValidationErrors(prev => ({ ...prev, address: '' }));
                        }}
                        className="mr-2 h-6 w-6 cursor-pointer"
                        required
                      />
                      <label htmlFor={addr.id} className="text-sm text-gray-800 flex flex-col cursor-pointer">
                        <span className='font-bold text-lg uppercase'>{addr.nickName}</span>
                        {selectedAddress === addr.id && (
                          <span>
                            <span className='font-bold'>City:</span> {addr.city} | <span className='font-bold'>Mobile:</span> {addr.mobile}
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600 mt-2">
                    No addresses available, please add an address.
                  </p>
                )}
              </div>
              {validationErrors.address && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.address}</p>
              )}
            </div>

            <div className='mb-6 border border-gray-300 rounded-md ml-6 mr-6 p-2'>
              <div className=''>
                <label className='mr-55 font-bold text-lg'>Notes</label>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Add any special instructions or notes for your order"
              />
            </div>

            <div className='flex mx-5 pb-6 items-center content-center'>
              <Button
                variant="contained"
                color="primary"
                className='flex items-center justify-center w-full text-xl font-bold py-15'
                onClick={handleConfirmOrder}
                sx={{ padding: '15px 0 15px 0', fontSize: '20px', fontWeight: 'bold' }}
              >
                Confirm Order
              </Button>
            </div>
          </div>
        </div>
        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 420,
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
              p: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              Are You Sure You Want to Remove This Item?
            </Typography>

            <Typography sx={{ mt: 2, color: 'text.secondary' }}>
              This action cannot be undone.
            </Typography>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  if (itemToDelete) {
                    handleRemove(itemToDelete.prod_ID, itemToDelete.selectedRate);
                  }
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
              >
                Yes, Remove
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
}