import React, { useEffect, useState } from 'react';
import NavigationBox from '../Components/NavigationBox';
import { useParams } from 'react-router-dom';

export default function AdminEditVideoPage() {
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/videodetail/${id}`);
        if (!response.ok) throw new Error('Failed to fetch video details');
        const data = await response.json();

        // Always ensure date is a string (YYYY-MM-DD) or empty
        const formattedDate = data.date
          ? new Date(data.date).toISOString().split('T')[0]
          : '';

        setVideo({ ...data, date: formattedDate });

        if (data.thumbnail) {
          setThumbnailPreview(`/${data.thumbnail}`);
        }
      } catch (error) {
        setError(error.message || 'An error occurred while fetching video details');
      }
    };
    fetchVideo();
  }, [id]);

  if (!video) return <div>Loading...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date') {
      const dateValue = new Date(value);
      setVideo({ ...video, [name]: dateValue.toISOString() });
    } else {
      setVideo({ ...video, [name]: value });
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Only image files (jpeg, jpg, png, gif, webp) are allowed!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB!");
        return;
      }
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    setVideo(prev => ({ ...prev, thumbnail: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const formData = new FormData();

      Object.keys(video).forEach(key => {
        if (key !== 'thumbnail') {
          formData.append(key, video[key] ?? '');
        }
      });

      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      } else {
        formData.append('thumbnail', video.thumbnail === null ? 'null' : (video.thumbnail || ''));
      }

      const response = await fetch(`/updatevideodetail/${id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update video: ${errorText}`);
      }

      const updatedVideo = await response.json();
      setVideo(updatedVideo);

      if (updatedVideo.thumbnail) {
        setThumbnailPreview(`/${updatedVideo.thumbnail}`);
      } else {
        setThumbnailPreview(null);
      }

      setThumbnail(null);
      setMessage('Video updated successfully!');
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Failed to update video');
      console.error('Update error:', err);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <NavigationBox>
      <div>
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Video Details blindness</h2>
              <p className="mt-1 text-sm text-gray-600">Fill in the details below to edit the video.</p>
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

            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={video?.title || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">User Name</label>
                <input
                  type="text"
                  name="userName"
                  value={video?.userName || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={video?.date || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={video?.description || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Video URL</label>
                <input
                  type="text"
                  name="videoUrl"
                  value={video?.videoUrl || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preview URL</label>
                <input
                  type="text"
                  name="preview"
                  value={video?.preview || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Thumbnail Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="thumbnail" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Upload file</span>
                        <input id="thumbnail" name="thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {thumbnailPreview && (
                  <div className="mt-4 relative">
                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="h-32 w-auto object-cover rounded-md" />
                    <button type="button" onClick={removeThumbnail} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 -mt-2 -mr-2">
                      X
                    </button>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </NavigationBox>

  );
}