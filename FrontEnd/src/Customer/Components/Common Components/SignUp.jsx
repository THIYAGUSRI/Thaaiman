import React, { useState } from 'react';
import { useNavigate } from "react-router";

export default function SignUp() {
  const [userName, setUserName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/createuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
          userMobile: mobileNumber,
          userEmail: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Sign up successful!');
        navigate('/login');
      } else {
        setError(data.message || 'Error signing up');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96 relative">
        {/* Close Button */}
        <button
          className="absolute top-2 right-4 text-4xl text-gray-500 hover:text-red-600"
          onClick={handleClose}
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Mobile Number Field */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your mobile number"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          {/* Optional Error Display */}
          {error && <p className="text-red-500 text-sm mt-1 mb-1">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold py-2 rounded-md hover:from-blue-400 hover:to-blue-600"
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center mb-4 mt-4">
          <hr className="h-0 border-b border-solid border-grey-500 grow" />
          <p className="mx-4 text-gray-600">or</p>
          <hr className="h-0 border-b border-solid border-grey-500 grow" />
        </div>

        {/* Sign In Redirect */}
        <div className="mt-4 text-center flex justify-center items-center">
          <p className="mr-2">Already have an account?</p>
          <button className="text-blue-500 hover:underline" onClick={handleLoginClick}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}