import React, { useState } from 'react';
import { useNavigate } from "react-router";
import { signInFailure, signInStart, signInSuccess } from '../../../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import Header from './Header';

export default function Login() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClose = () => {
    navigate('/')
  };

  const handleRegisterClick = () => {
    navigate('/signup');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMobile: mobileNumber }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      dispatch(signInSuccess(data));
      setError('');
      navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message));
      setError(err.message);
    }
  };

  return (
    <>
    <Header />
    <div className=" inset-0 h-screen flex items-center justify-center bg-[rgba(0,0,0,0.75)] z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96 relative">
        <button
          className="absolute top-2 right-4 text-4xl text-gray-500 hover:text-red-600"
          onClick={handleClose}
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Sign In</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Mobile Number</label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your mobile number"
            />
            {error && <p className="text-red-500 text-sm mt-1 mb-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold py-2 rounded-md hover:from-blue-400 hover:to-blue-600"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center mb-4 mt-4">
          <hr className="h-0 border-b border-solid border-grey-500 grow" />
          <p className="mx-4 text-gray-600">or</p>
          <hr className="h-0 border-b border-solid border-grey-500 grow" />
        </div>

        {/* Footer Link */}
        <div className="mt-4 text-center flex justify-center items-center">
          <p className="mr-2">Not yet Registered?</p>
          <button
            className="text-blue-500 hover:underline"
            onClick={handleRegisterClick}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
    </>
    
  );
}