import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../../redux/user/userSlice';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle,
  Logout,
  Login,
} from '@mui/icons-material';


export default function AdminHeader() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(signoutSuccess());
    // setMobileMenuOpen(false);
    navigate('/adminuserlogin')

  };

  return (
    <header className="bg-gray-700 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Title */}
          <div className="flex items-center">
            <Link to="/adminhome" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Admin
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block">Management Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation & Auth */}
          <nav className="md:flex items-center space-x-6">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <AccountCircle className="w-8 h-8 text-gray-300" />
                  <div className="text-sm">
                    <p className="font-medium">{currentUser.name || 'Admin'}</p>
                    <p className="text-gray-400">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-medium transition duration-200"
                >
                  <Logout className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/adminuserlogin"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition duration-200"
              >
                <Login className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      </div>

    </header>
  );
}