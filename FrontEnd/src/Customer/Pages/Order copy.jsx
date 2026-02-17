import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Header from '../Components/Common Components/Header';
import orderplaced from '../../Images/orderplaced2.png';
import Packed from '../../Images/packed.png';
import InTransit from '../../Images/InTransit.jpeg';
import dispatched from '../../Images/dispatched.jpeg';
import DeliveryBike from '../../Images/delivery-bike.png';

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userId = currentUser?.userID;

  const fetchOrders = async () => {
    try {
      const response = await fetch('/orders', {
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        const userOrders = data.filter((order) => order.userID === userId);

        // ✅ Remove duplicate order_IDs (keeping the first occurrence)
        const uniqueOrders = Array.from(
          new Map(userOrders.map((order) => [order.order_ID, order])).values()
        );

        setOrders(uniqueOrders);
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

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const openDeleteModal = (orderId) => {
    setOrderToDelete(orderId);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setOrderToDelete(null);
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      const response = await fetch(`/orders/${orderToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Order deleted successfully:', orderToDelete);
        fetchOrders(); // Refresh the order list
      } else {
        console.error('Error deleting order:', data.message);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <>
      <div>
        <Header />
      </div>
      <div className="w-full h-500 mx-auto px-4 py-8 ">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="text-lg text-gray-600">No orders found.</p>
        ) : (
          <div className="flex lg:flex-row gap-4 bg-green-50">
            <div className="w-full p-6">
              <div className="overflow-x-auto">
                {orders.map((order, index) => (
                  <div
                    key={`${order.order_ID}-${index}`}
                    className="bg-white rounded-2xl shadow-xl p-6 mb-4"
                  >
                    <p className="text-2xl p-2 font-bold text-center bg-red-500 text-white rounded-2xl mb-4">
                      Order Detail
                    </p>
                    <div className="flex flex-col items-center mb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
                        <p className="text-black font-bold text-xl">
                          Order ID: <span className="text-gray-500 font-semibold">{order.order_ID}</span>
                        </p>
                        <p className="text-black font-bold text-xl">
                          Date: <span className="text-gray-500 font-semibold">{order.currentDate}</span>
                        </p>
                        <p className="text-black font-bold text-xl">
                          Time: <span className="text-gray-500 font-semibold">{order.currentTime}</span>
                        </p>
                      </div>
                      <div className="flex m-auto mt-10 relative">
                        <div>
                          <div
                            className={`border rounded-full w-23 h-23 text-center ${
                              ['Order Placed', 'Packed', 'In Transit', 'Dispatched'].includes(order.deliveryProcess)
                                ? 'bg-green-300'
                                : ''
                            }`}
                          >
                            <img
                              src={orderplaced}
                              alt="Order Placed"
                              className="w-16 h-16 mt-3 ml-4 p-0.5"
                            />
                          </div>
                          <label>Order Placed</label>
                        </div>
                        <div
                          className={`border-dashed border-t-2 w-50 mt-10 relative ${
                            ['Packed', 'In Transit', 'Dispatched'].includes(order.deliveryProcess)
                              ? 'border-green-500'
                              : 'border-gray-500'
                          }`}
                        >
                          {order.deliveryProcess === 'Order Placed' && (
                            <img
                              src={DeliveryBike}
                              alt="Delivery Bike"
                              className="absolute top-[-40px] left-0 w-10 h-11 animate-bike"
                            />
                          )}
                        </div>
                        <div>
                          <div
                            className={`border rounded-full w-23 h-23 text-center ${
                              ['Packed', 'In Transit', 'Dispatched'].includes(order.deliveryProcess)
                                ? 'bg-green-300'
                                : 'bg-orange-300'
                            }`}
                          >
                            <img
                              src={Packed}
                              alt="Packed"
                              className="w-16 h-16 mt-3.5 ml-3.5 p-0.5"
                            />
                          </div>
                          <label className="text-center pl-5">Packed</label>
                        </div>
                        <div
                          className={`border-dashed border-t-2 w-50 mt-10 relative ${
                            ['In Transit', 'Dispatched'].includes(order.deliveryProcess)
                              ? 'border-green-500'
                              : 'border-gray-500'
                          }`}
                        >
                          {order.deliveryProcess === 'Packed' && (
                            <img
                              src={DeliveryBike}
                              alt="Delivery Bike"
                              className="absolute top-[-40px] left-0 w-10 h-11 animate-bike"
                            />
                          )}
                        </div>
                        <div>
                          <div
                            className={`border rounded-full w-23 h-23 text-center ${
                              ['In Transit', 'Dispatched'].includes(order.deliveryProcess)
                                ? 'bg-green-300'
                                : 'bg-orange-300'
                            }`}
                          >
                            <img
                              src={InTransit}
                              alt="In Transit"
                              className="w-16 h-16 mt-3 ml-3.5 p-0.5"
                            />
                          </div>
                          <label className="text-center pl-4">In Transit</label>
                        </div>
                        <div
                          className={`border-dashed border-t-2 w-50 mt-10 relative ${
                            order.deliveryProcess === 'Dispatched' ? 'border-green-500' : 'border-gray-500'
                          }`}
                        >
                          {order.deliveryProcess === 'In Transit' && (
                            <img
                              src={DeliveryBike}
                              alt="Delivery Bike"
                              className="absolute top-[-40px] left-0 w-10 h-11 animate-bike"
                            />
                          )}
                        </div>
                        <div>
                          <div
                            className={`border rounded-full w-23 h-23 text-center ${
                              order.deliveryProcess === 'Dispatched' ? 'bg-green-300' : 'bg-orange-300'
                            }`}
                          >
                            <img
                              src={dispatched}
                              alt="Dispatched"
                              className="w-16 h-16 mt-3 ml-3 p-0.5"
                            />
                          </div>
                          <label className="text-center pl-2">Dispatched</label>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleExpand(order.order_ID)}
                        className="text-gray-800 hover:text-gray-700 transition-transform duration-200 ease-in-out mt-7"
                      >
                        <svg
                          className={`w-7 h-7 transform ${expandedOrders[order.order_ID] ? 'rotate-180' : ''}`}
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
                      <div className="flex gap-5">
                        <div className="w-2/3 mt-4">
                          <table className="w-full table-auto">
                            <thead>
                              <tr className="bg-gray-200 text-gray-700 text-left text-sm font-semibold">
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
                                    <img src={item.image} alt="Product" />
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

                        <div className="flex flex-col w-1/3 shadow-xl p-4 border-gray-200">
                          <div className="space-y-3">
                            <h2 className="font-bold text-lg">Order Summary</h2>
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

                          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                          <div className="flex justify-end mt-6">
                            {order.deliveryProcess === "Dispatched" ? null : <button
                              onClick={() => openDeleteModal(order.order_ID)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                            >
                              Delete Order
                            </button>}                            
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete this order?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .animate-bike {
            animation: moveBike 2s infinite linear;
          }
          @keyframes moveBike {
            0% { transform: translateX(0); }
            100% { transform: translateX(160px); }
          }
        `}
      </style>
    </>
  );
}