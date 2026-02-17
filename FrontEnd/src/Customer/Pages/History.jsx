import React, { useEffect, useState } from 'react';
import Header from '../Components/Common Components/Header';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';

export default function History() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    deliveryProcess: ''
  });
  const [expandedOrder, setExpandedOrder] = useState({}); // Changed from null to {}
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?.user?.userID;
  const token = currentUser?.token;

  const fetchOrders = async () => {
    try {
      const response = await fetch('/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        const userOrders = data.filter((order) => order.userID === userId);
        const uniqueOrders = Array.from(
          new Map(userOrders.map((order) => [order.order_ID, order])).values()
        );
        const sortedOrders = uniqueOrders.sort((a, b) => 
          b.currentDate.localeCompare(a.currentDate)
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);      
      } else {
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

  const applyFilters = () => {
    let result = [...orders];
    
    if (filters.fromDate) {
      result = result.filter(order => 
        order.currentDate >= filters.fromDate
      );
    }
    if (filters.toDate) {
      result = result.filter(order => 
        order.currentDate <= filters.toDate
      );
    }
    
    if (filters.deliveryProcess) {
      result = result.filter(order => 
        order.deliveryProcess === filters.deliveryProcess
      );
    }
    
    setFilteredOrders(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      deliveryProcess: ''
    });
    setFilteredOrders([...orders]);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    // Implement your image URL logic here
    return imagePath;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Order History</h1>
        
        {/* Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                name="deliveryProcess"
                value={filters.deliveryProcess}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <Button variant="contained" color="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button
                onClick={resetFilters}
                variant='outlined' color='secondary' sx={{ ml: 2 }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Orders List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No orders found matching your filters</p>
          ) : (
            <div className="flex lg:flex-row gap-4">
              <div className="w-full p-6">
                <div className="overflow-x-auto">
                  {filteredOrders.map((order, index) => (
                    <div
                      key={`${order.order_ID}-${index}`}
                      className="border border-gray-200 bg-white rounded-2xl shadow-xl p-6 mb-10"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <p className="text-lg font-semibold text-gray-800">
                            Order ID: {order.order_ID}
                          </p>
                          <p className="text-lg text-gray-600">Date: {order.currentDate}</p>
                          <p className="text-lg text-gray-600">Time: {order.currentTime}</p>
                          <div>
                            <p className="text-gray-600 bg-green-100 rounded-full pl-2.5 p-1 ">
                              Status:{' '}
                              <span
                                className='inline-block text-sm bg-green-100 text-green-800 pr-1.5'
                              >
                                {order.deliveryProcess}
                              </span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleOrderExpand(order.order_ID)} // Fixed function name
                          className="text-gray-500 hover:text-gray-700 transition-transform duration-200 ease-in-out"
                        >
                          <svg
                            className={`w-7 h-7 transform ${expandedOrder[order.order_ID] ? 'rotate-180' : ''}`}
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

                      {expandedOrder[order.order_ID] && (
                        <div className="flex gap-5">
                          <div className="w-2/3 mt-4">
                            <table className="w-full table-auto">
                              <thead>
                                <tr className="bg-blue-500 text-white text-left text-sm font-semibold">
                                  <th className="p-4 text-center">Product Name</th>
                                  <th className="p-4 text-center">Product Image</th>
                                  <th className="p-4 text-center">Unit</th>
                                  <th className="p-4 text-center">Quantity</th>
                                  <th className="p-4 text-center">Rate</th>
                                  <th className="p-4 text-center">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.order_items.map((item) => (
                                  <tr
                                    key={item.prod_ID}
                                    className="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
                                  >
                                    <td className="p-4 text-center">{item.prod_Name}</td>
                                    <td className="p-4 w-20 h-20">
                                      <img src={getImageUrl(item.image)} alt="Product" className="w-full h-full object-contain" />
                                    </td>
                                    <td className="p-4 text-center">{item.selectedRate.key}</td>
                                    <td className="p-4 text-center">{item.order_quantity}</td>
                                    <td className="p-4 text-center">
                                      ₹{item.selectedRate.value.toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center font-medium text-gray-800">
                                      ₹{item.subtotal.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex flex-col w-1/3 shadow-xl border-gray-200 mt-4">
                            <h2 className="font-bold text-xl bg-blue-500 text-white pt-9 pb-2 pl-2">Order Summary</h2>
                            <div className="space-y-3 p-4">                            
                              <p className="flex justify-between text-sm">
                                <span>Total:</span>
                                <span className="font-medium">₹{order.total.toFixed(2)}</span>
                              </p>
                              <p className="flex justify-between text-sm">
                                <span>GST (18%):</span>
                                <span className="font-medium">₹{order.gst.toFixed(2)}</span>
                              </p>
                              <p className="flex justify-between text-sm">
                                <span>Delivery Charge:</span>
                                <span className="font-medium">
                                  ₹{order.deliveryCharge.toFixed(2)}
                                </span>
                              </p>
                              <p className="flex justify-between text-sm">
                                <span>Discount:</span>
                                <span className="font-medium">₹{order.discount.toFixed(2)}</span>
                              </p>
                              <p className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                <span>Grand Total:</span>
                                <span>₹{order.grandTotal.toFixed(2)}</span>
                              </p>
                            </div>

                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                              <p>
                                <strong className="text-gray-700">Delivery Day:</strong>{' '}
                                {order.order_deliveryDay}
                              </p>
                              <p>
                                <strong className="text-gray-700">Delivery Time:</strong>{' '}
                                {order.order_deliveryTime}
                              </p>
                              <p>
                                <strong className="text-gray-700">Direction:</strong>{' '}
                                {order.order_direction}
                              </p>
                              <p>
                                <strong className="text-gray-700">Address:</strong>{' '}
                                {order.order_selectedAddress.address},{' '}
                                {order.order_selectedAddress.city},{' '}
                                {order.order_selectedAddress.state} -{' '}
                                {order.order_selectedAddress.pincode}
                              </p>
                              {order.order_selectedAddress.landMark && (
                                <p>
                                  <strong className="text-gray-700">Landmark:</strong>{' '}
                                  {order.order_selectedAddress.landMark}
                                </p>
                              )}
                            </div>                          
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}