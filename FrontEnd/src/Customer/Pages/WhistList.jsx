import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../Components/Common Components/Header';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Button,
  Modal,
  Typography,
  Box,
  Backdrop,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ProductCard from '../Components/Home Components/ProductCard';
import { addToCart, fetchCart } from '../../redux/cart/cartSlice';
import { fetchWhistlist } from '../../redux/whistlist/whistlistSlice';
import Nouser from '../../Images/userloginwhistlist.png'
import { Link } from 'react-router-dom';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

// Styled Add to Cart Button with interactive animation
const AddToCartButton = styled(Button)(({ theme }) => ({
  marginTop: '2rem',
  padding: '12px 32px',
  fontSize: '1.1rem',
  borderRadius: '12px',
  color: '#fff',
  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
  boxShadow: '0 6px 18px rgba(66,165,245,0.22)',
  transform: 'translateY(0)',
  transition: 'transform 220ms ease, box-shadow 220ms ease, filter 220ms ease',
  animation: 'floating 3s ease-in-out infinite',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 12px 30px rgba(66,165,245,0.32)',
    filter: 'brightness(1.03)'
  },
  '&:active': {
    transform: 'translateY(-2px) scale(0.98)'
  },
  '&:focus': {
    outline: 'none'
  },
  '@keyframes floating': {
    '0%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-6px)' },
    '100%': { transform: 'translateY(0)' },
  },
}));

