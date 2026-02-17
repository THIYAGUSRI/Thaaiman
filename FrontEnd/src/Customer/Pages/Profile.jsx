import React, { useState, useEffect } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Header from "../Components/Common Components/Header";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileUser, setProfileUser] = useState({
    username: "",
    email: "",
    mobileNumber: "",
  });
  const [editedUser, setEditedUser] = useState(profileUser);
  const [errors, setErrors] = useState({});
  const currentUser = useSelector((state) => state.user.currentUser);
  const { id } = useParams(); // Get user ID from URL

  // Fetch user details when component mounts
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/user/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const userData = await response.json();
        setProfileUser({
          username: userData.userName || "",
          email: userData.userEmail || "",
          mobileNumber: userData.userMobile || "",
        });
        setEditedUser({
          username: userData.userName || "",
          email: userData.userEmail || "",
          mobileNumber: userData.userMobile || "",
        });
      } catch (error) {
        console.error('Profile.js: Error fetching user:', error);
        setErrors({ fetch: "Failed to load user data" });
      }
    };
    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleEditClick = () => setIsEditing(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSaveClick = async () => {
    let newErrors = {};

    if (!editedUser.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!editedUser.email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!editedUser.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch(`/editprofile/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: editedUser.username,
          userEmail: editedUser.email,
          userMobile: editedUser.mobileNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setProfileUser({
        username: updatedUser.user.userName,
        email: updatedUser.user.userEmail,
        mobileNumber: updatedUser.user.userMobile,
      });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error('Profile.js: Error updating profile:', error);
      setErrors({ update: "Failed to update profile" });
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <AccountCircleIcon sx={{ fontSize: 70, color: "gray" }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your personal information
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="username"
                    value={editedUser.username}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                  )}
                </>
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {profileUser.username}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={editedUser.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </>
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {profileUser.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={editedUser.mobileNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      errors.mobileNumber ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                </>
              ) : (
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {profileUser.mobileNumber}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              {isEditing ? (
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveClick}
                    className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUser(profileUser);
                      setErrors({});
                    }}
                    className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}