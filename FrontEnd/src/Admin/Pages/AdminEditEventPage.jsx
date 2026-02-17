import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NavigationBox from '../Components/NavigationBox';


export default function AdminEditEventPage() {
  const id = useParams().id;
  const [event, setEvent] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [removedOldImages, setRemovedOldImages] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(`/event/${id}`);
        if (!response.ok) throw new Error('Failed to fetch event details');
        const data = await response.json();
        setEvent(data);

        if (data.images && data.images.length > 0) {
          const oldPreviews = data.images.map(img => `/uploads/${img}`);
          setPreviews(oldPreviews);
        }
        setRemovedOldImages([]);
      } catch (error) {
        setError(error.message || 'An error occurred while fetching event details');
      }
    };
    fetchEventDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('start') || name.includes('end')) {
      const dateType = name.includes('start') ? 'startDate' : 'endDate';
      const currentDate = event[dateType] ? new Date(event[dateType]) : new Date();
      if (name.includes('Day')) currentDate.setDate(parseInt(value));
      else if (name.includes('Month')) currentDate.setMonth(parseInt(value) - 1);
      else if (name.includes('Year')) currentDate.setFullYear(parseInt(value));
      setEvent(prev => ({ ...prev, [dateType]: currentDate.toISOString() }));
      return;
    }
    setEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        setError("Only image files (jpeg, jpg, png, gif, webp) are allowed!");
        return;
      }
    }
    if (files.length + newImages.length + (event?.images?.length || 0) - removedOldImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setNewImages(prev => [...prev, ...files]);
    setError('');
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const oldImagesCount = (event?.images?.length || 0) - removedOldImages.length;
    const isOldImage = index < oldImagesCount;

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);

    if (isOldImage) {
      // FIXED: Use original index from event.images
      const removedFilename = event.images[index];
      setRemovedOldImages(prev => [...prev, removedFilename]);
    } else {
      const newIndex = index - oldImagesCount;
      const newNewImages = [...newImages];
      newNewImages.splice(newIndex, 1);
      setNewImages(newNewImages);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', event.title);
      formData.append('location', event.location);
      formData.append('time', event.time);
      formData.append('address', event.address);
      formData.append('startDate', event.startDate);
      formData.append('endDate', event.endDate || '');
      formData.append('price', event.price);
      formData.append('description', event.description);

      newImages.forEach(img => formData.append('images', img));
      removedOldImages.forEach(filename => formData.append('removedImages', filename));

      if (newImages.length === 0) {
        formData.append('preserveImages', 'true');
      }

      const response = await fetch(`/updateevent/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update event');

      const result = await response.json();
      setMessage('Event updated successfully');

      const remainingOld = event.images.filter(img => !removedOldImages.includes(img));
      const finalImages = newImages.length > 0 ? result.event.images : remainingOld;
      setEvent(prev => ({ ...prev, images: finalImages }));
      setPreviews(finalImages.map(img => `/uploads/${img}`));
      setNewImages([]);
      setRemovedOldImages([]);
    } catch (error) {
      setError(error.message || 'An error occurred while updating the event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NavigationBox>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Edit Event Detail</h2>
              <p className="mt-1 text-sm text-gray-500">Update the event details below.</p>
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
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
              {event ? (
                <>
                  <div><label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label><input type="text" id="title" name="title" value={event.title || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
                  <div><label htmlFor="location" className="block text-sm font-medium text-gray-700">Location *</label><input type="text" id="location" name="location" value={event.location || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
                  <div><label htmlFor="time" className="block text-sm font-medium text-gray-700">Time *</label><input type="text" id="time" name="time" value={event.time || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
                  <div><label htmlFor="address" className="block text-sm font-medium text-gray-700">Address *</label><textarea id="address" name="address" value={event.address || ''} onChange={handleInputChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                    <div className="mt-1 flex space-x-2">
                      <select id="startDay" name="startDay" value={event.startDate ? new Date(event.startDate).getDate() : ''} onChange={handleInputChange} className="block w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required><option value="">Day</option>{[...Array(31)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select>
                      <select id="startMonth" name="startMonth" value={event.startDate ? new Date(event.startDate).getMonth() + 1 : ''} onChange={handleInputChange} className="block w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required><option value="">Month</option>{["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}</select>
                      <select id="startYear" name="startYear" value={event.startDate ? new Date(event.startDate).getFullYear() : ''} onChange={handleInputChange} className="block w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required><option value="">Year</option>{Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}</select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <div className="mt-1 flex space-x-2">
                      <select id="endDay" name="endDay" value={event.endDate ? new Date(event.endDate).getDate() : ''} onChange={handleInputChange} className="block w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">Day</option>{[...Array(31)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select>
                      <select id="endMonth" name="endMonth" value={event.endDate ? new Date(event.endDate).getMonth() + 1 : ''} onChange={handleInputChange} className="block w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">Month</option>{["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}</select>
                      <select id="endYear" name="endYear" value={event.endDate ? new Date(event.endDate).getFullYear() : ''} onChange={handleInputChange} className="block w-1/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"><option value="">Year</option>{Array.from({ length: 101 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}</select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Event Images (Max 5)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload files</span>
                            <input id="images" name="images" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" multiple />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                      </div>
                    </div>

                    {previews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {previews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img src={preview} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover rounded-md" />
                            <button type="button" onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 -mt-2 -mr-2">X</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div><label htmlFor="price" className="block text-sm font-medium text-gray-700">Price *</label><input type="number" id="price" name="price" value={event.price || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>
                  <div><label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label><textarea id="description" name="description" value={event.description || ''} onChange={handleInputChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required /></div>

                  <div className="pt-5">
                    <button type="submit" disabled={isSubmitting} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                      {isSubmitting ? 'Updating...' : 'Update Event'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4"><p className="text-gray-500">Loading event details...</p></div>
              )}
            </form>
          </div>
        </div>
      </div>
    </NavigationBox>

  );
}