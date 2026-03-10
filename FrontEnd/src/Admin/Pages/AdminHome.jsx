import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../Components/NavigationBox';

export default function AdminHome() {
  const { currentUser, loading } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!currentUser || !currentUser.isAdmin)) {
      navigate('/adminuserlogin', { replace: true });
    }
  }, [currentUser, loading, navigate]);

  if (loading || !currentUser || !currentUser.isAdmin) {
    return null; // or loading spinner
  }

  return (
    <AdminLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="text-center py-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Welcome to Admin Dashboard
            </h1>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}