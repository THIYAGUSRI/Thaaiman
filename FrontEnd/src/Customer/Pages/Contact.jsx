import React, { useState } from 'react';
import Header from '../Components/Common Components/Header';
import { useSelector } from 'react-redux';

export default function Contact() {
  const currentUser = useSelector((state) => state.user.currentUser);
  console.log('Contact.jsx: currentUser:', currentUser);
  console.log('Contact.jsx: currentUser.user.userID:', currentUser?.user?.userID);
  const [formData, setFormData] = useState({
    userID: currentUser?.user?.userID || '',
    ContactType: '',
    Comment: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userID) newErrors.userID = 'User ID is required';
    if (!formData.ContactType) newErrors.ContactType = 'Contact type cannot be empty';
    if (!formData.Comment.trim()) newErrors.Comment = 'Comment cannot be empty';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        userID: formData.userID,
        contactType: formData.ContactType, // Matches backend field name
        Comment: formData.Comment,
      };

      console.log('Contact.jsx: Sending payload:', payload);
      console.log('Contact.jsx: API URL:', '/createcontact');

      const res = await fetch('/createcontact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Contact.jsx: Response status:', res.status);
      console.log('Contact.jsx: Response ok:', res.ok);

      const data = await res.json();
      console.log('Contact.jsx: Response data:', data);

      if (!res.ok) throw new Error(data.message || 'Failed to submit contact form');

      setSubmitted(true);
      setErrors({});
      setFormData({
        userID: currentUser?.user?.userID || '',
        ContactType: '',
        Comment: '',
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div
        className="bg-gray-100 py-8 mt-30"
        style={{
          paddingBottom: '60px', // Adjust based on footer height
          minHeight: 'calc(100vh - 60px)', // Ensure content fits above footer
          boxSizing: 'border-box',
        }}
      >
        <div className="container bg-gray-100 mx-auto">
          <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <h3 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                Contact Us
              </h3>

              {submitted ? (
                <div className="text-center text-green-600 text-xl font-semibold">
                  Successfully submitted!
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Hidden userID field (sourced from Redux) */}
                  <input type="hidden" name="userID" value={formData.userID} />

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Type *
                    </label>
                    <select
                      name="ContactType"
                      value={formData.ContactType}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.ContactType ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select the Contact Type</option>
                      <option value="Suggestion">Suggestion</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Complaint">Complaint</option>
                    </select>
                    {errors.ContactType && (
                      <p className="text-red-500 text-sm mt-1">{errors.ContactType}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="Feedbacklbl"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Comment *
                    </label>
                    <textarea
                      id="Feedbacklbl"
                      name="Comment"
                      value={formData.Comment}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Enter your comment here"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.Comment ? 'border-red-500' : 'border-gray-300'
                      }`}
                    ></textarea>
                    {errors.Comment && (
                      <p className="text-red-500 text-sm mt-1">{errors.Comment}</p>
                    )}
                  </div>

                  {errors.submit && (
                    <p className="text-red-500 text-sm mb-4 text-center">{errors.submit}</p>
                  )}

                  <div className="text-center">
                    <button
                      type="submit"
                      className="bg-green-600 font-semibold text-white px-6 py-2 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}