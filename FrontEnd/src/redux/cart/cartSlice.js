import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (token, { rejectWithValue }) => {
    console.log(`Fetching cart with token`);
    try {
      const response = await fetch('/cart', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        console.error('Failed to fetch cart:', response.statusText);
        if (response.status === 500) {
          return {
            user_id: userId,
            items: [],
            total: 0,
            gst: 0,
            deliveryCharge: 0,
            discount: 0,
            grandTotal: 0,
          };
        }
        throw new Error('Failed to fetch cart');
      }
      const data = await response.json();
      console.log('Cart fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchCart:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ token, userId, prod_ID, quantity, selectedRate, prod_Name, image, prod_Rate }, { rejectWithValue }) => {
    console.log(`Adding to cart: userId=${userId}, prod_ID=${prod_ID}, quantity=${quantity}, unit=${selectedRate.key}`);
    try {
      if (!token || !userId || !prod_ID || !quantity || !selectedRate || !prod_Name || !image || !prod_Rate) {
        console.error('Missing required fields for addToCart:', { token, userId, prod_ID, quantity, selectedRate, prod_Name, image, prod_Rate });
        throw new Error('Missing required fields for addToCart');
      }
      if (!selectedRate.key || selectedRate.value === undefined) {
        console.error('Invalid selectedRate format:', selectedRate);
        throw new Error('Selected rate must include key and value');
      }
      if (!Array.isArray(prod_Rate) || prod_Rate.length === 0) {
        console.error('Invalid prod_Rate format:', prod_Rate);
        throw new Error('prod_Rate must be a non-empty array');
      }
      const response = await fetch('/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId, prod_ID, quantity, selectedRate, prod_Name, image, prod_Rate }),
      });
      if (!response.ok) {
        let errorMessage = 'Failed to add to cart';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        console.error('Failed to add to cart:', errorMessage);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      console.log('Added to cart successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in addToCart:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ token, userId, prod_ID, quantity, selectedRate, currentRate }, { rejectWithValue }) => {
    console.log(`Updating cart item: userId=${userId}, prod_ID=${prod_ID}, quantity=${quantity}, currentRate=${JSON.stringify(currentRate)}, selectedRate=${JSON.stringify(selectedRate)}`);
    
    try {
      if (!token || !userId || !prod_ID || quantity === undefined) {
        console.error('Token, Product ID, userId, and quantity are required');
        throw new Error('Token, Product ID, userId, and quantity are required');
      }
      
      // ALWAYS include currentRate when available to identify which unit to update
      const requestBody = { 
        userId, 
        prod_ID, 
        quantity 
      };
      
      // CRITICAL: Always include currentRate to identify which unit we're updating
      if (currentRate && currentRate.key) {
        requestBody.currentRate = currentRate;
      } else if (selectedRate && selectedRate.key) {
        // If currentRate not provided, use selectedRate as fallback
        requestBody.currentRate = selectedRate;
      } else {
        console.error('No rate information provided to identify which unit to update');
        throw new Error('Rate information is required to identify which unit to update');
      }
      
      // Include selectedRate if we're changing the unit
      if (selectedRate && selectedRate.key) {
        requestBody.selectedRate = selectedRate;
      }
      
      console.log('Update request body:', requestBody);
      
      const response = await fetch('/cart/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update cart:', errorData);
        throw new Error(errorData.message || 'Failed to update cart');
      }
      
      const updatedCart = await response.json();
      console.log('Cart updated successfully:', updatedCart);
      
      // Return the entire cart state for proper unit separation
      return updatedCart;
      
    } catch (error) {
      console.error('Error in updateCartItem:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ prod_ID, selectedRate }, { rejectWithValue, getState }) => {
    const currentUser = getState().user.currentUser;
    const userId = currentUser?.user?.userID;
    const token = currentUser?.token;
    
    console.log(`Removing from cart: userId=${userId}, prod_ID=${prod_ID}, unit=${selectedRate?.key}`);
    
    try {
      if (!token || !userId) {
        console.error('Token and User ID are required in removeFromCart');
        throw new Error('Token and User ID are required');
      }
      
      if (!selectedRate || !selectedRate.key) {
        console.error('selectedRate is required to identify which unit to remove');
        throw new Error('Rate information is required to identify which unit to remove');
      }
      
      const response = await fetch(`/cart/remove/${prod_ID}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ selectedRate }),
      });
      
      if (!response.ok) {
        console.error('Failed to remove from cart:', response.statusText);
        throw new Error('Failed to remove from cart');
      }
      
      console.log('Item removed from cart:', { prod_ID, unit: selectedRate.key });
      
      // Return the entire cart from server
      const updatedCart = await response.json();
      return updatedCart;
      
    } catch (error) {
      console.error('Error in removeFromCart:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'cart/createOrder',
  async ({ token, userId, orderDetails }, { rejectWithValue }) => {
    console.log(`Creating order for userId: ${userId}`, orderDetails);
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      const response = await fetch('/createorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderDetails),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create order:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }
      const data = await response.json();
      console.log('Order created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createOrder:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    gst: 0,
    deliveryCharge: 0,
    discount: 0,
    grandTotal: 0,
    status: 'idle',
    error: null,
    user_id: '',
  },
  reducers: {
    clearCart: (state) => {
      console.log('Clearing cart');
      state.items = [];
      state.total = 0;
      state.gst = 0;
      state.deliveryCharge = 0;
      state.discount = 0;
      state.grandTotal = 0;
      state.user_id = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        console.log('fetchCart: Pending');
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        console.log('fetchCart: Fulfilled', action.payload);
        state.status = 'succeeded';
        state.user_id = action.payload.user_id;
        state.items = action.payload.items.map((item) => ({
          ...item,
          subtotal: item.quantity * item.selectedRate.value,
        }));
        state.total = action.payload.total || 0;
        state.gst = action.payload.gst || 0;
        state.deliveryCharge = action.payload.deliveryCharge || 0;
        state.discount = action.payload.discount || 0;
        state.grandTotal = action.payload.grandTotal || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        console.log('fetchCart: Rejected', action.payload);
        state.status = 'failed';
        state.error = action.payload;
        state.items = [];
        state.total = 0;
        state.gst = 0;
        state.deliveryCharge = 0;
        state.discount = 0;
        state.grandTotal = 0;
        state.user_id = '';
      })
      .addCase(addToCart.pending, (state) => {
        console.log('addToCart: Pending');
        state.status = 'loading';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        console.log('addToCart: Fulfilled', action.payload);
        state.status = 'succeeded';
        state.user_id = action.payload.user_id;
        state.items = action.payload.items.map((item) => ({
          ...item,
          subtotal: item.quantity * item.selectedRate.value,
        }));
        state.total = action.payload.total || 0;
        state.gst = action.payload.gst || 0;
        state.deliveryCharge = action.payload.deliveryCharge || 0;
        state.discount = action.payload.discount || 0;
        state.grandTotal = action.payload.grandTotal || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        console.log('addToCart: Rejected', action.payload);
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        console.log('updateCartItem: Fulfilled', action.payload);
        
        // The server returns the entire cart with proper unit separation
        state.user_id = action.payload.user_id;
        state.items = action.payload.items.map((item) => ({
          ...item,
          subtotal: item.quantity * item.selectedRate.value,
        }));
        
        state.total = action.payload.total || 0;
        state.gst = action.payload.gst || 0;
        state.deliveryCharge = action.payload.deliveryCharge || 0;
        state.discount = action.payload.discount || 0;
        state.grandTotal = action.payload.grandTotal || 0;
        
        console.log('Updated cart items after unit change:', state.items);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        console.log('updateCartItem: Rejected', action.payload);
        state.error = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        console.log('removeFromCart: Fulfilled', action.payload);
        
        // The server returns the entire cart after removal
        state.user_id = action.payload.user_id;
        state.items = action.payload.items.map((item) => ({
          ...item,
          subtotal: item.quantity * item.selectedRate.value,
        }));
        
        state.total = action.payload.total || 0;
        state.gst = action.payload.gst || 0;
        state.deliveryCharge = action.payload.deliveryCharge || 0;
        state.discount = action.payload.discount || 0;
        state.grandTotal = action.payload.grandTotal || 0;
        
        console.log('Cart after removal:', state.items);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        console.log('removeFromCart: Rejected', action.payload);
        state.error = action.payload;
      })
      .addCase(createOrder.pending, (state) => {
        console.log('createOrder: Pending');
        state.status = 'loading';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        console.log('createOrder: Fulfilled', action.payload);
        state.status = 'succeeded';
        state.items = [];
        state.total = 0;
        state.gst = 0;
        state.deliveryCharge = 0;
        state.discount = 0;
        state.grandTotal = 0;
        state.user_id = '';
      })
      .addCase(createOrder.rejected, (state, action) => {
        console.log('createOrder: Rejected', action.payload);
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;