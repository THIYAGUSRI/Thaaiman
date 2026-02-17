import React, { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import NavigationBox from '../Components/NavigationBox';

export default function CreateProduct() {
  const [formData, setFormData] = useState({
    prod_Name: '',
    prod_category: '',
    prod_Rate: [{ size: '', price: '' }],
    prod_Stock: 0,
    prod_active: true,
    prod_Description: '',
    prod_offer: 0,
    sortOrderList: 0,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]); // New state for categories
  console.log(formData);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/categorys');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleRateChange = (index, field, value) => {
    const updatedRates = [...formData.prod_Rate];
    updatedRates[index][field] = value;
    setFormData({
      ...formData,
      prod_Rate: updatedRates,
    });
  };

  const addRateField = () => {
    setFormData({
      ...formData,
      prod_Rate: [...formData.prod_Rate, { size: '', price: '' }],
    });
  };

  const removeRateField = (index) => {
    if (formData.prod_Rate.length > 1) {
      const updatedRates = [...formData.prod_Rate];
      updatedRates.splice(index, 1);
      setFormData({
        ...formData,
        prod_Rate: updatedRates,
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
    setError('');
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      // Validate required fields client-side to match server validation
      if (!formData.prod_Name || !formData.prod_category || !formData.prod_Rate.some(rate => rate.size && rate.price) || !formData.prod_Stock || !formData.prod_Description) {
        throw new Error('Please fill all required fields');
      }

      const data = new FormData();
      data.append('prod_Name', formData.prod_Name);
      data.append('prod_category', formData.prod_category); // Sends category id
      data.append('prod_Stock', formData.prod_Stock);
      data.append('prod_active', formData.prod_active);
      data.append('prod_Description', formData.prod_Description);
      data.append('prod_offer', formData.prod_offer);
      data.append('sortOrderList', formData.sortOrderList);
      // Transform prod_Rate to array of objects like [{ "1KG": 240 }]
      const transformedRates = formData.prod_Rate
        .filter(rate => rate.size && rate.price)
        .map(rate => ({ [rate.size]: parseFloat(rate.price) }));
      data.append('prod_Rate', JSON.stringify(transformedRates));
      images.forEach(image => {
        data.append('images', image);
      });

      const response = await fetch('/createproduct', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || response.statusText || 'Server error');
      }

      await response.json();
      setMessage('Product created successfully!');
      setFormData({
        prod_Name: '',
        prod_category: '',
        prod_Rate: [{ size: '', price: '' }],
        prod_Stock: 0,
        prod_active: true,
        prod_Description: '',
        prod_offer: 0,
        sortOrderList: 0,
      });
      setImages([]);
      setPreviews([]);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NavigationBox>
      <div className="min-h-screen mt-10 bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Create New Product</h2>
              <p className="mt-1 text-sm text-gray-500">Add a new product to your inventory.</p>
            </div>
            {message && (
              <div className="m-4 p-3 rounded-md bg-green-50 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">{message}</p>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="m-4 p-3 rounded-md bg-red-50 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                    <div className="mt-2 text-sm text-red-700">
                      If this continues, please check:
                      <ul className="list-disc pl-5 mt-1">
                        <li>Your internet connection</li>
                        <li>That the server is running</li>
                        <li>That the API endpoint is correct</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
              <div>
                <label htmlFor="prod_Name" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="prod_Name"
                  name="prod_Name"
                  value={formData.prod_Name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <FormControl fullWidth required>
                  <InputLabel id="prod_category_label">Category *</InputLabel>
                  <Select
                    labelId="prod_category_label"
                    id="prod_category"
                    name="prod_category"
                    value={formData.prod_category}
                    onChange={handleInputChange}
                    label="Category *"
                  >
                    <MenuItem value="">
                      <em>Select a category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.categoryName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Rates (Size and Price) *
                </label>
                {formData.prod_Rate.map((rate, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Size (e.g., 1KG, 0.5g)"
                      value={rate.size}
                      onChange={(e) => handleRateChange(index, 'size', e.target.value)}
                      className="block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={rate.price}
                      onChange={(e) => handleRateChange(index, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                      className="block w-1/2 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                    {formData.prod_Rate.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRateField(index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRateField}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Another Size/Price
                </button>
              </div>
              <div>
                <label htmlFor="prod_Stock" className="block text-sm font-medium text-gray-700">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  id="prod_Stock"
                  name="prod_Stock"
                  value={formData.prod_Stock}
                  onChange={handleInputChange}
                  min="0"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="prod_Description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="prod_Description"
                  name="prod_Description"
                  value={formData.prod_Description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="prod_offer" className="block text-sm font-medium text-gray-700">
                  Offer Percentage
                </label>
                <input
                  type="number"
                  id="prod_offer"
                  name="prod_offer"
                  value={formData.prod_offer}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="sortOrderList" className="block text-sm font-medium text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sortOrderList"
                  name="sortOrderList"
                  value={formData.sortOrderList}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="prod_active"
                    name="prod_active"
                    checked={formData.prod_active}
                    onChange={handleInputChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="prod_active" className="font-medium text-gray-700">
                    Product Active
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Images (Max 5)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                          multiple
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                  </div>
                </div>
                {previews.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Image Previews</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img src={preview} alt={`Preview ${index}`} className="rounded-md h-24 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Product...
                    </>
                  ) : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </NavigationBox>

  );
}
