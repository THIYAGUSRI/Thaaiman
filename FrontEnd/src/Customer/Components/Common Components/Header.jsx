import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { signoutSuccess } from '../../../redux/user/userSlice';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import FeaturedVideoIcon from '@mui/icons-material/FeaturedVideo';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../../Images/life-logo.png';
import { Tooltip } from '@mui/material';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const cart = useSelector((state) => state.cart);
  const whistlist = useSelector((state) => state.whistlist);
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [whistlistCount, setWhistlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(localStorage.getItem('searchQuery') || '');
  const [products, setProducts] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(JSON.parse(localStorage.getItem('isSearchSubmitted')) || false);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = currentUser?.user?.userID;

  const getAuthHeaders = () => {
    if (!currentUser?.token) return {};
    return { 'Authorization': `Bearer ${currentUser.token}` };
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (currentUser?.user?.userID && cart.user_id === currentUser.user.userID) {
      const itemCount = Array.isArray(cart.items) ? cart.items.length : 0;
      setCount(itemCount);
      console.log('Header.js: Cart item count from Redux:', itemCount);
    } else {
      setCount(0);
      console.log('Header.js: Cart item count set to 0 (no user or user_id mismatch)');
    }
  }, [currentUser, cart]);

  useEffect(() => {
    // Get wishlist count from Redux store
    if (whistlist && Array.isArray(whistlist.items)) {
      setWhistlistCount(whistlist.items.length);
    } else {
      setWhistlistCount(0);
    }
  }, [whistlist]);

  useEffect(() => {
    // Real-time wishlist count updates
    if (userId) {
      const handleWishlistUpdate = () => {
        // Refresh wishlist count from Redux
        if (whistlist && Array.isArray(whistlist.items)) {
          setWhistlistCount(whistlist.items.length);
        }
      };

      // Listen for custom events
      window.addEventListener('wishlistUpdated', handleWishlistUpdate);
      window.addEventListener('storage', (e) => {
        if (e.key === 'wishlist_updated') {
          handleWishlistUpdate();
        }
      });

      return () => {
        window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      };
    }
  }, [userId, whistlist]);

  useEffect(() => {
    if (searchQuery.trim() && !isSearchSubmitted) {
      const query = searchQuery.toLowerCase();
      const suggestions = products
        .filter(
          (product) =>
            product.prod_Name?.toLowerCase().includes(query) ||
            product.prod_category?.toLowerCase().includes(query)
        )
        .map((product) => ({
          name: product.prod_Name,
          category: product.prod_category,
        }));
      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchQuery, products, isSearchSubmitted]);

  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
    localStorage.setItem('isSearchSubmitted', JSON.stringify(isSearchSubmitted));
  }, [searchQuery, isSearchSubmitted]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    dispatch(signoutSuccess());
    setDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuOpen = (event) => {
    if (menuOpen) {
      handleMenuClose();
    } else {
      setAnchorEl(event.currentTarget);
      setMenuOpen(true);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setIsSearchSubmitted(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchSubmitted(true);
      setFilteredSuggestions([]);
    }
  };

  const handleEnterClick = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchSubmitted(true);
      setFilteredSuggestions([]);
    }
  };

  const handleCancelClick = () => {
    setSearchQuery('');
    setIsSearchSubmitted(false);
    setFilteredSuggestions([]);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name);
    setFilteredSuggestions([]);
    setIsSearchSubmitted(true);
    navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
  };

  return (
    <>
      <header className="fixed top-0 w-full bg-gradient-to-r from-gray-100 to-green-200 z-[9999]">
        <div className="w-full px-2 sm:px-3 md:px-4 py-2">
          <div className="flex items-center w-full flex-wrap md:flex-nowrap">
            {/* Logo - Responsive */}
            <Link
              to="/"
              className="flex ml-2 sm:ml-4 md:ml-6 text-base md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-blue-600 flex-shrink-0"
            >
              <img
                src={Logo}
                alt="Lifeneedz"
                className="w-30 sm:w-50 lg:w-50 md:w-50 xl:w-50 h-15 object-fill ml-3"
              />
            </Link>

            {/* Desktop Search & Navigation */}
            <div className="hidden lg:flex items-center flex-1 min-w-0 relative z-10 md:ml-3 lg:ml-6 xl:ml-30">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-xl lg:max-w-2xl">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Search products, categories..."
                      className="border-none rounded-full w-full px-8 sm:px-10 md:px-12 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-md hover:shadow-lg transition-shadow duration-200"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                    />
                    {searchQuery.trim() && !isSearchSubmitted && (
                      <ArrowForwardIcon
                        className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
                        onClick={handleEnterClick}
                      />
                    )}
                    {searchQuery.trim() && isSearchSubmitted && (
                      <CloseIcon
                        className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer w-4 h-4 sm:w-5 sm:h-5"
                        onClick={handleCancelClick}
                      />
                    )}
                    {filteredSuggestions.length > 0 && (
                      <div className="absolute top-full mt-1 sm:mt-2 w-full bg-white rounded-md shadow-lg z-50 max-h-48 sm:max-h-60 overflow-y-auto">
                        {filteredSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <span className="font-medium">{suggestion.name}</span> - {suggestion.category}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Location Button */}
              {/* <div className="hidden lg:flex relative ml-3 xl:ml-8">
                <button className="bg-white py-1.5 px-3 xl:px-6 rounded-xl flex items-center gap-1.5 xl:gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50">
                  <LocationOnIcon className="text-blue-600 text-base xl:text-lg" />
                  <p className="font-medium text-gray-700 whitespace-nowrap text-sm xl:text-base">Location</p>
                </button>
              </div> */}

              {/* User Actions - ALWAYS VISIBLE ON ALL DEVICES */}
              <div className="flex items-center ml-auto flex-shrink-0">
                {/* Wishlist */}
                <Tooltip title="Wishlist" arrow placement="bottom">
                  <Link
                    to="/whistlist"
                    className="relative text-gray-800 hover:text-lime-900 font-medium text-xs sm:text-sm flex items-center px-1.5 sm:px-2 md:px-3 lg:px-4 xl:px-5"
                  >
                    <div className="relative flex">
                      <div className="relative inline-block">
                        <FavoriteIcon className={`text-gray-800 text-base sm:text-lg md:text-xl ${isActive('/whistlist') ? 'text-yellow-700' : ''}`} />
                        {currentUser && whistlistCount > 0 && (
                          <span className="absolute -top-1.5 -right-1 sm:-top-2 sm:-right-1.5 md:-top-2.5 md:-right-1.5 xl:-top-3 xl:-right-2 bg-red-500 text-white rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 xl:h-5 xl:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                            {whistlistCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </Tooltip>

                {/* User Profile */}
                <div className="relative">
                  <button className="flex items-center space-x-1 sm:space-x-2 text-gray-800 hover:text-blue-600 font-medium text-sm px-1 sm:px-2 py-1.5 sm:py-2">
                    {currentUser ? (
                      <div className="relative">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={toggleDropdown}
                        >
                          <AccountCircleIcon sx={{
                            fontSize: {
                              xs: 24,
                              sm: 26,
                              md: 28,
                              lg: 30,
                              xl: 32
                            },
                            color: 'black'
                          }} />
                          <label className='text-black text-xs sm:text-sm md:text-base lg:text-lg cursor-pointer pl-0.5 sm:pl-1 uppercase hidden sm:block'>
                            {currentUser?.user?.userName?.length < 8
                              ? currentUser?.user?.userName
                              : currentUser?.user?.userName?.substring(0, 5) + "..."}
                          </label>
                          <label className='text-black text-xs cursor-pointer pl-0.5 sm:hidden uppercase'>
                            {currentUser?.user?.userName?.length < 6
                              ? currentUser?.user?.userName
                              : currentUser?.user?.userName?.substring(0, 3) + "..."}
                          </label>
                        </div>

                        {dropdownOpen && (
                          <div className="absolute right-0 mt-1.5 sm:mt-2 w-40 sm:w-48 md:w-50 bg-white rounded-md shadow-md z-50">
                            <div className='flex flex-col items-center justify-center mt-2 sm:mt-3 gap-1.5 sm:gap-2'>
                              <img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL-5UywI4IbBf_enQUwx0jtZ5krHsWa5nNpw&s"
                                alt=""
                                className='rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13'
                              />
                              <h2 className='text-blue-500 uppercase text-sm sm:text-base text-center px-2'>{currentUser?.user?.userName}</h2>
                            </div>
                            <Link
                              to={`/profile/${currentUser?.user?.userID}`}
                              className="block px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-100"
                              onClick={() => setDropdownOpen(false)}
                            >
                              View Profile
                            </Link>
                            <button
                              className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 mb-1.5 sm:mb-2 text-sm sm:text-base text-gray-700 hover:bg-gray-100"
                              onClick={handleLogout}
                            >
                              Logout
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link to="/login" className="flex items-center">
                        <PersonIcon className="text-lg sm:text-xl md:text-2xl" />
                        <span className="text-xs sm:text-sm ml-1 hidden sm:inline">Login</span>
                      </Link>
                    )}
                  </button>
                </div>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative text-gray-800 hover:text-lime-900 font-medium text-sm flex items-center px-2 sm:px-3 md:px-4 lg:px-5"
                >
                  <div className="relative flex">
                    <div className="relative inline-block">
                      <ShoppingCartIcon className={`text-gray-800 text-base sm:text-lg md:text-xl ${isActive('/cart') ? 'text-yellow-700' : ''}`} />
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-1 sm:-top-2 sm:-right-1.5 md:-top-2.5 md:-right-2 xl:-top-3 xl:-right-2 bg-red-500 text-white rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-4.5 md:w-4.5 xl:h-5 xl:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                          {count}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Mobile Actions & Search Toggle */}
            <div className="lg:hidden flex items-center  justify-end ml-auto gap-2 sm:gap-3">
              {/* Mobile Search Icon (opens search bar below) */}
              {/* <button className="bg-white py-1.5 px-3 xl:px-6 rounded-xl flex items-center gap-1.5 xl:gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50">
                <LocationOnIcon className="text-blue-600 text-base xl:text-lg" />
                <p className="font-medium text-gray-700 whitespace-nowrap text-sm xl:text-base">Location</p>
              </button> */}

              {/* Wishlist - Mobile */}
              <Tooltip title="Wishlist" arrow placement="bottom">
                <Link
                  to="/whistlist"
                  className="relative text-gray-800 hover:text-lime-900 font-medium text-xs sm:text-sm flex items-center px-1 sm:px-2"
                >
                  <div className="relative flex">
                    <div className="relative inline-block">
                      <FavoriteIcon className={`text-gray-800 text-base sm:text-lg ${isActive('/whistlist') ? 'text-yellow-700' : ''}`} />
                      {currentUser && whistlistCount > 0 && (
                        <span className="absolute -top-1.5 -right-1 sm:-top-2 sm:-right-1 bg-red-500 text-white rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center text-[10px] sm:text-xs">
                          {whistlistCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </Tooltip>

              {/* User Profile - Mobile */}
              <div className="relative">
                <button className="flex items-center text-gray-800 hover:text-blue-600 font-medium px-1 sm:px-2 py-1 sm:py-2">
                  {currentUser ? (
                    <div className="relative">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={toggleDropdown}
                      >
                        <AccountCircleIcon sx={{
                          fontSize: {
                            xs: 24,
                            sm: 26,
                          },
                          color: 'black'
                        }} />
                      </div>

                      {dropdownOpen && (
                        <div className="absolute right-0 mt-1.5 sm:mt-2 w-40 sm:w-48 bg-white rounded-md shadow-md z-50">
                          <div className='flex flex-col items-center justify-center mt-2 sm:mt-3 gap-1.5 sm:gap-2'>
                            <img
                              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL-5UywI4IbBf_enQUwx0jtZ5krHsWa5nNpw&s"
                              alt=""
                              className='rounded-full w-10 h-10 sm:w-12 sm:h-12'
                            />
                            <h2 className='text-blue-500 uppercase text-sm sm:text-base text-center px-2'>{currentUser?.user?.userName}</h2>
                          </div>
                          <Link
                            to={`/profile/${currentUser?.user?.userID}`}
                            className="block px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-700 hover:bg-gray-100"
                            onClick={() => setDropdownOpen(false)}
                          >
                            View Profile
                          </Link>
                          <button
                            className="block w-full px-3 sm:px-4 py-1.5 sm:py-2 mb-1.5 sm:mb-2 text-sm sm:text-base text-gray-700 hover:bg-gray-100"
                            onClick={handleLogout}
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link to="/login" className="flex items-center">
                      <PersonIcon className="text-lg sm:text-xl" />
                    </Link>
                  )}
                </button>
              </div>

              {/* Cart - Mobile */}
              <Link
                to="/cart"
                className="relative text-gray-800 hover:text-lime-900 font-medium flex items-center px-1 sm:px-2"
              >
                <div className="relative flex">
                  <div className="relative inline-block">
                    <ShoppingCartIcon className={`text-gray-800 text-base sm:text-lg ${isActive('/cart') ? 'text-yellow-700' : ''}`} />
                    {count > 0 && (
                      <span className="absolute -top-1.5 -right-1 sm:-top-2 sm:-right-1.5 bg-red-500 text-white rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center text-[10px] sm:text-xs">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden focus:outline-none p-2 flex items-center justify-center cursor-pointer"
              >
                <MenuIcon className="text-2xl text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (ALWAYS VISIBLE on mobile) */}
        <div className="lg:hidden bg-gradient-to-r from-gray-100 to-green-200 border-t border-gray-300">
          <div className="w-full px-3 sm:px-4 py-2">
            <div className="relative w-full">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative flex items-center w-full">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products, categories..."
                    className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm sm:text-base"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                  />
                  {searchQuery.trim() && !isSearchSubmitted && (
                    <ArrowForwardIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer w-5 h-5"
                      onClick={handleEnterClick}
                    />
                  )}
                  {searchQuery.trim() && isSearchSubmitted && (
                    <CloseIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer w-5 h-5"
                      onClick={handleCancelClick}
                    />
                  )}
                </div>
              </form>
              {filteredSuggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="font-medium">{suggestion.name}</span> - {suggestion.category}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Spacer for fixed header */}

        <div className="bg-gradient-to-r from-gray-100 to-green-200 z-40 w-full shadow-lg -mt-[1px] md:-mt-0">
          {/* Removed the duplicate fixed mobile search bar section */}

          <div className="lg:hidden h-auto"></div>

          {currentUser && mobileMenuOpen && (
            <div className="lg:hidden fixed top-[118px] md:top-[108px] right-0 z-[9999] w-full">
              <div className="bg-gradient-to-r from-gray-100 to-green-200 w-full pb-5 shadow-lg">
                <nav className="container mx-auto px-4">
                  <div className="flex flex-col mt-5">
                    <a
                      href="/"
                      className={`text-gray-800 font-semibold text-md flex items-center px-4 py-3 rounded-lg mt-2 ${isActive('/') ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md text-white' : 'hover:bg-white/50'
                        }`}
                    >
                      <HomeIcon className="mr-2" />
                      Home
                    </a>
                    <a
                      href="/products"
                      className={`text-gray-800 font-semibold text-md flex items-center px-4 py-3 rounded-lg ${isActive('/products') ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md text-white' : 'hover:bg-white/50'
                        }`}
                    >
                      <ShoppingBagIcon className="mr-2" />
                      Products
                    </a>
                    <a
                      href="/order"
                      className={`text-gray-800 font-semibold text-md flex items-center px-4 py-3 rounded-lg ${isActive('/order') ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md text-white' : 'hover:bg-white/50'
                        }`}
                    >
                      <ReceiptLongIcon className="mr-2" />
                      Orders
                    </a>
                    <a
                      href="/delivery-address"
                      className={`text-gray-800 font-semibold text-md flex items-center px-4 py-3 rounded-lg ${isActive('/delivery-address') ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md text-white' : 'hover:bg-white/50'
                        }`}
                    >
                      <LocalShippingIcon className="mr-2" />
                      Delivery Address
                    </a>
                    <a
                      href="/contact"
                      className={`text-gray-800 font-semibold text-md flex items-center px-4 py-3 rounded-lg ${isActive('/contact') ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md text-white' : 'hover:bg-white/50'
                        }`}
                    >
                      <ContactMailIcon className="mr-2" />
                      Contact Us
                    </a>
                    <a
                      href="/event"
                      className={`text-gray-800 font-semibold text-md flex items-center px-4 py-3 rounded-lg ${isActive('/event') ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md text-white' : 'hover:bg-white/50'
                        }`}
                    >
                      <EventIcon className="mr-2" />
                      Event
                    </a>
                    <a
                      href="/video"
                      className={`text-gray-800 font-semibold text-md flex items-center px-4 py-3 rounded-lg ${isActive('/video') ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md text-white' : 'hover:bg-white/50'
                        }`}
                    >
                      <FeaturedVideoIcon className="mr-2" />
                      Video
                    </a>
                  </div>
                </nav>
              </div>
            </div>
          )}

          {currentUser && (
            <div className="mx-auto px-1 z-0">
              <div className="flex items-center justify-end w-full flex-nowrap">
                <nav className="hidden lg:flex items-center space-x-4">
                  <a
                    href="/"
                    className={`text-md font-medium px-4 py-2 flex items-center transition-all duration-100 ${isActive('/') ? 'border-b-4 border-yellow-500 text-yellow-600' : 'text-gray-700 hover:text-yellow-600'
                      }`}
                  >
                    <HomeIcon className="mr-2" />
                    Home
                  </a>
                  <a
                    href="/products"
                    className={`text-md font-medium px-4 py-2 flex items-center transition-all duration-100 ${isActive('/products') ? 'border-b-4 border-yellow-500 text-yellow-600' : 'text-gray-700 hover:text-yellow-600'
                      }`}
                  >
                    <ShoppingBagIcon className="mr-2" />
                    Product
                  </a>
                  <a
                    href="/order"
                    className={`text-md font-medium px-4 py-2 flex items-center transition-all duration-100 ${isActive('/order') ? 'border-b-4 border-yellow-500 text-yellow-600' : 'text-gray-700 hover:text-yellow-600'
                      }`}
                  >
                    <ReceiptLongIcon className="mr-2" />
                    Orders
                  </a>
                  <a
                    href="/delivery-address"
                    className={`text-md font-medium px-4 py-2 flex items-center transition-all duration-100 ${isActive('/delivery-address') ? 'border-b-4 border-yellow-500 text-yellow-600' : 'text-gray-700 hover:text-yellow-600'
                      }`}
                  >
                    <LocalShippingIcon className="mr-2" />
                    Delivery Address
                  </a>
                  <a
                    href="/contact"
                    className={`text-md font-medium px-4 py-2 flex items-center transition-all duration-100 ${isActive('/contact') ? 'border-b-4 border-yellow-500 text-yellow-600' : 'text-gray-700 hover:text-yellow-600'
                      }`}
                  >
                    <ContactMailIcon className="mr-2" />
                    Contact
                  </a>
                  <a
                    href="/event"
                    className={`text-md font-medium px-4 py-2 flex items-center transition-all duration-100 ${isActive('/event') ? 'border-b-4 border-yellow-500 text-yellow-600' : 'text-gray-700 hover:text-yellow-600'
                      }`}
                  >
                    <EventIcon className="mr-2" />
                    Event
                  </a>
                  <a
                    href="/video"
                    className={`text-md font-medium px-4 py-2 flex items-center transition-all duration-100 ${isActive('/video') ? 'border-b-4 border-yellow-500 text-yellow-600' : 'text-gray-700 hover:text-yellow-600'
                      }`}
                  >
                    <FeaturedVideoIcon className="mr-2" />
                    Video
                  </a>
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
} 