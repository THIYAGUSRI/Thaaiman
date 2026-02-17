import React, { useState, useEffect } from 'react';
import Header from '../Components/Common Components/Header';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function DeliveryAddress() {
  const currentUser = useSelector((state) => state.user.currentUser);
  const [deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [formData, setFormData] = useState({
    userID: currentUser?.user?.userID || '',
    nickName: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (currentUser?.user?.userID) {
      setFormData((prev) => ({
        ...prev,
        userID: currentUser.user.userID,
      }));
    }
  }, [currentUser]);

  const fetchDeliveryAddresses = async () => {
    if (!currentUser?.user?.userID) {
      setDeliveryAddresses([]);
      return;
    }
    try {
      const res = await fetch(`/deliveryaddress/${currentUser.user.userID}`);
      if (!res.ok) throw new Error('Failed to fetch addresses');
      const data = await res.json();
      setDeliveryAddresses(data || []);
    } catch (err) {
      console.error('Fetch addresses error:', err);
      setError('Failed to load saved addresses');
    }
  };

  useEffect(() => {
    fetchDeliveryAddresses();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    let newError = '';

    if (name === 'mobile') {
      filteredValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      if (filteredValue.length > 0 && filteredValue.length !== 10) {
        newError = 'Mobile must be exactly 10 digits';
      }
    } else if (name === 'pincode') {
      filteredValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      if (filteredValue.length > 0 && filteredValue.length !== 6) {
        newError = 'Pincode must be exactly 6 digits';
      }
    } else if (['nickName', 'address', 'city', 'state'].includes(name)) {
      if (filteredValue.trim().length > 0 && (filteredValue.trim().length < 5 || filteredValue.trim().length > 50)) {
        newError = `${name.charAt(0).toUpperCase() + name.slice(1)} must be 5–50 characters`;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: filteredValue }));
    setFieldErrors((prev) => ({ ...prev, [name]: newError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Final validation
    const newErrors = {};

    if (!formData.nickName?.trim()) newErrors.nickName = 'Nick Name is required';
    else if (formData.nickName.trim().length < 3) newErrors.nickName = 'Min 3 characters';

    if (!formData.mobile) newErrors.mobile = 'Mobile is required';
    else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Exactly 10 digits';

    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    else if (formData.address.trim().length < 3) newErrors.address = 'Min 3 characters';

    if (!formData.city?.trim()) newErrors.city = 'City is required';
    else if (formData.city.trim().length < 3) newErrors.city = 'Min 3 characters';

    if (!formData.state?.trim()) newErrors.state = 'State is required';
    else if (formData.state.trim().length < 3) newErrors.state = 'Min 3 characters';

    if (!formData.pincode) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Exactly 6 digits';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    try {
      let response;
      const payload = { ...formData };

      if (editingAddressId) {
        // ── UPDATE ────────────────────────────────────────
        console.log('Updating address ID:', editingAddressId);
        console.log('PUT payload:', payload);

        response = await fetch(`/updatedeliveryaddress/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // ── CREATE ────────────────────────────────────────
        console.log('Creating new address');
        response = await fetch('/deliveryaddress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (editingAddressId ? 'Update failed' : 'Add failed'));
      }

      setSuccess(editingAddressId ? 'Address updated!' : 'Address added!');
      
      // Reset form
      setFormData({
        userID: currentUser?.user?.userID || '',
        nickName: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
      });
      setFieldErrors({});
      setEditingAddressId(null);
      setShowForm(false);

      fetchDeliveryAddresses(); // refresh list
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Something went wrong');
    }
  };

  const handleEdit = (address) => {
    setFormData({
      userID: currentUser?.user?.userID || '',
      nickName: address.nickName || '',
      mobile: address.mobile || '',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      landmark: address.landmark || '',
    });
    setEditingAddressId(address.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;

    try {
      const res = await fetch(`/deliveryaddress/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userID: currentUser?.user?.userID }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Delete failed');
      }

      setSuccess('Address deleted');
      fetchDeliveryAddresses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen mt-30 bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Form */}
          {showForm && (
            <div className="w-full lg:w-3/5 bg-white rounded-2xl shadow-xl p-6 sm:p-8 relative">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                onClick={() => {
                  setShowForm(false);
                  setEditingAddressId(null);
                  setFormData({
                    userID: currentUser?.user?.userID || '',
                    nickName: '',
                    mobile: '',
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                    landmark: '',
                  });
                  setError(null);
                  setSuccess(null);
                  setFieldErrors({});
                }}
              >
                ×
              </button>

              <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
                {editingAddressId ? 'Edit Delivery Address' : 'Add Delivery Address'}
              </h1>
              <div className="border-b-2 border-gray-200 mb-6"></div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg border border-green-200">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* same form fields as before – unchanged */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                      Nick Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nickName"
                      value={formData.nickName}
                      onChange={handleChange}
                      className={`border rounded-lg p-3 ${fieldErrors.nickName ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="e.g., Home, Office"
                    />
                    {fieldErrors.nickName && <p className="text-red-600 text-sm mt-1">{fieldErrors.nickName}</p>}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      maxLength={10}
                      className={`border rounded-lg p-3 ${fieldErrors.mobile ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="e.g., 9876543210"
                    />
                    {fieldErrors.mobile && <p className="text-red-600 text-sm mt-1">{fieldErrors.mobile}</p>}
                  </div>
                </div>

                {/* State + City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`border rounded-lg p-3 ${fieldErrors.state ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="e.g., Tamil Nadu"
                    />
                    {fieldErrors.state && <p className="text-red-600 text-sm mt-1">{fieldErrors.state}</p>}
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`border rounded-lg p-3 ${fieldErrors.city ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="e.g., Coimbatore"
                    />
                    {fieldErrors.city && <p className="text-red-600 text-sm mt-1">{fieldErrors.city}</p>}
                  </div>
                </div>

                {/* Landmark + Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Landmark (Optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="border rounded-lg p-3 border-gray-200"
                      placeholder="e.g., Near Bus Stand"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      className={`border rounded-lg p-3 ${fieldErrors.pincode ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="e.g., 641001"
                    />
                    {fieldErrors.pincode && <p className="text-red-600 text-sm mt-1">{fieldErrors.pincode}</p>}
                  </div>
                </div>

                {/* Full Address */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`border rounded-lg p-3 h-28 ${fieldErrors.address ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="House no, Street, Area..."
                  />
                  {fieldErrors.address && <p className="text-red-600 text-sm mt-1">{fieldErrors.address}</p>}
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold py-2.5 px-10 rounded-lg hover:from-indigo-700 hover:to-blue-600"
                  >
                    {editingAddressId ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Saved Addresses */}
          <div className={`w-full ${showForm ? 'lg:w-2/5' : 'lg:w-full'} bg-white rounded-2xl shadow-xl p-6 sm:p-8`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
              <button
                className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-1.5 px-5 rounded-lg hover:from-indigo-700 hover:to-blue-600"
                onClick={() => {
                  setEditingAddressId(null);
                  setFormData({
                    userID: currentUser?.user?.userID || '',
                    nickName: '',
                    mobile: '',
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                    landmark: '',
                  });
                  setShowForm(true);
                  setError(null);
                  setSuccess(null);
                  setFieldErrors({});
                }}
              >
                + Add New Address
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg">
              {deliveryAddresses.length === 0 ? (
                <p className="p-8 text-gray-500 text-center">No addresses saved yet.</p>
              ) : (
                deliveryAddresses.map((addr) => (
                  <div key={addr.id} className="p-5 border-b last:border-b-0 hover:bg-gray-50">
                    <h3 className="font-semibold text-lg">{addr.nickName}</h3>
                    <p className="text-sm text-gray-600">Mobile: {addr.mobile}</p>
                    <p className="text-sm text-gray-600">{addr.address}</p>
                    <p className="text-sm text-gray-600">
                      {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                    {addr.landmark && (
                      <p className="text-sm text-gray-600">Landmark: {addr.landmark}</p>
                    )}

                    <div className="mt-3 space-x-4">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleEdit(addr)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDelete(addr.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/cart"
                className="inline-block bg-gradient-to-r from-violet-500 to-blue-500 text-white font-bold py-3 px-10 rounded-lg"
              >
                Continue to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}