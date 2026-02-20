import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import EditIcon from '@mui/icons-material/Edit';
import DeliveryHeader from '../Components/DeliveryHeader';
// import Ordered from '../../Images/ordered.png';
import Placed from '../../Images/placed.png';
import Delivered from '../../Images/delivered.png';
import Cancelled from '../../Images/cancelled.png';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PlaylistAddCheckCircleOutlinedIcon from '@mui/icons-material/PlaylistAddCheckCircleOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import { useCallback } from 'react';

export default function DeliveryHome() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderCounts, setOrderCounts] = useState({
    'Order Placed': 0,
    'Confirmed': 0,
    'Delivered': 0,
    'Cancelled': 0,
  });
  const [filteredStatus, setFilteredStatus] = useState('Order Placed');
  const [activeFilter, setActiveFilter] = useState('Order Placed');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [actualQtyInput, setActualQtyInput] = useState('');

  // Track which orders have unsaved actual quantities
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState({});

  const currentUser = useSelector((state) => state.user.currentUser);
  const deliveryNickName = currentUser?.deliveryCentre?.deliveryNickName || '';
  const userId = currentUser?.deliveryCentre?.id;
  const token = currentUser?.token;

  console.log('Current User:', currentUser);
  console.log('Current User ID:', userId);
  console.log('Delivery NickName:', deliveryNickName);

  const fetchOrders = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/delivery/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      const data = await response.json();
      console.log('Fetched orders:', data);
      console.log('Order directions:', data.map(order => ({ id: order.order_ID, direction: order.order_direction })));
      const myOrders = data;
      setOrders(myOrders);
      const counts = myOrders.reduce((acc, order) => {
        const status = order.deliveryProcess || 'Order Placed';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, { 'Order Placed': 0, 'Confirmed': 0, 'Delivered': 0, 'Cancelled': 0 });
      setOrderCounts(counts);

      const expanded = {};
      myOrders.forEach(o => expanded[o.order_ID] = true);
      setExpandedOrders(expanded);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [deliveryNickName, userId]);

  const toggleExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusFilter = (status) => {
    setFilteredStatus(status);
    setActiveFilter(status);
  };

  const filteredOrders = orders.filter(o => o.deliveryProcess === filteredStatus);

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

  const openActualQtyModal = (orderId, item) => {
    setCurrentOrderId(orderId);
    setCurrentItem(item);
    setActualQtyInput(item.actual_quantity > 0 ? String(item.actual_quantity) : '');
    setModalOpen(true);
  };

  const handleActualQtyChange = (value) => {
    if (value === '' || (!isNaN(value) && Number(value) >= 0)) {
      setActualQtyInput(value);

      if (!currentItem || !currentOrderId) return;

      const qty = value === '' ? 0 : Number(value);
      const actualSubtotal = qty * currentItem.selectedRate.value;

      setOrders(prevOrders => prevOrders.map(order => {
        if (order.order_ID !== currentOrderId) return order;

        const updatedItems = order.order_items.map(item =>
          item.prod_ID === currentItem.prod_ID
            ? { ...item, actual_quantity: qty, actual_subtotal: actualSubtotal }
            : item
        );

        const hasActual = updatedItems.some(i => i.actual_quantity > 0);
        let actualGrandTotal = 0;
        if (hasActual) {
          const subtotals = updatedItems.map(i => i.actual_subtotal > 0 ? i.actual_subtotal : i.subtotal);
          actualGrandTotal = subtotals.reduce((a, b) => a + b, 0) + order.gst + order.deliveryCharge - order.discount;
        }

        return { ...order, order_items: updatedItems, actual_grandTotal: hasActual ? actualGrandTotal : 0 };
      }));

      if (qty > 0) {
        setHasUnsavedChanges(prev => ({ ...prev, [currentOrderId]: true }));
      }
    }
  };

  const saveActualQuantitiesToDB = async (orderId) => {
    console.log(`Frontend: Starting save for order ${orderId}`);
    const order = orders.find(o => o.order_ID === orderId);
    if (!order) return;

    try {
      const payload = {
        order_items: order.order_items,
        actual_grandTotal: order.actual_grandTotal || 0
      };

      console.log(`Frontend: Sending payload for order ${orderId}:`, JSON.stringify(payload, null, 2));

      const res = await fetch(`/delivery/updateorder/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log(`Frontend: Save successful for order ${orderId}`);
        alert('Update the Actual Quantity!');
        setHasUnsavedChanges(prev => ({ ...prev, [orderId]: false }));
        console.log(`Frontend: About to fetch orders after save...`);
        await fetchOrders();
        console.log(`Frontend: Orders fetched after save`);
      } else {
        const err = await res.json();
        alert('Failed to save: ' + (err.message || 'Try again'));
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Network error');
    }
  };

  const handleConfirmedOrder = async (orderId, status) => {
    try {
      const res = await fetch(`/delivery/updateorder/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryProcess: status }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('Update failed');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  if (loading) {
    return (
      <div className="bg-green-50 min-h-screen">
        <DeliveryHeader />
        <div className="flex items-center justify-center h-screen">
          <div className="text-2xl font-semibold text-gray-700">Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-green-50 min-h-screen'>
      <DeliveryHeader />

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Adjust Actual Delivered Quantity</DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <strong>Product:</strong> {currentItem?.prod_Name}
          </div>
          <div className="mb-4">
            <strong>Ordered:</strong> {currentItem?.order_quantity} {currentItem?.selectedRate.key}
          </div>
          <TextField
            label="Actual Quantity Delivered"
            type="number"
            fullWidth
            value={actualQtyInput}
            onChange={(e) => handleActualQtyChange(e.target.value)}
            inputProps={{ min: 0, step: "0.001" }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <div className="w-full mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">
          Delivery Dashboard - My Orders
        </h2>

        <div className="text-center text-sm text-gray-600 mb-6">
          Logged in as: <strong>{deliveryNickName || 'Unknown'}</strong> (ID: {userId || 'N/A'})
          <br />
          <small>Token: {token ? 'Present' : 'Missing'}</small>
        </div>

        <div className='mt-20 px-4 sm:px-0'>
          <Box
            sx={{
              width: '90%',              
              mx: 'auto',        
              display: 'grid',
              alignItems: 'center',
              justifyContent: 'center',
              gridTemplateColumns: {
                xs: '1fr',                    
                sm: 'repeat(2, minmax(240px, 1fr))', 
                md: 'repeat(2, minmax(260px, 1fr))',
                lg: 'repeat(4, minmax(280px, 1fr))',
                xl: 'repeat(4, minmax(320px, 1fr))',
              },
              gap: { xs: 4, sm: 5, lg: 6 },
              px: { xs: 2, sm: 0 }, // Small side padding on mobile
            }}
          >
            {/* Order Placed */}
            <Card sx={{ borderRadius: '20px', boxShadow: 5, ':hover': { boxShadow: 8, transform: 'scale(1.10)', transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out' } }}>
              <CardActionArea onClick={() => handleStatusFilter('Order Placed')} sx={{ height: '100%', borderBottom: activeFilter === 'Order Placed' ? '7px solid' : 'none', borderBottomColor: activeFilter === 'Order Placed' ? '#1E90FF' : 'inherit', '&:hover': { borderBottomColor: activeFilter === 'Order Placed' ? '#1E90FF' : 'action.hover' } }}>
                <CardContent>
                  <div className='flex gap-3 items-center justify-between'>
                    <div className='h-15 w-15 text-center border-5 border-sky-500 rounded-full flex-shrink-0 flex items-center justify-center'>
                      {/* <img src={Ordered} alt="" className='h-9 w-9 ml-2.5 mt-2.5' /> */}
                      <ShoppingCartOutlinedIcon sx={{ width: '55px', height: '55px', fontSize: '10px', color: '#1E90FF', padding: '9px' }} />
                    </div>
                    <div className='flex-1 text-center sm:text-left'>
                      <div className='text-4xl  h-8 w-8 rounded-full flex items-center justify-center text-sky-600 font-bold flex-shrink-0'>
                        {orderCounts['Order Placed']}
                      </div>
                      <h1 className='font-medium pt-1 text-lg sm:text-xl'>Order Placed</h1>
                    </div>
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>

            {/* Confirmed */}
            <Card sx={{ borderRadius: '20px', boxShadow: 5, ':hover': { boxShadow: 8, transform: 'scale(1.10)', transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out' } }}>
              <CardActionArea onClick={() => handleStatusFilter('Confirmed')} sx={{ height: '100%', borderBottom: activeFilter === 'Confirmed' ? '7px solid' : 'none', borderBottomColor: activeFilter === 'Confirmed' ? '#FF6E00' : 'inherit', '&:hover': { borderBottomColor: activeFilter === 'Confirmed' ? '#FF6E00' : 'action.hover' } }}>
                <CardContent>
                  <div className='flex gap-3 items-center justify-between'>
                    <div className='h-15 w-15 text-center flex-shrink-0 rounded-full  flex items-center justify-center '>
                      {/* <img src={Placed} alt="" className='h-10 w-10 ml-3 mt-2' /> */}
                      <PlaylistAddCheckCircleOutlinedIcon sx={{ width: '80px', height: '80px', fontSize: '10px', color: '#FF6E00 ', padding: '3px' }} />
                    </div>
                    <div className='flex-1 text-center sm:text-left'>
                      <div className='text-4xl h-8 w-8 rounded-full flex items-center justify-center text-orange-500 font-bold flex-shrink-0'>
                        {orderCounts['Confirmed']}
                      </div>
                      <h1 className='font-medium text-lg sm:text-xl'>Confirmed</h1>
                    </div>
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>

            {/* Delivered */}
            <Card sx={{ borderRadius: '20px', boxShadow: 5, ':hover': { boxShadow: 8, transform: 'scale(1.10)', transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out' } }}>
              <CardActionArea onClick={() => handleStatusFilter('Delivered')} sx={{ height: '100%', borderBottom: activeFilter === 'Delivered' ? '7px solid' : 'none', borderBottomColor: activeFilter === 'Delivered' ? '#48BB78' : 'inherit', '&:hover': { borderBottomColor: activeFilter === 'Delivered' ? '#48BB78' : 'action.hover' } }}>
                <CardContent>
                  <div className='flex gap-3 items-center justify-between'>
                    <div className='h-15 w-15 text-center flex-shrink-0 rounded-full  flex items-center justify-center'>
                      {/* <img src={Delivered} alt="" className='h-10 w-10 ml-2.5 mt-3' /> */}
                      <AssignmentTurnedInOutlinedIcon sx={{ width: '80px', height: '80px', fontSize: '10px', color: '#48BB78', padding: '3px' }} />
                    </div>
                    <div className='flex-1 text-center sm:text-left'>
                      <div className='text-4xl h-8 w-8 rounded-full flex items-center justify-center text-green-500 font-bold flex-shrink-0'>
                        {orderCounts['Delivered']}
                      </div>
                      <h1 className='font-medium text-lg sm:text-xl'>Delivered</h1>
                    </div>

                  </div>
                </CardContent>
              </CardActionArea>
            </Card>

            {/* Cancelled */}
            <Card sx={{ borderRadius: '20px', boxShadow: 5, ':hover': { boxShadow: 8, transform: 'scale(1.10)', transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out' } }}>
              <CardActionArea onClick={() => handleStatusFilter('Cancelled')} sx={{ height: '100%', borderBottom: activeFilter === 'Cancelled' ? '7px solid' : 'none', borderBottomColor: activeFilter === 'Cancelled' ? '#FF0000' : 'inherit', '&:hover': { borderBottomColor: activeFilter === 'Cancelled' ? '#FF0000' : 'action.hover' } }}>
                <CardContent>
                  <div className='flex items-center gap-3 justify-between'>
                    <div className='h-17 w-17 text-center flex-shrink-0 rounded-full flex items-center justify-center '>
                      <img src={Cancelled} alt="" className='h-17 w-17  ' />
                    </div>
                    <div className='flex-1 text-center sm:text-left'>
                      <div className='text-4xl h-8 w-8 rounded-full flex items-center justify-center text-red-600 font-bold flex-shrink-0'>
                        {orderCounts['Cancelled']}
                      </div>
                      <h1 className='font-medium text-lg sm:text-xl'>Cancelled</h1>
                    </div>

                  </div>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        </div>

        <div className="mt-10 mx-10">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-600">No orders in <strong>{filteredStatus}</strong> status</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredOrders.map((order) => {
                const hasActualQty = order.order_items.some(item => item.actual_quantity > 0);
                const hasUnsaved = hasUnsavedChanges[order.order_ID];

                // Safe fallback for area display
                const displayArea = order.order_direction ||
                  order.order_selectedAddress?.area ||
                  order.order_selectedAddress?.city ||
                  'N/A';

                return (
                  <div key={order.order_ID} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                      <div className="flex justify-between items-center">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm md:text-base">
                          <div><strong>Order ID:</strong> {order.order_ID}</div>
                          <div><strong>Date:</strong> {order.currentDate}</div>
                          <div><strong>Time:</strong> {order.currentTime}</div>
                          <div className='border border-emerald-300 rounded-full bg-green-300 text-black text-md mx-auto px-2 py-1'><strong>Status:</strong> {order.deliveryProcess}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {order.deliveryProcess === 'Order Placed' && (
                            <div>
                              {hasActualQty && (
                                <button
                                  onClick={() => saveActualQuantitiesToDB(order.order_ID)}
                                  className={`p-2 rounded-lg text-white text-center font-bold ${hasUnsaved ? 'bg-yellow-500' : 'bg-green-500'} hover:bg-green-700`}
                                >
                                  <EditIcon fontSize="small" />
                                  <span className='pl-2'>Save Edited Value</span>
                                </button>
                              )}
                            </div>
                          )}
                          <button onClick={() => toggleExpand(order.order_ID)}>
                            <svg className={`w-8 h-8 transition-transform ${expandedOrders[order.order_ID] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedOrders[order.order_ID] && (
                      <div className="p-6 grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                          <h3 className="font-bold text-xl mb-4 text-gray-800">Order Items</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full table-auto border-collapse">
                              <thead>
                                <tr className="bg-gray-100 text-left text-sm font-semibold">
                                  <th className="p-3 text-center">Image</th>
                                  <th className="p-3 text-center">Product</th>
                                  <th className="p-3 text-center">Unit</th>
                                  <th className="p-3 text-center">Qty</th>
                                  <th className="p-3 text-center">Actual Qty</th>
                                  <th className="p-3 text-right">Rate</th>
                                  <th className="p-3 text-right">Subtotal</th>
                                  {hasActualQty ? (
                                    <th className="p-3 text-right">Actual Subtotal</th>
                                  ) : <th className="p-3 text-right">Actual Subtotal</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {order.order_items.map((item) => (
                                  <tr key={item.prod_ID} className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-center">
                                      <img src={getImageUrl(item.image)} alt={item.prod_Name} className="w-14 h-14 object-cover rounded mx-auto" />
                                    </td>
                                    <td className="p-3 text-center font-medium">{item.prod_Name}</td>
                                    <td className="p-3 text-center text-sm">{item.selectedRate.key}</td>
                                    <td className="p-3 text-center font-semibold">{item.order_quantity}</td>
                                    {order.deliveryProcess === 'Order Placed' ? (
                                      <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <span className="font-semibold text-blue-600">
                                            {item.actual_quantity > 0 ? item.actual_quantity : '-'}
                                          </span>
                                          <button
                                            onClick={() => openActualQtyModal(order.order_ID, item)}
                                            className="text-blue-600 hover:text-blue-800"
                                          >
                                            <EditIcon fontSize="small" />
                                          </button>
                                        </div>
                                      </td>
                                    ) : (<td className="p-3 text-center">{item.actual_quantity || "-"}</td>)}
                                    <td className="p-3 text-right">₹{item.selectedRate.value.toFixed(2)}</td>
                                    <td className="p-3 text-right font-bold">₹{item.subtotal.toFixed(2)}</td>
                                    <td className="p-3 text-right font-bold text-green-600">
                                      {item.actual_subtotal > 0 ? `₹${item.actual_subtotal.toFixed(2)}` : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 border">
                          <h3 className="font-bold text-xl mb-4 text-center text-blue-600">Order Summary</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span>Total:</span> <strong>₹{order.total.toFixed(2)}</strong></div>
                            <div className="flex justify-between"><span>GST:</span> <strong>₹{order.gst.toFixed(2)}</strong></div>
                            <div className="flex justify-between"><span>Delivery:</span> <strong>₹{order.deliveryCharge.toFixed(2)}</strong></div>
                            <div className="flex justify-between"><span>Discount:</span> <strong>-₹{order.discount.toFixed(2)}</strong></div>
                            {order.actual_grandTotal > 0 ? (
                              <div className="border-t pt-3 flex justify-between text-lg font-bold text-red-600 line-through">
                                <span className="text-gray-600">Grand Total:</span>
                                <span className="text-gray-600">₹{order.grandTotal.toFixed(2)}</span>
                              </div>
                            ) : (
                              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                <span>Grand Total:</span>
                                <span className="text-green-600">₹{order.grandTotal.toFixed(2)}</span>
                              </div>
                            )}
                            {(order.deliveryProcess === 'Order Placed' || (hasActualQty && order.actual_grandTotal > 0)) ? (
                              <div className="border-t pt-3 mt-4 flex justify-between text-lg font-bold text-purple-600">
                                <span>Actual Grand Total:</span>
                                <span>₹{order.actual_grandTotal.toFixed(2)}</span>
                              </div>
                            ) : (
                              <div className="border-t pt-3 mt-4 flex justify-between text-lg font-bold text-purple-600">
                                <span>Actual Grand Total:</span>
                                <span>₹{order.actual_grandTotal.toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 space-y-3 text-sm">
                            <p><strong>Delivery Day:</strong> {order.order_deliveryDay}</p>
                            <p><strong>Time:</strong> {order.order_deliveryTime}</p>
                            <p><strong>Area:</strong> {displayArea}</p>
                            <p><strong>Address:</strong> {order.order_selectedAddress.address}, {order.order_selectedAddress.city}</p>
                          </div>

                          {order.deliveryProcess !== 'Confirmed' && order.deliveryProcess !== 'Delivered' && order.deliveryProcess !== 'Cancelled' && (
                            <div className="mt-6 text-center w-full">
                              <button className='bg-blue-600 w-full text-white text-lg font-bold px-4 py-2 rounded-lg hover:bg-blue-700' onClick={() => handleConfirmedOrder(order.order_ID, 'Confirmed')}>
                                Confirm Order
                              </button>
                            </div>
                          )}
                          {order.deliveryProcess !== 'Delivered' && order.deliveryProcess !== 'Order Placed' && order.deliveryProcess !== 'Cancelled' && (
                            <div className="mt-2 text-center w-full">
                              <button className='bg-green-600 w-full text-white text-lg font-bold px-4 py-2 rounded-lg hover:bg-green-700' onClick={() => handleConfirmedOrder(order.order_ID, 'Delivered')}>
                                Mark as Delivered
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}