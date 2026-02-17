import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBox from '../Components/NavigationBox';

export default function AdminEditCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [category, setCategory] = useState(null);
  const [image, setImage] = useState(null);
  const [existingImages, setExistingImages] = useState('');
  const [active, setActive] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`/category/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCategory(data);
          setCategoryName(data.categoryName || '');
          setExistingImages(data.image || '');
          setActive(data.active || false);
        } else {
          throw new Error('Failed to fetch category');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch category');
      }
    };
    fetchCategory();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const data = new FormData();
    data.append('categoryName', categoryName);
    data.append('active', active);
    if (image) {
      data.append('image', image);
    } else {
      data.append('image', existingImages);
    }

    try {
      const response = await fetch(`/updatecategory/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
      }

      await response.json();
      setMessage('Category updated successfully');
      document.getElementById('imageInput').value = null;
      navigate('/admincategorydetail');
    } catch (err) {
      setError(err.message || 'Failed to update category');
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const filetypes = /jpeg|jpg|png|gif|webp/;
    if (!filetypes.test(file.type)) {
      setError('Only image files (jpeg, jpg, png, gif, webp) are allowed');
      setImage(null);
      e.target.value = null;
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Max 5MB allowed.');
      setImage(null);
      e.target.value = null;
      return;
    }

    setImage(file);
    setError('');
  };

  // Generate full URL for existing images
  const getImageUrl = (imgPath) => {
    const fallbackImage = '/uploads/no-image.png';
    if (!imgPath) return fallbackImage;
    const normalizedPath = imgPath.replace(/\\/g, '/').trim();
    return normalizedPath.startsWith('http')
      ? normalizedPath
      : `/uploads/${normalizedPath.replace(/^\/+/, '')}`;
  };

  return (
    <NavigationBox>
      <div>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Edit Category
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
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

              {/* Active Checkbox */}
              <div>
                <label htmlFor="active" className="block text-sm font-medium text-gray-700">
                  Active
                </label>
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>

              {/* Image Upload */}
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
                <p className="mt-1 text-xs text-gray-500">
                  Max file size: 5MB. Allowed types: jpeg, jpg, png, gif, webp.
                </p>

                {/* Image Preview */}
                {image ? (
                  <div className="mb-4 mt-2 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        document.getElementById('imageInput').value = null;
                      }}
                      className="cursor-pointer rounded-full w-7 ml-60 h-auto text-white border font-bold bg-red-600"
                    >
                      X
                    </button>
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Selected"
                      className="mx-auto mb-2 w-30 h-auto object-contain"
                    />
                  </div>
                ) : (category?.image || existingImages) && (
                  <div className="mb-4 mt-2 relative">
                    {category?.image ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setCategory({ ...category, image: "" });
                            setExistingImages('');
                          }}
                          className="cursor-pointer rounded-full w-7 ml-60 h-auto text-white border font-bold bg-red-600"
                        >
                          X
                        </button>
                        <img
                          src={getImageUrl(category.image)}
                          alt="Existing"
                          className="mx-auto mb-2 w-30 h-auto object-contain"
                        />
                      </>
                    ) : (
                      existingImages && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setExistingImages('');
                              if (category) setCategory({ ...category, image: "" });
                            }}
                            className="cursor-pointer rounded-full w-7 ml-60 h-auto text-white border font-bold bg-red-600"
                          >
                            X
                          </button>
                          <img
                            src={getImageUrl(category.image || existingImages)}
                            alt="Existing"
                            className="mx-auto mb-2 w-30 h-auto object-contain"
                          />
                        </>
                      ))}
                  </div>
                )}
              </div>

              {/* Error / Success Messages */}
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {message && <div className="text-green-600 text-sm">{message}</div>}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Category
              </button>
            </form>
          </div>
        </div>
      </div>
    </NavigationBox>
  );
}