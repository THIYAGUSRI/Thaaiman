// src/redux/whistlist/whistlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async Thunks for API calls
export const fetchWhistlist = createAsyncThunk(
  'whistlist/fetchWhistlist',
  async ({ token, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/whistlists/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wishlist: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToWhistlist = createAsyncThunk(
  'whistlist/addToWhistlist',
  async ({ token, userId, productId }, { rejectWithValue }) => {
    try {
      console.log('Adding to wishlist - userId:', userId, 'productId:', productId);

      const response = await fetch('/createwhistlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prod_id: productId,
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Add to wishlist failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch {
          const errorText = await response.text();
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      // Handle different response formats
      if (data.whistlist) {
        return data.whistlist;
      } else if (data.id && data.product_id) {
        return data; // Direct wishlist item
      } else {
        throw new Error('Invalid response format from server');
      }
      
    } catch (error) {
      console.error('Error in addToWhistlist:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromWhistlist = createAsyncThunk(
  'whistlist/removeFromWhistlist',
  async ({ token, userId, itemId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/deletewhistlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: userId })
      });
      
      if (!response.ok) {
        throw new Error('Delete from wishlist failed');
      }
      
      return itemId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const whistlistSlice = createSlice({
  name: 'whistlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
    message: '',
    popupCoords: null,
    popupProductId: null,
  },
  reducers: {
    clearWhistlistMessage: (state) => {
      state.message = '';
      state.error = null;
      state.popupCoords = null;
      state.popupProductId = null;
    },
    setWhistlistPopup: (state, action) => {
      const { coords, productId } = action.payload;
      state.popupCoords = coords;
      state.popupProductId = productId;
    },
    clearWhistlistPopup: (state) => {
      state.popupCoords = null;
      state.popupProductId = null;
    },
    updateWishlistCount: (state) => {
      // This reducer is now handled automatically in extraReducers
    }
  },
  extraReducers: (builder) => {
    // Fetch Whistlist
    builder
      .addCase(fetchWhistlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWhistlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
        // Dispatch event for header update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('wishlistUpdated'));
        }
      })
      .addCase(fetchWhistlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add to Whistlist
    builder
      .addCase(addToWhistlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWhistlist.fulfilled, (state, action) => {
        state.loading = false;
        
        // Check if item already exists
        const existingItem = state.items.find(item => 
          item.product_id === action.payload.product_id
        );
        
        if (!existingItem) {
          state.items.push(action.payload);
          state.message = 'Added to wishlist!';
          // Dispatch event for header update
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('wishlistUpdated'));
            localStorage.setItem('wishlist_updated', Date.now().toString());
          }
        } else {
          state.message = 'Already in wishlist!';
        }
        state.error = null;
      })
      .addCase(addToWhistlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add to wishlist';
      });

    // Remove from Whistlist
    builder
      .addCase(removeFromWhistlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWhistlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.message = 'Removed from wishlist!';
        state.error = null;
        // Dispatch event for header update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('wishlistUpdated'));
          localStorage.setItem('wishlist_updated', Date.now().toString());
        }
      })
      .addCase(removeFromWhistlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to remove from wishlist';
      });
  }
});

export const { 
  clearWhistlistMessage, 
  setWhistlistPopup, 
  clearWhistlistPopup,
  updateWishlistCount
} = whistlistSlice.actions;

export default whistlistSlice.reducer;