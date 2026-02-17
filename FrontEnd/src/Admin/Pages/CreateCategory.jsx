import React, { useState } from 'react';
import AdminHeader from '../Components/AdminHeader';
import NavigationBox from '../Components/NavigationBox';


export default function CreateCategory() {
  const [categoryName, setCategoryName] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!categoryName) {
      setError('Category name is required');
      return;
    }

    const formData = new FormData();
    formData.append('categoryName', categoryName);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('/createcategory', {
        method: 'POST',
        body: formData,
        headers: {
          // Note: 'Content-Type' is not set explicitly as fetch automatically handles it for FormData
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }

      const data = await response.json();
      setMessage(data.message);
      setCategoryName('');
      setImage(null);
      document.getElementById('imageInput').value = null; // Reset file input
    } catch (err) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const filetypes = /jpeg|jpg|png|gif|webp/;
      if (!filetypes.test(file.type)) {
        setError('Only image files (jpeg, jpg, png, gif, webp) are allowed');
        setImage(null);
        e.target.value = null;
        return;
      }
      // Validate file size (5MB limit, matching server)
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Max 5MB allowed.');
        setImage(null);
        e.target.value = null;
        return;
      }
      setImage(file);
    }
  };

  return (
    <NavigationBox>
      <div>
        <AdminHeader />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Category</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <label htmlFor="imageInput" className="block text-sm font-medium text-gray-700">
                  Category Image (Optional)
                </label>
                <input
                  type="file"
                  id="imageInput"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {image && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {image.name}</p>
                )}
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              {message && (
                <div className="text-green-600 text-sm">{message}</div>
              )}
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      </div>
    </NavigationBox>

  );
}