export default function WhistList() {
  const [whistlistItems, setWhistlistItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addAllLoading, setAddAllLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [popupCoords, setPopupCoords] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);
  const cart = useSelector((state) => state.cart);
  const whistlist = useSelector((state) => state.whistlist.items); // Add this line
  const dispatch = useDispatch();
  const userId = currentUser?.user?.userID;
  const token = currentUser?.token;

  const getAuthHeaders = useCallback(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [whistRes, prodRes] = await Promise.all([
          fetch(`/whistlists/${userId}`, {
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          }),
          fetch('/products', {
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          }),
        ]);

        if (!whistRes.ok || !prodRes.ok) throw new Error('Failed to fetch data');

        const whistData = await whistRes.json();
        const prodData = await prodRes.json();

        setWhistlistItems(whistData);
        setProducts(prodData);
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, getAuthHeaders]);

  // Filter products that are in the wishlist
  const whistlistProducts = products.filter((product) =>
    whistlistItems.some((item) => item.product_id === product.prod_ID)
  );

  const handleAddAllToCart = async () => {
    if (!userId || whistlistProducts.length === 0) return;

    setAddAllLoading(true);

    try {
      // Get current cart items to check for duplicates
      const cartItems = Array.isArray(cart.items) ? cart.items : [];

      let addedCount = 0;
      let ignoredCount = 0;

      // Prepare all add to cart actions
      const addToCartPromises = [];

      for (const product of whistlistProducts) {
        // Check if product already in cart
        const isInCart = cartItems.some(item => item.prod_ID === product.prod_ID);

        if (!isInCart) {
          // Get default rate
          const defaultRate = product.prod_Rate && Array.isArray(product.prod_Rate) && product.prod_Rate.length > 0
            ? {
              key: Object.keys(product.prod_Rate[0])[0],
              value: Number(Object.values(product.prod_Rate[0])[0])
            }
            : { key: 'default', value: 0 };

          // Prepare add to cart action
          const addToCartAction = dispatch(addToCart({
            token,
            userId,
            prod_ID: product.prod_ID,
            quantity: 1,
            selectedRate: defaultRate,
            prod_Name: product.prod_Name || 'Unknown Product',
            image: product.prod_Images && product.prod_Images[0]?.image
              ? product.prod_Images[0].image.replace(/\\/g, '/')
              : 'default-image.jpg',
            prod_Rate: product.prod_Rate,
            prod_category: product.prod_category,
          }));

          addToCartPromises.push(addToCartAction);
          addedCount++;
        } else {
          ignoredCount++;
        }
      }

      // Wait for all add to cart actions to complete
      if (addToCartPromises.length > 0) {
        await Promise.all(addToCartPromises);
        // Fetch updated cart to ensure state is synchronized
        await dispatch(fetchCart(token));
      }

      // Show appropriate message
      let successMessage = '';
      if (addedCount > 0 && ignoredCount > 0) {
        successMessage = `Added ${addedCount} item(s) to cart. ${ignoredCount} item(s) were already in your cart.`;
      } else if (addedCount > 0) {
        successMessage = `Added ${addedCount} item(s) to cart successfully!`;
      } else if (ignoredCount > 0) {
        successMessage = `All ${ignoredCount} item(s) were already in your cart.`;
      }

      setMessage(successMessage);
      setPopupCoords({ x: window.innerWidth / 2, y: 20 });

      setModalOpen(false);

    } catch (error) {
      console.error('Error adding all to cart:', error);
      setMessage('Failed to add items to cart');
      setPopupCoords({ x: window.innerWidth / 2, y: 20 });
    } finally {
      setAddAllLoading(false);
    }
  };

  // Function to handle wishlist removal from child component
  const handleWishlistItemRemoved = useCallback((productId) => {
    // Update local state to remove the item
    setWhistlistItems(prev => prev.filter(item => item.product_id !== productId));

    // Dispatch event to update header count
    window.dispatchEvent(new Event('wishlistUpdated'));
  }, []);

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setPopupCoords(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Sync with Redux wishlist when it changes
  useEffect(() => {
    if (whistlist && Array.isArray(whistlist)) {
      setWhistlistItems(whistlist);
    }
  }, [whistlist]);

  if (!userId) {
    return (
      <div className='flex flex-col items-center justify-center '>
        <Header />
        <img src={Nouser} alt="" srcset="" />
        <div className="p-8 text-center text-xl">Please log in to view your wishlist.</div>
        <Link
          to="/login"
          className="mt-4 mb-5 inline-block bg-indigo-600 text-white text-2xl font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Log In
        </Link>
      </div>

    );
  }

  if (loading) {
    return <div className="p-8 text-center text-xl">Loading your wishlist...</div>;
  }

  return (
    <div className="min-h-screen mt-30 bg-gray-50" inert={modalOpen ? true : undefined}>
      <Header />

      {/* Success Popup */}
      {message && popupCoords && (
        <div
          style={{
            position: 'fixed',
            left: '35%',
            bottom: '40px',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl text-white font-bold bg-green-500 animate-bounce"
        >
          <ShoppingCartIcon />
          <span>{message}</span>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">
          My Wishlist ({whistlistProducts.length})
        </h2>

        {whistlistProducts.length > 0 ? (
          <div className='flex flex-col items-center'>
            {/* Pass a prop to ProductCard to handle wishlist removal */}
            <div className="w-full">
              <ProductCard
                products={whistlistProducts}
                onWishlistItemRemoved={handleWishlistItemRemoved}
                disableWishlistFetch={true} // Add this prop
              />
            </div>
            <div className='py-6'>
              <AddToCartButton
                variant="contained"
                onClick={() => setModalOpen(true)}
                startIcon={<ShoppingCartIcon />}
                disableElevation
              >
                <span style={{ fontWeight: 800, letterSpacing: '0.2px' }}>
                  Add All to Cart
                </span>
              </AddToCartButton>
            </div>
          </div>


        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <p className="text-2xl text-gray-600 mb-6">Your wishlist is empty</p>
            <Button variant="contained" size="large" href="/">
              Continue Shopping
            </Button>
          </div>
        )}
      </div>

      {/* MUI Modal - Fixed & Beautiful */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
        disableEnforceFocus
        disableAutoFocus
      >
        <Fade in={modalOpen}>
          <Box sx={style}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
              Add All to Cart
            </Typography>
            <Typography sx={{ mt: 2, mb: 4 }}>
              Are you sure you want to add all {whistlistProducts.length} item(s) from your wishlist to your cart?
              {whistlistProducts.length > 0 && (
                <span style={{ display: 'block', marginTop: '8px', color: '#666', fontSize: '0.9em' }}>
                  Note: Items already in your cart will be ignored. Items will remain in your wishlist.
                </span>
              )}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => setModalOpen(false)} disabled={addAllLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleAddAllToCart}
                disabled={addAllLoading}
                startIcon={addAllLoading ? null : <ShoppingCartIcon />}
              >
                {addAllLoading ? 'Adding...' : 'Yes, Add All to Cart'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}