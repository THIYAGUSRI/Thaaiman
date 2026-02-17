import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Header from '../Components/Common Components/Header';
import Ordered from '../../Images/ordered.png';
import Placed from '../../Images/placed.png';
import Delivered from '../../Images/delivered.png';
import Cancelled from '../../Images/cancelled.png';
import History from '../../Images/history.png';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PlaylistAddCheckCircleOutlinedIcon from '@mui/icons-material/PlaylistAddCheckCircleOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ShoppingBag from '../../Images/shopping-bag.png';

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [orderCounts, setOrderCounts] = useState({
    'Order Placed': 0,
    'Confirmed': 0,
    'Delivered': 0,
    'Cancelled': 0,
  });
  const changeDate = { "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec" };
  const [filteredStatus, setFilteredStatus] = useState('Order Placed');
  const [activeFilter, setActiveFilter] = useState('Order Placed');
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();
  const userId = currentUser?.user?.userID;
  const token = currentUser?.token;

  useEffect(() => {
    if (orders.length > 0) {
      const initialExpanded = {};
      orders.forEach((order) => {
        initialExpanded[order.order_ID] = true;
      });
      setExpandedOrders(initialExpanded);
    }
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        const userOrders = data.filter(
          (order) => order.userID === userId
        );

        const uniqueOrders = Array.from(
          new Map(userOrders.map(order => [order.order_ID, order])).values()
        ).sort((a, b) => Number(b.order_ID) - Number(a.order_ID));

        setOrders(uniqueOrders);
        console.log(uniqueOrders);

        const counts = uniqueOrders.reduce(
          (acc, order) => {
            const status = order.deliveryProcess;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          },
          { 'Order Placed': 0, 'Confirmed': 0, 'Delivered': 0, 'Cancelled': 0 }
        );

        setOrderCounts(counts);
      }
      else {
        console.error('Error fetching orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !(prev[orderId] ?? true),
    }));
  };

  const openCancelModal = (orderId) => {
    setOrderToCancel(orderId);
    setIsModalOpen(true);
  };

  const closeCancelModal = () => {
    setOrderToCancel(null);
    setIsModalOpen(false);
  };

  const confirmCancel = async () => {
    if (!orderToCancel) return;
    try {
      const response = await fetch(`/updateorder/${orderToCancel}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderdetails: {
            order: {
              deliveryProcess: 'Cancelled',
            },
          },
        }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Order cancelled successfully:', orderToCancel);
        fetchOrders();
      } else {
        console.error('Error cancelling order:', data.message);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      closeCancelModal();
    }
  };

  const handleStatusFilter = (status) => {
    setFilteredStatus(status);
    setActiveFilter(status);
  };

  const handleHistoryClick = () => {
    setActiveFilter('History');
    navigate('/history');
  };

  const filteredOrders = orders.filter((order) => order.deliveryProcess === filteredStatus);

  const getImageUrl = (imgPath) => {
    if (!imgPath) return '/Uploads/no-image.png';
    const normalizedPath = imgPath.replace(/\\/g, '/');
    return normalizedPath.startsWith('http')
      ? normalizedPath
      : `/uploads/${normalizedPath}`;
  };

  return (
    <div className='bg-green-50 mt-30 min-h-screen'>
      <Header />
      <div className="w-full mx-auto px-4 py-8 lg:px-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Your Orders</h2>

        {/* Filter Cards Section - Improved for Mobile & Tablet */}
        <div className='mt-20 px-4 sm:px-0'>
          <Box
            sx={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',          // Mobile: single column, History centered
                sm: 'repeat(2, 1fr)', // Small tablet: 2 columns
                md: 'repeat(3, 1fr)', // Tablet: 3 columns
                lg: 'repeat(5, 1fr)', // Laptop: 5 columns (unchanged)
              },
              gap: { xs: 4, sm: 5, lg: 5 },
              justifyItems: 'stretch',
            }}
          >
            {/* Order Placed */}
            <Card sx={{ borderRadius: '20px', boxShadow: 5, ':hover': { boxShadow: 8, transform: 'scale(1.10)', transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out' } }}>
              <CardActionArea onClick={() => handleStatusFilter('Order Placed')} sx={{ height: '100%', borderBottom: activeFilter === 'Order Placed' ? '7px solid' : 'none', borderBottomColor: activeFilter === 'Order Placed' ? '#1E90FF' : 'inherit', '&:hover': { borderBottomColor: activeFilter === 'Order Placed' ? '#1E90FF' : 'action.hover' } }}>
                <CardContent>
                  <div className='flex gap-3 items-center justify-between'>
                    <div className=' flex items-center justify-center'>
                      <img src={ShoppingBag} alt="" className='h-14 w-14' />
                      {/* <ShoppingCartOutlinedIcon sx={{ width: '55px', height: '55px', fontSize: '10px', color: '#1E90FF', padding: '9px' }} /> */}
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
                      <AssignmentTurnedInOutlinedIcon sx={{ width: '80px', height: '80px', fontSize: '10px', color: '#48BB78', padding: '3px' }}/>
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

            {/* History Detail - Centered on Mobile & Tablet */}
            <Box
              sx={{
                gridColumn: {
                  xs: 'span 1',     // Full width and centered on mobile
                  sm: 'span 1',     // Full width on small tablet too
                  md: 'span 1',     // Normal span on larger screens
                },
                justifySelf: { xs: 'center', sm: 'center', md: 'stretch' },
                width: '100%'
              }}
            >
              <Card sx={{ borderRadius: '20px', boxShadow: 5, ':hover': { boxShadow: 8, transform: 'scale(1.10)', transition: 'transform 0.3s ease-in-out, boxShadow 0.3s ease-in-out' } }}>
                <CardActionArea onClick={handleHistoryClick} sx={{ height: '100%', backgroundColor: activeFilter === 'History' ? 'rgba(181, 150, 110, 0.4)' : 'inherit', '&:hover': { backgroundColor: activeFilter === 'History' ? 'rgba(181, 150, 110, 0.4)' : 'action.hover' } }}>
                  <CardContent>
                    <div className='flex gap-3 items-center sm:text-left'>
                      <div className='h-15 w-15 flex items-center justify-center rounded-full border-5 flex-shrink-0'>
                        <img src={History} alt="" className='h-10 w-10' />
                      </div>
                      <h1 className='font-bold text-lg sm:text-xl'>History Detail</h1>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          </Box>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-lg text-gray-600 text-center mt-10">No orders found for this status.</p>
        ) : (
          <div className="mt-15 mx-4 lg:mx-13">
            {filteredOrders.map((order, index) => (
              <div
                key={`${order.order_ID}-${index}`}
                className="border border-gray-200 bg-white rounded-2xl shadow-xl p-6 mb-10 relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:pr-12">
                    <p className="text-lg font-bold text-gray-800">
                      Order ID: {order.order_ID}
                    </p>
                    <p className="text-lg text-start sm:text-end text-gray-800 md:pr-15 sm:pr-15">Date: <span className='font-extrabold'>{changeDate[order.currentDate.slice(5, 7)]} {order.currentDate.slice(8, 10)}, {order.currentDate.slice(0, 4)}</span></p>
                    <div className='text-start sm:text-center'>
                      <p className="text-black bg-green-100 rounded-full text-xl pl-2.5 p-1 inline-block">
                        Status: <span className='inline-block text-xl font-bold bg-green-100 text-blue-800  px-2'>
                          {order.deliveryProcess}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(order.order_ID)}
                    className="absolute top-6 right-6 text-gray-600 hover:text-gray-900 transition-transform duration-300 z-10"
                  >
                    <svg
                      className={`w-8 h-8 transform transition-transform duration-300 ${expandedOrders[order.order_ID] ? '' : 'rotate-180'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>

                {expandedOrders[order.order_ID] && (
                  <div className="flex flex-col lg:flex-row gap-6 mt-6">
                    <div className="w-full lg:w-2/3 overflow-x-auto">
                      <table className="w-full table-auto border-collapse">
                        <thead>
                          <tr className="bg-green-500 text-white text-left text-sm font-semibold">
                            <th className="p-4 text-center">Product Image</th>
                            <th className="p-4 text-center">Product Name</th>
                            <th className="p-4 text-center">Unit</th>
                            <th className="p-4 text-center">Orderd Quantity</th>
                            {(order.actual_quantity > 0 || order.actual_subtotal > 0 || order.actual_grandTotal > 0) && (
                              <th className="p-4 text-center">Deliverd Quantity</th>
                            )}
                            <th className="p-4 text-center">Rate</th>
                            <th className="p-4 text-center">Subtotal</th>
                            {(order.actual_quantity > 0 || order.actual_subtotal > 0 || order.actual_grandTotal > 0) && (
                              <th className="p-4 text-center">Actual SubTotal</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {order.order_items.map((item) => (
                            <tr key={`${item.prod_ID}-${item.selectedRate.key}-${index}`} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                              <td className="p-4 text-center">
                                <img src={getImageUrl(item.image)} alt={item.prod_Name} className="w-16 h-16 object-cover rounded mx-auto" />
                              </td>
                              <td className="p-4 text-center">{item.prod_Name}</td>
                              <td className="p-4 text-center">{item.selectedRate.key}</td>
                              <td className={`${item.actual_quantity > 0 ? ('p-4 line-through text-center text-red-500') : ('p-4 text-center')}`}>{item.order_quantity}</td>
                              {(order.actual_quantity > 0 || order.actual_subtotal > 0 || order.actual_grandTotal > 0) && (
                                <td className="p-4 text-center">{item.actual_quantity > 0 ? item.actual_quantity : "-"}</td>
                              )}
                              <td className="p-4 text-center">₹{item.selectedRate.value.toFixed(2)}</td>
                              <td className={`${item.actual_quantity > 0 ? ('p-4 line-through text-center font-medium text-red-500') : ('p-4 text-center font-medium')}`}>₹{item.subtotal}</td>
                              {(order.actual_quantity > 0 || order.actual_subtotal > 0 || order.actual_grandTotal > 0) && (
                                <td className="p-4 text-center">
                                  {item.actual_subtotal > 0 ? `₹${item.actual_subtotal.toFixed(2)}` : "-"}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="w-full lg:w-1/3 shadow-xl border border-gray-200 rounded-lg bg-gray-50">
                      <h2 className="font-bold text-xl bg-green-500 text-white py-4 text-center rounded-t-lg">Order Summary</h2>
                      <div className="p-6 space-y-3 text-sm">
                        <p className="flex justify-between"><span>Total:</span><span className="font-medium">₹{order.total.toFixed(2)}</span></p>
                        <p className="flex justify-between"><span>GST (18%):</span><span className="font-medium">₹{order.gst.toFixed(2)}</span></p>
                        <p className="flex justify-between"><span>Delivery Charge:</span><span className="font-medium">₹{order.deliveryCharge.toFixed(2)}</span></p>
                        <p className="flex justify-between"><span>Discount:</span><span className="font-medium">₹{order.discount.toFixed(2)}</span></p>
                        {order.actual_grandTotal > 0 ? (
                          <p className="flex justify-between text-lg text-red-500 font-bold py-3 border-t border-b border-gray-300 line-through">
                            <span className='text-blue-600'>Grand Total:</span>
                            <span className="text-blue-600">₹{order.grandTotal.toFixed(2)}</span>
                          </p>
                        ) : (
                          <p className="flex justify-between text-lg font-bold border-gray-300 py-3 border-t border-b">
                            <span className='text-blue-600'>Grand Total:</span>
                            <span className="text-blue-600">₹{order.grandTotal.toFixed(2)}</span>
                          </p>
                        )}
                        {order.actual_grandTotal > 0 && (<p className="flex justify-between text-lg font-bold border-gray-300">
                          <span className='text-purple-600'>Grand Total:</span>
                          <span className="text-purple-600">₹{order.actual_grandTotal.toFixed(2)}</span>
                        </p>)}

                      </div>

                      <div className="px-6 pb-6 space-y-3 text-sm">
                        <p><strong>Delivery Day:</strong> {order.order_deliveryDay}</p>
                        <p><strong>Delivery Time:</strong> {order.order_deliveryTime}</p>
                        <p><strong>Direction:</strong> {order.order_direction}</p>
                        <p><strong>Address:</strong> {order.order_selectedAddress.address}, {order.order_selectedAddress.city}, {order.order_selectedAddress.state} - {order.order_selectedAddress.pincode}</p>
                        {order.order_selectedAddress.landMark && (
                          <p><strong>Landmark:</strong> {order.order_selectedAddress.landMark}</p>
                        )}
                      </div>

                      {order.deliveryProcess !== "Cancelled" && order.deliveryProcess !== "Confirmed" && order.deliveryProcess !== "Delivered" && (
                        <div className="px-6 pb-6">
                          <button
                            onClick={() => openCancelModal(order.order_ID)}
                            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-medium"
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Cancellation</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this order?</p>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button onClick={closeCancelModal} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 order-2 sm:order-none">
                No, Keep Order
              </button>
              <button onClick={confirmCancel} className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 order-1 sm:order-none">
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}