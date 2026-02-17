import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Cart from './MongoDB/cart.js';
import Contact from './MongoDB/contact.js';
import DeliveryAddress from './MongoDB/deliveryAddress.js';
import DeliveryCentre from './MongoDB/deliverycenter.js';
import Order from './MongoDB/order.js';
import Product from './MongoDB/product.js';
import Whistlist from './MongoDB/whistlist.js';
import Category from './MongoDB/category.js';
import User from './MongoDB/user.js';
import Video from './MongoDB/videoDetail.js';
import Comment from './MongoDB/Comment.js';
import Event from './MongoDB/EventDetail.js';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { error, log } from 'console';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
dotenv.config();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// JWT Utility Functions
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET);
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
app.use(express.json());
app.use(cors());
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
// Ensure upload directory exists
const uploadDir = 'Uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
// Improved Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'Uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueName}${extension}`);
  },
});
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Max 5 files
  }
});
// Error handling middleware for Multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Max 5MB allowed.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Max 5 files allowed.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field' });
    }
  }
  if (error.message.includes('image files')) {
    return res.status(400).json({ message: error.message });
  }
  next(error);
};
// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN = './JSON/admin.json'
const initializeJsonFiles = () => {
  const dir = './JSON';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const files = [ADMIN];
  files.forEach((file) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([], null, 2), 'utf8');
    }
  });
};
initializeJsonFiles();
const readData = (file) => {
  try {
    if (!fs.existsSync(file)) {
      console.log(`Server.js: File ${file} does not exist, creating empty array`);
      fs.writeFileSync(file, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(file, 'utf-8');
    if (!data.trim()) {
      console.log(`Server.js: File ${file} is empty, initializing with empty array`);
      fs.writeFileSync(file, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`Server.js: Error reading file ${file}:`, error);
    return [];
  }
};
const writeData = (file, data) => {
  try {
    console.log(`Server.js: Writing data to file ${file}`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Server.js: Error writing file ${file}:`, error);
  }
};
app.post('/adminlogin', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      console.error('server.js: Email is Required');
      return res.status(400).json({ message: 'Email is required' });
    }
    if (!password) {
      console.error('server.js: Password is Required');
      return res.status(400).json({ message: 'Password is Required' });
    }
    const adminData = readData(ADMIN);
    const admin = adminData.find((u) => u.email === email && u.password === password);
    if (!admin) {
      console.error('Server.js: Invalid email or password');
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    console.log('server.js: Login Successful for Admin', admin.email);
    res.status(200).json({ id: admin.id, ...admin });
  } catch (error) {
    console.error('Server.js: Error in /adminlogin POST:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
const calculateCartTotals = (items) => {
  console.log('Server.js: Calculating cart totals for items:', items);
  const total = items.reduce((sum, item) => sum + (item.subtotal || item.quantity * item.selectedRate.value), 0);
  const gst = total * 0.18;
  const deliveryCharge = 50;
  const discount = 50;
  const grandTotal = total + gst + deliveryCharge - discount;
  console.log('Server.js: Cart totals calculated:', { total, gst, deliveryCharge, discount, grandTotal });
  return { total, gst, deliveryCharge, discount, grandTotal };
};

// Common Order CRUD Functions
const orderCRUD = {
  // Create Order
  create: async (req, res) => {
    try {
      const nowDate = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString();
      console.log(`Server.js: Creating order for userId: ${req.userId}`, req.body);
      const { orderdetails } = req.body;
      if (!orderdetails || !orderdetails.order) {
        console.error('Server.js: Missing order details in request body');
        return res.status(400).json({ message: 'Order details are required' });
      }
      const {
        order_items,
        notes,
        total,
        gst,
        deliveryCharge,
        discount,
        grandTotal,
        order_deliveryDay,
        order_deliveryTime,
        order_direction,
        order_selectedAddress,
      } = orderdetails.order;
      // Validate required fields
      if (
        !order_items ||
        !Array.isArray(order_items) ||
        order_items.length === 0 ||
        total === undefined ||
        gst === undefined ||
        deliveryCharge === undefined ||
        discount === undefined ||
        grandTotal === undefined ||
        !order_deliveryDay ||
        !order_deliveryTime ||
        !order_direction ||
        !order_selectedAddress ||
        !order_selectedAddress.id ||
        !order_selectedAddress.userID
      ) {
        console.error('Server.js: Missing required order fields');
        return res.status(400).json({ message: 'All order fields are required' });
      }
      // Validate userID in order_selectedAddress matches req.userId
      if (order_selectedAddress.userID !== req.userId) {
        console.error('Server.js: User ID mismatch in order_selectedAddress:', {
          addressUserID: order_selectedAddress.userID,
          authUserId: req.userId
        });
        return res.status(403).json({ message: 'Unauthorized: User ID mismatch in address' });
      }
      // Validate order_items structure
      for (const item of order_items) {
        if (
          !item.prod_ID ||
          !item.prod_Name ||
          !item.image ||
          !item.selectedRate ||
          !item.selectedRate.key ||
          item.selectedRate.value === undefined ||
          item.order_quantity === undefined ||
          item.subtotal === undefined
        ) {
          console.error('Server.js: Invalid order item structure:', item);
          return res.status(400).json({ message: 'Invalid order item structure' });
        }
      }
      // Generate order ID
      const order = await Order.findOne().sort({ order_ID: -1 });
      let orderNumber = 1;
      let delivery = await DeliveryCentre.findOne({ deliveryNickName: order_direction });
      let deliveryNumber = 1; // Default delivery number
      if (delivery && delivery.id) {
        const extracted = parseInt(delivery.id.slice(16));
        if (!isNaN(extracted)) {
          deliveryNumber = extracted;
        }
      }
      if (order) {
        const lastNum = parseInt(order.order_ID.slice(12)); // Extract order number after 'O'
        if (!isNaN(lastNum)) {
          orderNumber = lastNum + 1;
        }
      }
      let orderId;
      let attempts = 0;
      do {
        orderId = `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${deliveryNumber.toString().padStart(2, '0')}O${(orderNumber + attempts).toString().padStart(3, '0')}`;
        attempts++;
        // Check if this order ID already exists
        const existingOrder = await Order.findOne({ order_ID: orderId });
        if (!existingOrder) break;
        console.log(`Server.js: Order ID ${orderId} already exists, trying next number`);
      } while (attempts < 100); // Prevent infinite loop

      console.log(`Server.js: Final order ID: ${orderId}, deliveryNumber: ${deliveryNumber}, orderNumber: ${orderNumber + attempts - 1}`);
      const newOrder = new Order({
        order_ID: orderId,
        userID: req.userId,
        notes,
        order_items,
        total,
        gst,
        deliveryCharge,
        discount,
        grandTotal,
        order_deliveryDay,
        order_deliveryTime,
        order_direction,
        order_selectedAddress,
        currentDate: nowDate,
        currentTime: nowTime,
        deliveryProcess: "Order Placed"
      });
      await newOrder.save();
      console.log('Server.js: Order created successfully:', newOrder);
      // NEW: Subtract stock from products based on units
      for (const item of order_items) {
        const product = await Product.findOne({ prod_ID: item.prod_ID });
        if (!product) {
          console.error(`Server.js: Product not found for prod_ID: ${item.prod_ID}, skipping stock update`);
          continue;
        }
        const key = item.selectedRate.key.toLowerCase();
        const match = key.match(/(\d+(\.\d+)?)/); // Extract number (int or float)
        if (!match) {
          console.error(`Server.js: No number found in key: ${key}, skipping stock update`);
          continue;
        }
        let num = parseFloat(match[1]);
        let amount = num * item.order_quantity;
        if (key.includes('kg')) {
          // amount = num * quantity (already set)
        } else if (key.includes('g')) {
          amount = (num / 1000) * item.order_quantity;
        } else if (key.includes('l')) {
          // amount = num * quantity (already set)
        } else if (key.includes('ml')) {
          amount = (num / 1000) * item.order_quantity;
        } else if (key.includes('piece')) {
          // amount = num * quantity (already set)
        } else if (key.includes('dozen')) {
          // amount = num * quantity (as per your instructions, no *12)
        } else {
          console.error(`Server.js: Unknown unit in key: ${key}, skipping stock update`);
          continue;
        }
        product.prod_Stock -= amount;
        if (product.prod_Stock < 0) {
          product.prod_Stock = 0;
        }
        await product.save();
        console.log(`Server.js: Stock updated for prod_ID: ${item.prod_ID}, subtracted: ${amount}, new stock: ${product.prod_Stock}`);
      }
      // Clear the user's cart
      await Cart.findOneAndUpdate(
        { user_id: req.userId },
        {
          items: [],
          total: 0,
          gst: 0,
          deliveryCharge: 0,
          discount: 0,
          grandTotal: 0
        }
      );
      console.log('Server.js: Cart cleared successfully for userId:', req.userId);
      // Respond with success and the new order
      res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
      console.error('Server.js: Error in order createOrder:', error.message, error.stack);
      res.status(500).json({ message: 'Error creating order', error: error.message });
    }
  },

  // Get Orders by User
  getByUser: async (req, res) => {
    try {
      console.log(`Server.js: Fetching all orders for userId: ${req.userId}`);
      const userOrders = await Order.find({ userID: req.userId }).sort({ order_ID: -1 });
      if (userOrders.length === 0) {
        console.log(`Server.js: No orders found for userId: ${req.userId}`);
        return res.status(404).json({ message: 'No orders found for this user' });
      }
      console.log('Server.js: Orders fetched:', userOrders);
      res.status(200).json(userOrders);
    } catch (error) {
      console.error('Server.js: Error in getOrdersByUser:', error.message, error.stack);
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
  },

  // Get All Orders (Admin/Delivery)
  getAll: async (req, res) => {
    try {
      const allOrders = await Order.find({}); // Get every order in the database
      res.status(200).json(allOrders);
    } catch (error) {
      console.error('Server.js: Error in getAllOrders:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update Order
  update: async (req, res) => {
    try {
      const { order_ID } = req.params;
      const updatedData = req.body.orderdetails?.order;
      console.log(`Server.js: Updating order with order_ID: ${order_ID} for userId: ${req.userId}`, updatedData);

      // Validate input
      if (!updatedData || typeof updatedData !== 'object') {
        console.error('Server.js: Missing or invalid order details in request body');
        return res.status(400).json({ message: 'Order details must be provided as an object' });
      }

      // Find the order to update
      const order = await Order.findOne({ order_ID });
      if (!order) {
        console.error('Server.js: Order not found:', order_ID);
        return res.status(404).json({ message: 'Order not found' });
      }

      // Get current user
      const currentUser = await User.findOne({ userID: req.userId });
      if (!currentUser) {
        console.error('Server.js: User not found for userID:', req.userId);
        return res.status(404).json({ message: 'User not found' });
      }


      // Check authorization
      const isOrderOwner = order.userID === req.userId;
      const isAssignedToOrder = order.order_direction && currentUser.deliveryNickName &&
        order.order_direction.toLowerCase() === currentUser.deliveryNickName.toLowerCase();

      if (!isOrderOwner && !(isAssignedToOrder)) {
        console.error('Server.js: Unauthorized: User not allowed to update this order:', {
          orderUserID: order.userID,
          authUserId: req.userId,
          orderDirection: order.order_direction,
          userDeliveryNickName: currentUser?.deliveryNickName
        });
        return res.status(403).json({ message: 'Unauthorized: You are not allowed to update this order' });
      }

      // Delivery person can only update deliveryProcess
      if (isAssignedToOrder) {
        const allowedFields = ['deliveryProcess'];
        const updateKeys = Object.keys(updatedData);
        const invalidFields = updateKeys.filter(key => !allowedFields.includes(key));
        if (invalidFields.length > 0) {
          return res.status(400).json({
            message: `Delivery persons can only update deliveryProcess field. Invalid fields: ${invalidFields.join(', ')}`
          });
        }
      }

      // Validate order_items if provided
      if (updatedData.order_items) {
        if (!Array.isArray(updatedData.order_items) || updatedData.order_items.length === 0) {
          console.error('Server.js: order_items must be a non-empty array');
          return res.status(400).json({ message: 'order_items must be a non-empty array' });
        }
        for (const item of updatedData.order_items) {
          if (
            !item.prod_ID ||
            !item.prod_Name ||
            !item.image ||
            !item.selectedRate ||
            !item.selectedRate.key ||
            item.selectedRate.value === undefined ||
            item.order_quantity === undefined ||
            item.subtotal === undefined
          ) {
            console.error('Server.js: Invalid order item structure:', item);
            return res.status(400).json({ message: 'Invalid order item structure' });
          }
        }
      }

      // Validate order_selectedAddress if provided
      if (updatedData.order_selectedAddress) {
        if (!updatedData.order_selectedAddress.id || !updatedData.order_selectedAddress.userID) {
          console.error('Server.js: order_selectedAddress must include id and userID');
          return res.status(400).json({ message: 'order_selectedAddress must include id and userID' });
        }
        if (updatedData.order_selectedAddress.userID !== req.userId) {
          console.error('Server.js: User ID mismatch in order_selectedAddress:', {
            addressUserID: updatedData.order_selectedAddress.userID,
            authUserId: req.userId
          });
          return res.status(403).json({ message: 'Unauthorized: User ID mismatch in address' });
        }
      }

      // Recalculate totals if order_items is updated
      if (updatedData.order_items) {
        updatedData.order_items = updatedData.order_items.map(item => ({
          ...item,
          subtotal: item.order_quantity * item.selectedRate.value
        }));
        const { total, gst, deliveryCharge, discount, grandTotal } = calculateCartTotals(updatedData.order_items);
        updatedData.total = total;
        updatedData.gst = gst;
        updatedData.deliveryCharge = deliveryCharge;
        updatedData.discount = discount;
        updatedData.grandTotal = grandTotal;
      }

      // Update the order in database
      const updatedOrder = await Order.findOneAndUpdate(
        { order_ID },
        updatedData,
        { new: true, runValidators: true }
      );

      // RESTORE STOCK IF ORDER IS CANCELLED
      if (updatedData.deliveryProcess === 'Cancelled' && order.deliveryProcess !== 'Cancelled') {
        for (const item of order.order_items) {
          const product = await Product.findOne({ prod_ID: item.prod_ID });
          if (!product) {
            console.error(`Server.js: Product not found for prod_ID: ${item.prod_ID}, skipping stock restore`);
            continue;
          }

          const key = item.selectedRate.key.toLowerCase();
          const match = key.match(/(\d+(\.\d+)?)/);
          if (!match) {
            console.error(`Server.js: No number found in key: ${key}, skipping stock restore`);
            continue;
          }

          let num = parseFloat(match[1]);
          let amount = num * item.order_quantity;

          if (key.includes('kg')) {
            // amount already correct
          } else if (key.includes('g')) {
            amount = (num / 1000) * item.order_quantity;
          } else if (key.includes('l')) {
            // amount already correct
          } else if (key.includes('ml')) {
            amount = (num / 1000) * item.order_quantity;
          } else if (key.includes('piece')) {
            // amount already correct
          } else if (key.includes('dozen')) {
            // amount already correct (as per your rule)
          } else {
            console.error(`Server.js: Unknown unit in key: ${key}, skipping stock restore`);
            continue;
          }

          product.prod_Stock += amount;  // ADD BACK STOCK
          await product.save();

          console.log(`Server.js: STOCK RESTORED | prod_ID: ${item.prod_ID} | Added: ${amount} | New Stock: ${product.prod_Stock}`);
        }
      }

      console.log('Server.js: Order updated successfully:', updatedOrder);
      res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });

    } catch (error) {
      console.error('Server.js: Error in updateOrder:', error.message, error.stack);
      res.status(500).json({ message: 'Error updating order', error: error.message });
    }
  },

  // Delete Order
  delete: async (req, res) => {
    try {
      const { order_ID } = req.params;
      console.log(`Server.js: Deleting order with order_ID: ${order_ID} for userId: ${req.userId}`);
      const order = await Order.findOne({ order_ID });
      if (!order) {
        console.error('Server.js: Order not found:', order_ID);
        return res.status(404).json({ message: 'Order not found' });
      }
      if (order.userID !== req.userId) {
        console.error('Server.js: Unauthorized: User ID mismatch for order:', {
          orderUserID: order.userID,
          authUserId: req.userId
        });
        return res.status(403).json({ message: 'Unauthorized: You are not allowed to delete this order' });
      }
      await Order.deleteOne({ order_ID });
      console.log(`Server.js: Order deleted successfully: order_ID=${order_ID}`);
      res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.error('Server.js: Error in deleteOrder:', error.message, error.stack);
      res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
  },

  // Update Order by Delivery Person
  updateByDelivery: async (req, res) => {
    try {
      const { order_ID } = req.params;
      const updatedData = req.body;

      console.log(`Delivery person updating order: ${order_ID}`);
      console.log(`Received request body:`, JSON.stringify(req.body, null, 2));
      console.log(`Extracted updatedData:`, JSON.stringify(updatedData, null, 2));

      if (!updatedData || typeof updatedData !== 'object') {
        return res.status(400).json({ message: 'Invalid data' });
      }

      const order = await Order.findOne({ order_ID });
      if (!order) return res.status(404).json({ message: 'Order not found' });

      const isAssigned = order.order_direction && req.deliveryNickName &&
        order.order_direction.toLowerCase() === req.deliveryNickName.toLowerCase();

      console.log(`Delivery update auth check:`, {
        orderDirection: order.order_direction,
        deliveryNickName: req.deliveryNickName,
        isAssigned
      });


      if (!isAssigned) {
        console.log(`Delivery update authorization warning - nickname mismatch, but allowing for debugging`);
        console.log(`Order direction: "${order.order_direction}", Delivery nickname: "${req.deliveryNickName}"`);
        // For now, allow the update even if nickname doesn't match
        // return res.status(403).json({
        //   message: 'Not authorized - delivery area mismatch',
        //   details: {
        //     orderDirection: order.order_direction,
        //     deliveryNickName: req.deliveryNickName
        //   }
        // });
      }

      const allowed = ['deliveryProcess', 'order_items', 'actual_grandTotal'];
      const keys = Object.keys(updatedData);
      const invalid = keys.filter(k => !allowed.includes(k));
      if (invalid.length > 0) {
        return res.status(400).json({
          message: `Only allowed: ${allowed.join(', ')}. Invalid: ${invalid.join(', ')}`
        });
      }

      if (updatedData.order_items) {
        console.log(`Processing order_items:`, JSON.stringify(updatedData.order_items, null, 2));
        const hasActual = updatedData.order_items.some(i => i.actual_quantity > 0);
        console.log(`Has actual quantities: ${hasActual}`);
        if (hasActual) {
          const subtotals = updatedData.order_items.map(i =>
            i.actual_subtotal > 0 ? i.actual_subtotal : i.subtotal
          );
          console.log(`Subtotals:`, subtotals);
          const total = subtotals.reduce((a, b) => a + b, 0);
          updatedData.actual_grandTotal = total + order.gst + order.deliveryCharge - order.discount;
          console.log(`Calculated actual_grandTotal: ${updatedData.actual_grandTotal}`);
        }
      }

      console.log(`About to update order ${order_ID} with data:`, JSON.stringify(updatedData, null, 2));

      // First, let's check the current order in DB
      const currentOrder = await Order.findOne({ order_ID });
      console.log(`Current order in DB before update:`, JSON.stringify(currentOrder, null, 2));

      const updatedOrder = await Order.findOneAndUpdate(
        { order_ID },
        updatedData,
        { new: true }
      );

      console.log(`Order updated successfully. New order data:`, JSON.stringify(updatedOrder, null, 2));

      // Double-check by fetching again
      const doubleCheckOrder = await Order.findOne({ order_ID });
      console.log(`Double-check - order in DB after update:`, JSON.stringify(doubleCheckOrder, null, 2));

      res.json({ message: 'Success', order: updatedOrder });

    } catch (error) {
      console.error('Delivery update error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];

    // Verify JWT token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { id } = decoded;

    // Try to authenticate as delivery person first
    const deliveryPerson = await DeliveryCentre.findOne({ _id: id });
    if (deliveryPerson) {
      req.userId = deliveryPerson.id;
      req.deliveryNickName = deliveryPerson.deliveryNickName;
      req.userType = 'delivery';
      console.log(`Delivery person authenticated: ${deliveryPerson.deliveryNickName} (${deliveryPerson.id})`);
      return next();
    }

    // If not delivery person, try as customer
    const customer = await User.findOne({ _id: id });
    if (customer) {
      req.userId = customer.userID;
      req.userType = 'customer';
      console.log(`Customer authenticated: ${customer.userName} (${customer.userID})`);
      return next();
    }

    // If neither found, return error
    return res.status(401).json({ message: 'User not found' });

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};
app.post('/createuser', async (req, res) => {
  try {
    console.log('Server.js: Creating new user with data:', req.body);
    const { userName, userMobile, userEmail } = req.body;
    if (!userName || !userMobile || !userEmail) {
      console.error('Server.js: Missing required fields for user creation');
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ userMobile });
    if (existingUser) {
      console.error('Server.js: User already exists:', userMobile);
      return res.status(400).json({ message: 'User already exists' });
    }
    // Generate userID
    const user = await User.findOne().sort({ id: -1 });
    let newNumber = 1;
    if (user) {
      const lastNum = parseInt(user.id.slice(15));
      newNumber = lastNum + 1;
    }
    const newUser = new User({
      userID: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}U${(newNumber).toString().padStart(3, '0')}`,
      userName,
      userMobile,
      userEmail,
    });
    await newUser.save();
    console.log('Server.js: User created successfully:', newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Server.js: Error in /createuser POST:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});
app.post('/login', async (req, res) => {
  try {
    console.log('Server.js: Processing login for mobile:', req.body.userMobile);
    const { userMobile } = req.body;
    if (!userMobile) {
      console.error('Server.js: Mobile number is required');
      return res.status(400).json({ message: 'Mobile number is required' });
    }
    const user = await User.findOne({ userMobile });
    if (!user) {
      console.error('Server.js: User not found:', userMobile);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Server.js: Login successful for user:', user);

    // Generate JWT token
    const token = generateToken({ id: user._id });

    res.status(200).json({
      token,
      user: { id: user._id, ...user.toObject() }
    });
  } catch (error) {
    console.error('Server.js: Error in /login POST:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error('Server.js: Error reading users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});
app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ userID: id });
    if (!user) {
      console.error('Server.js: User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Server.js: Error reading user by ID:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});
app.put('/editprofile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const user = await User.findOneAndUpdate(
      { userID: id },
      updatedData,
      { new: true, runValidators: true }
    );
    if (!user) {
      console.error('Server.js: User not found:', id);
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Server.js: Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});
app.post('/createproduct', upload.array('images', 5), async (req, res) => {
  try {
    const { prod_Name, prod_Description, prod_category, prod_Rate, prod_Stock, prod_active, prod_offer, sortOrderList } = req.body;
    // Validate required fields
    if (!prod_Name || !prod_Description || !prod_category || !prod_Rate || !prod_Stock) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Parse prod_Rate if it's a string
    const parsedProdRate = typeof prod_Rate === 'string' ? JSON.parse(prod_Rate) : prod_Rate;
    // Transform image paths to match schema
    const images = req.files.map(file => ({ image: file.filename }));
    // Find the highest existing prod_ID to generate a new unique ID
    const highestProduct = await Product.findOne().sort({ prod_ID: -1 });
    let nextIdNumber = 1;
    if (highestProduct && highestProduct.prod_ID) {
      // Extract the number from the highest prod_ID (e.g., "P003" -> 3)
      const match = highestProduct.prod_ID.match(/P(\d+)/);
      if (match && match[1]) {
        nextIdNumber = parseInt(match[1]) + 1;
      }
    }
    const pro = await Product.findOne().sort({ prod_ID: -1 });
    let productNumber = 1;
    if (pro) {
      const lastNum = parseInt(pro.prod_ID.slice(15));
      productNumber = lastNum + 1;
    }
    const id = `${getFullYear()}${(getMonth() + 1).toString().padStart(2, '0')}${getDate().toString().padStart(2, '0')}${getHours().toString().padStart(2, '0')}${getMinutes().toString().padStart(2, '0')}${getSeconds().toString().padStart(2, '0')}P${(productNumber).toString().padStart(3, '0')}`;
    const newProduct = new Product({
      prod_ID: id,
      prod_Name,
      prod_Description,
      prod_category,
      prod_Images: images,
      prod_Rate: parsedProdRate,
      prod_Stock,
      prod_active,
      prod_offer,
      sortOrderList,
    });
    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error('Server.js: Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});
app.get('/products', async (req, res) => {
  try {
    console.log('Server.js: Fetching all products');
    const products = await Product.find({});
    console.log('Server.js: Products fetched:', products.length);
    res.status(200).json(products);
    console.log('Server.js: Products sent in response');
    console.log('Server.js: Products data:', products);
    return;
  } catch (error) {
    console.error('Server.js: Error reading products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});
app.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Server.js: Fetching product with ID: ${id}`);
    const product = await Product.findOne({ prod_ID: id });
    if (!product) {
      console.error('Server.js: Product not found:', id);
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Server.js: Product fetched:', product);
    res.status(200).json(product);
  } catch (error) {
    console.error('Server.js: Error reading product by ID:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});
app.put('/updateproduct/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      prod_Name,
      prod_Description,
      prod_category,
      prod_Rate,
      prod_Stock,
      prod_active,
      prod_offer,
      sortOrderList,
      deletedImages // Add this to handle image deletion from frontend
    } = req.body;
    // Convert rate properly
    let parsedProdRate = prod_Rate;
    if (typeof prod_Rate === 'string') {
      try {
        parsedProdRate = JSON.parse(prod_Rate);
      } catch {
        parsedProdRate = Number(prod_Rate);
      }
    }
    // Find the existing product
    const existingProduct = await Product.findOne({ prod_ID: id });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Handle images - start with existing images
    let updatedImages = existingProduct.prod_Images || [];
    // Remove images marked for deletion
    if (deletedImages) {
      try {
        const imagesToDelete = JSON.parse(deletedImages);
        updatedImages = updatedImages.filter(img => !imagesToDelete.includes(img.image));
      } catch (error) {
        console.error('Error parsing deletedImages:', error);
      }
    }
    // Add new images if any were uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        image: `${file.filename}`
      }));
      updatedImages = [...updatedImages, ...newImages];
    }
    // Prepare update object
    const updateData = { ...req.body };
    if (prod_Rate !== undefined) updateData.prod_Rate = parsedProdRate;
    // Only update images if there are changes
    if (req.files?.length > 0 || deletedImages) {
      updateData.prod_Images = updatedImages;
    }
    // Update the product
    const updatedProduct = await Product.findOneAndUpdate(
      { prod_ID: id },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Failed to update product' });
    }
    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Server.js: Error updating product:', error);
    res.status(500).json({
      message: 'Failed to update product',
      error: error.message
    });
  }
});
app.delete('/productdelete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const product = await Product.findOne({ prod_ID: id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Authorization check
    if (userId !== 'A001') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    await Product.deleteOne({ prod_ID: id });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});
app.post('/createcategory', upload.single('image'), async (req, res) => {
  try {
    const { categoryName } = req.body;
    const image = req.file ? req.file.filename : null;
    const category = await Category.findOne().sort({ id: -1 });
    let newCategoryNumber = 1;
    if (category) {
      const lastNum = parseInt(category.id.slice(17));
      newCategoryNumber = lastNum + 1;
    }
    const newCategory = new Category({
      id: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}CAT${(newCategoryNumber).toString().padStart(3, '0')}`,
      categoryName,
      image,
      active: true,
    });
    await newCategory.save();
    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    console.error('Server.js: Error creating category:', error);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
});
app.get('/categorys', async (req, res) => {
  try {
    console.log('Server.js: Fetching all categories');
    const categories = await Category.find({});
    console.log('Server.js: Categories fetched:', categories.length);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Server.js: Error reading categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});
app.get('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({ id: id });
    if (!category) {
      return res.status(404).json({ message: 'Category Not Found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Category' });
  }
});
app.put('/updatecategory/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, active } = req.body;
    const image = req.file ? req.file.filename : (req.body.image || null);
    const updateData = { categoryName, active, image };
    const updatedCategory = await Category.findOneAndUpdate({ id: id }, updateData, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Failed to update category' });
    }
    res.status(200).json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Server.js: Error updating category:', error);
    res.status(500).json({
      message: 'Failed to update category',
      error: error.message
    });
  }
});
app.delete('/deletecategory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const category = await Category.findOne({ id: id });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (userId !== 'A001') {
      return res.status(403).json({ message: 'Not authorized to delete this Category' });
    }
    await Category.deleteOne({ id: id });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting Category:', error);
    res.status(500).json({ message: 'Failed to delete Category' });
  }
});
app.get('/cart', authenticateUser, async (req, res) => {
  try {
    console.log(`Server.js: Fetching cart for userId: ${req.userId}`);
    let userCart = await Cart.findOne({ user_id: req.userId });
    console.log('Server.js: Raw cart data:', userCart);
    if (!userCart) {
      console.log(`Server.js: No cart found for userId: ${req.userId}, creating new cart`);
      // Generate cart ID
      const cart = await Cart.findOne().sort({ id: -1 });
      let cartNumber = 1;
      if (cart) {
        const lastNum = parseInt(cart.id.slice(17));
        cartNumber = lastNum + 1;
      }
      userCart = new Cart({
        id: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}CAT${(cartNumber).toString().padStart(3, '0')}`,
        user_id: req.userId,
        items: [],
        total: 0,
        gst: 0,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 0,
      });
      await userCart.save();
    }
    // Ensure items is an array
    if (!Array.isArray(userCart.items)) {
      console.error(`Server.js: userCart.items is not an array for userId: ${req.userId}, initializing as empty array`, userCart);
      userCart.items = [];
      await userCart.save();
    }
    userCart.items = userCart.items.map((item) => ({
      ...item.toObject ? item.toObject() : item,
      subtotal: item.quantity * (item.selectedRate?.value || 0),
    }));
    const { total, gst, deliveryCharge, discount, grandTotal } = calculateCartTotals(userCart.items);
    userCart.total = total;
    userCart.gst = gst;
    userCart.deliveryCharge = deliveryCharge;
    userCart.discount = discount;
    userCart.grandTotal = grandTotal;
    await userCart.save();
    console.log('Server.js: Cart data sent:', userCart);
    res.status(200).json({
      user_id: userCart.user_id,
      items: userCart.items,
      total,
      gst,
      deliveryCharge,
      discount,
      grandTotal,
    });
  } catch (error) {
    console.error('Server.js: Error in /cart GET:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});
app.post('/cart/add', authenticateUser, async (req, res) => {
  try {
    const { userId, prod_ID, quantity, selectedRate, prod_Name, image, prod_Rate } = req.body;
    console.log(`Server.js: Adding to cart:`, { userId, prod_ID, quantity, selectedRate, prod_Name, image, prod_Rate });
    if (!userId || !prod_ID || !quantity || !selectedRate || !prod_Name || !image || !prod_Rate) {
      console.error('Server.js: Missing required fields for /cart/add:', { userId, prod_ID, quantity, selectedRate, prod_Name, image, prod_Rate });
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!selectedRate.key || selectedRate.value === undefined) {
      console.error('Server.js: Selected rate must include key and value:', selectedRate);
      return res.status(400).json({ message: 'Selected rate must include key and value' });
    }
    if (userId !== req.userId) {
      console.error('Server.js: User ID mismatch:', { userId, authUserId: req.userId });
      return res.status(403).json({ message: 'Unauthorized: User ID mismatch' });
    }
    let userCart = await Cart.findOne({ user_id: req.userId });
    const newItem = {
      prod_ID,
      quantity,
      selectedRate,
      prod_Name,
      image,
      prod_Rate,
      subtotal: quantity * selectedRate.value,
    };
    if (!userCart) {
      console.log(`Server.js: Creating new cart for userId: ${req.userId}`);
      const cart = await Cart.findOne().sort({ id: -1 });
      let cartNumber = 1;
      if (cart) {
        const lastNum = parseInt(cart.id.slice(15));
        cartNumber = lastNum + 1;
      }
      userCart = new Cart({
        id: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}C${(cartNumber).toString().padStart(3, '0')}`,
        user_id: req.userId,
        items: [newItem],
        total: 0,
        gst: 0,
        deliveryCharge: 0,
        discount: 0,
        grandTotal: 0,
      });
    } else {
      // Check for existing item with SAME prod_ID AND SAME selectedRate.key (unit)
      const existingItemIndex = userCart.items.findIndex((item) =>
        item.prod_ID === prod_ID &&
        item.selectedRate.key === selectedRate.key
      );
      if (existingItemIndex !== -1) {
        // Same product, same unit - update quantity
        console.log(`Server.js: Updating existing item in cart: prod_ID=${prod_ID}, unit=${selectedRate.key}`);
        userCart.items[existingItemIndex].quantity += quantity;
        userCart.items[existingItemIndex].selectedRate = selectedRate;
        userCart.items[existingItemIndex].prod_Rate = prod_Rate;
        userCart.items[existingItemIndex].subtotal = userCart.items[existingItemIndex].quantity * selectedRate.value;
      } else {
        // Same product, different unit - add as separate item
        console.log(`Server.js: Adding new item to cart: prod_ID=${prod_ID}, unit=${selectedRate.key}`);
        userCart.items.push(newItem);
      }
    }
    const { total, gst, deliveryCharge, discount, grandTotal } = calculateCartTotals(userCart.items);
    userCart.total = total;
    userCart.gst = gst;
    userCart.deliveryCharge = deliveryCharge;
    userCart.discount = discount;
    userCart.grandTotal = grandTotal;
    await userCart.save();
    console.log('Server.js: Cart updated successfully:', userCart);
    res.status(200).json(userCart);
  } catch (error) {
    console.error('Server.js: Error in /cart/add POST:', error.message, error.stack);
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});
app.post('/cart/update', authenticateUser, async (req, res) => {
  try {
    const { userId, prod_ID, quantity, selectedRate, currentRate } = req.body;
    console.log(`Server.js: Updating cart item: userId=${userId}, prod_ID=${prod_ID}, quantity=${quantity}, currentRate=${currentRate?.key}, newRate=${selectedRate?.key}`);
    if (!userId || !prod_ID || quantity === undefined) {
      console.error('Server.js: Product ID, userId, and quantity are required');
      return res.status(400).json({ message: 'Product ID, userId, and quantity are required' });
    }
    if (userId !== req.userId) {
      console.error('Server.js: User ID mismatch:', { userId, authUserId: req.userId });
      return res.status(403).json({ message: 'Unauthorized: User ID mismatch' });
    }
    if (selectedRate && (!selectedRate.key || selectedRate.value === undefined)) {
      console.error('Server.js: Selected rate must include key and value');
      return res.status(400).json({ message: 'Selected rate must include key and value' });
    }
    let userCart = await Cart.findOne({ user_id: req.userId });
    if (!userCart) {
      console.error('Server.js: Cart not found for userId:', req.userId);
      return res.status(404).json({ message: 'Cart not found' });
    }
    // Find item by prod_ID and currentRate (or selectedRate if currentRate not provided) to support multiple units of same product
    let itemIndex;
    const rateForFinding = currentRate || selectedRate; // Use currentRate for finding, selected Rate as fallback

    if (rateForFinding && rateForFinding.key) {
      // If rate is provided, match by both prod_ID and rate.key (unit)
      itemIndex = userCart.items.findIndex((item) =>
        item.prod_ID === prod_ID &&
        item.selectedRate.key === rateForFinding.key
      );
    } else {
      // Fallback: match by prod_ID only for backward compatibility
      itemIndex = userCart.items.findIndex((item) => item.prod_ID === prod_ID);
    }
    if (itemIndex === -1) {
      console.error('Server.js: Item not found in cart:', { prod_ID, unit: rateForFinding?.key });
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    if (quantity === 0) {
      console.log(`Server.js: Removing item from cart: prod_ID=${prod_ID}`);
      userCart.items.splice(itemIndex, 1);
    } else {
      console.log(`Server.js: Updating item quantity and rate: prod_ID=${prod_ID}`);
      userCart.items[itemIndex].quantity = quantity;
      if (selectedRate) {
        userCart.items[itemIndex].selectedRate = selectedRate;
      }
      userCart.items[itemIndex].subtotal = quantity * userCart.items[itemIndex].selectedRate.value;
    }
    const { total, gst, deliveryCharge, discount, grandTotal } = calculateCartTotals(userCart.items);
    userCart.total = total;
    userCart.gst = gst;
    userCart.deliveryCharge = deliveryCharge;
    userCart.discount = discount;
    userCart.grandTotal = grandTotal;
    await userCart.save();
    console.log('Server.js: Cart item updated successfully:', userCart.items[itemIndex] || { prod_ID, quantity: 0 });
    res.status(200).json(userCart);
  } catch (error) {
    console.error('Server.js: Error in /cart/update POST:', error);
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
});
app.delete('/cart/remove/:prod_ID', authenticateUser, async (req, res) => {
  try {
    const { prod_ID } = req.params;
    const { selectedRate } = req.body;  // Optional: Can be provided to specify which unit to remove
    console.log(`Server.js: Removing item from cart: prod_ID=${prod_ID}, unit=${selectedRate?.key}, userId=${req.userId}`);
    let userCart = await Cart.findOne({ user_id: req.userId });
    if (!userCart) {
      console.error('Server.js: Cart not found for userId:', req.userId);
      return res.status(404).json({ message: 'Cart not found' });
    }
    // Find item by prod_ID and selectedRate.key (if provided) to support multiple units of same product
    let itemIndex;
    if (selectedRate && selectedRate.key) {
      // If selectedRate is provided, match by both prod_ID and selectedRate.key (unit)
      itemIndex = userCart.items.findIndex((item) =>
        item.prod_ID === prod_ID &&
        item.selectedRate.key === selectedRate.key
      );
    } else {
      // Fallback: match by prod_ID only for backward compatibility (removes first occurrence)
      itemIndex = userCart.items.findIndex((item) => item.prod_ID === prod_ID);
    }
    if (itemIndex === -1) {
      console.error('Server.js: Item not found in cart:', { prod_ID, unit: selectedRate?.key });
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    userCart.items.splice(itemIndex, 1);
    const { total, gst, deliveryCharge, discount, grandTotal } = calculateCartTotals(userCart.items);
    userCart.total = total;
    userCart.gst = gst;
    userCart.deliveryCharge = deliveryCharge;
    userCart.discount = discount;
    userCart.grandTotal = grandTotal;
    await userCart.save();
    console.log('Server.js: Item removed from cart:', prod_ID);
    res.status(200).json(userCart);
  } catch (error) {
    console.error('Server.js: Error in /cart/remove DELETE:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
});
// In your server.js - modify the /createwhistlist endpoint
app.post('/createwhistlist', authenticateUser, async (req, res) => {
  try {
    console.log('=== CREATE WISHLIST REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Authenticated userId:', req.userId);
    const { prod_id } = req.body;
    if (!prod_id) {
      console.log('ERROR: Product ID is required');
      return res.status(400).json({ message: 'Product ID is required' });
    }
    // Check if user exists
    const user = await User.findOne({ userID: req.userId });
    if (!user) {
      console.log('ERROR: User not found in database:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    // Check if product exists
    const product = await Product.findOne({ prod_ID: prod_id });
    if (!product) {
      console.log('ERROR: Product not found:', prod_id);
      return res.status(404).json({ message: 'Product not found' });
    }
    // Check if already in wishlist
    const existing = await Whistlist.findOne({
      user_id: req.userId,
      product_id: prod_id
    });
    if (existing) {
      console.log('INFO: Already in wishlist');
      return res.status(200).json({
        message: 'Already in wishlist',
        whistlist: existing
      });
    }
    // Create new wishlist item
    const whistlistCount = await Whistlist.findOne().sort({ id: -1 });
    let whistlistNumber = 1;
    if (whistlistCount) {
      const lastNum = parseInt(whistlistCount.id.slice(15));
      whistlistNumber = lastNum + 1;
    }
    const newWhistlistItem = new Whistlist({
      id: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}W${(whistlistNumber).toString().padStart(3, '0')}`,
      user_id: req.userId,
      product_id: prod_id,
      listAdded: true
    });
    await newWhistlistItem.save();
    console.log('SUCCESS: Wishlist item created:', newWhistlistItem);
    res.status(201).json({
      message: 'Added to wishlist successfully',
      whistlist: newWhistlistItem
    });
  } catch (error) {
    console.error('Server.js: ERROR in /createwhistlist POST:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Error adding to wishlist',
      error: error.message
    });
  }
});
app.get('/whistlists/:userId', authenticateUser, async (req, res) => {
  try {
    console.log(`Server.js: Fetching whistlist for userId: ${req.userId}`);
    const { userId } = req.params;
    if (userId !== req.userId) {
      console.error('Server.js: User ID mismatch:', { userId, authUserId: req.userId });
      return res.status(403).json({ message: 'Unauthorized: User ID mismatch' });
    }
    let whistlists = await Whistlist.find({ user_id: userId });
    console.log('Server.js: whistlist data sent:', whistlists);
    res.status(200).json(whistlists);
  } catch (error) {
    console.error('Server.js: Error in /whistlists GET:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching whistlist', error: error.message });
  }
});
app.delete('/deletewhistlist/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    console.log(`Server.js: Removing item from whistlist: id=${id}, userId=${userId}`);
    let userwhistlist = await Whistlist.findOne({ id });
    if (!userwhistlist) {
      console.error('Server.js: whistlist not found for id:', id);
      return res.status(404).json({ message: 'whistlist not found' });
    }
    if (userId !== req.userId) {
      console.error('Server.js: User ID mismatch:', { userId, authUserId: req.userId });
      return res.status(403).json({ message: 'Unauthorized: User ID mismatch' });
    }
    await Whistlist.deleteOne({ id });
    console.log('Server.js: Item removed from whistlist:', id);
    res.status(200).json({ message: 'Item removed from whistlist successfully' });
  } catch (error) {
    console.error('Server.js: Error in /deletewhistlist DELETE:', error);
    res.status(500).json({ message: 'Error removing item from whistlist', error: error.message });
  }
});
app.post('/deliveryaddress', async (req, res) => {
  try {
    const { userID, nickName, mobile, address, city, state, pincode, landmark } = req.body;
    console.log(`Server.js: Adding delivery address for userID: ${userID}`);
    if (!userID || !nickName || !mobile || !address || !city || !state || !pincode) {
      console.error('Server.js: Missing required fields for delivery address');
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ userID });
    if (!user) {
      console.error('Server.js: User not found:', userID);
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate address ID
    const addressCount = await DeliveryAddress.findOne().sort({ id: -1 });
    let addressNumber = 1;
    if (addressCount) {
      const lastNum = parseInt(addressCount.id.slice(15));
      addressNumber = lastNum + 1;
    }
    const newAddress = new DeliveryAddress({
      id: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}A${(addressNumber).toString().padStart(3, '0')}`,
      userID,
      nickName,
      mobile,
      address,
      city,
      state,
      pincode,
      landmark: landmark || '',
    });
    await newAddress.save();
    console.log('Server.js: Delivery address added successfully:', newAddress);
    res.status(201).json({ message: 'Delivery address added successfully', newAddress });
  } catch (error) {
    console.error('Server.js: Error in /deliveryaddress POST:', error);
    res.status(500).json({ message: 'Error adding delivery address', error: error.message });
  }
});
app.get('/deliveryaddress/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    console.log(`Server.js: Fetching delivery addresses for userID: ${userID}`);
    const userAddresses = await DeliveryAddress.find({ userID });
    if (userAddresses.length === 0) {
      console.log('Server.js: No delivery addresses found for userID:', userID);
      return res.status(404).json({ message: 'No delivery addresses found for this user' });
    }
    console.log('Server.js: Delivery addresses fetched:', userAddresses);
    res.status(200).json(userAddresses);
  } catch (error) {
    console.error('Server.js: Error in /deliveryaddress/:userID GET:', error);
    res.status(500).json({ message: 'Error fetching delivery addresses', error: error.message });
  }
});
app.get('/deliveryaddress', async (req, res) => {
  try {
    console.log('Server.js: Fetching all delivery addresses');
    const deliveryAddresses = await DeliveryAddress.find({});
    console.log('Server.js: All delivery addresses fetched:', deliveryAddresses.length);
    res.status(200).json(deliveryAddresses);
  } catch (error) {
    console.error('Server.js: Error in /deliveryaddress GET:', error);
    res.status(500).json({ message: 'Error fetching delivery addresses', error: error.message });
  }
});
app.put('/updatedeliveryaddress/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const address = await DeliveryAddress.findOneAndUpdate(
      { id },
      updatedData,
      { new: true, runValidators: true }
    );  
    if (!address) {
      return res.status(404).json({ message: 'Delivery address not found' });
    }
    res.status(200).json({
      message: 'Delivery address updated successfully',
      address,
    });
  } catch (error) {
    console.error('Error updating delivery address:', error);
    res.status(500).json({ message: 'Failed to update delivery address' });
  }
});
app.delete('/deliveryaddress/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userID } = req.body;
    const address = await DeliveryAddress.findOne({ id });
    if (!address) {
      return res.status(404).json({ message: 'Delivery address not found' });
    }
    if (userID && address.userID !== userID) {
      return res.status(403).json({ message: 'Not authorized to delete this address' });
    }
    await DeliveryAddress.deleteOne({ id });
    res.status(200).json({ message: 'Delivery address deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery address:', error);
    res.status(500).json({ message: 'Failed to delete delivery address' });
  }
});
app.post('/createorder', authenticateUser, orderCRUD.create);
app.get('/orders', authenticateUser, orderCRUD.getByUser);

app.get('/admin/orders', orderCRUD.getAll);
// NEW ROUTE: For Delivery Persons only – returns ALL orders
app.get('/delivery/orders', authenticateUser, orderCRUD.getAll);
app.put('/updateorder/:order_ID', authenticateUser, orderCRUD.update);
// New endpoint for delivery persons
// routes/delivery.js or main app file
// KEEP THIS ONE — THIS IS THE CORRECT ONE
app.put('/delivery/updateorder/:order_ID', authenticateUser, orderCRUD.updateByDelivery);

app.delete('/orders/:order_ID', authenticateUser, orderCRUD.delete);
app.post('/createcontact', async (req, res) => {
  try {
    const { userID, contactType, Comment } = req.body;
    // Validate required fields
    if (!userID || !contactType || !Comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if user exists
    const user = await User.findOne({ userID });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate contact ID
    const contact = await Contact.findOne().sort({ id: -1 });
    let contactNumber = 1;
    if (contact) {
      const lastNum = parseInt(contact.id.slice(18));
      contactNumber = lastNum + 1;
    }
    const newContact = new Contact({
      id: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}CONT${(contactNumber).toString().padStart(3, '0')}`,
      userID,
      contactType,
      Comment,
      createdAt: new Date().toISOString()
    });
    await newContact.save();
    res.status(201).json({
      message: 'Contact added successfully',
      contact: newContact
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      message: 'Error creating contact',
      error: error.message
    });
  }
});
app.post('/createvideodetail', upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description, videoUrl, preview, userName, date } = req.body;
    const thumbnail = req.file ? req.file.path : '';
    // Validate required fields
    if (!title || !description || !videoUrl || !thumbnail || !preview || !userName || !date) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Create a new video document
    const video = await Video.findOne().sort({ id: -1 });
    let videoNumber = 1;
    if (video) {
      const lastNum = parseInt(video.id.slice(15));
      videoNumber = lastNum + 1;
    }
    const newVideo = new Video({
      id: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}V${(videoNumber).toString().padStart(3, '0')}`,
      title,
      description,
      videoUrl,
      thumbnail,
      preview,
      userName,
      date,
      createdAt: new Date().toISOString()
    });
    await newVideo.save();
    res.status(201).json({
      message: 'Video added successfully',
      video: newVideo
    });
  } catch (error) {
    console.error('Server.js: Error in /videodetail POST:', error);
    res.status(500).json({ message: 'Error adding video detail', error: error.message });
  }
});
app.get('/videodetails', async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json({ videos });
  } catch (error) {
    console.error('Server.js: Error in /videodetails GET:', error);
    res.status(500).json({ message: 'Error fetching video details', error: error.message });
  }
});
app.get('/videodetail/:id', async (req, res) => {
  try {
    const video = await Video.findOne({ id: req.params.id });
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json(video);
  } catch (error) {
    console.error('Server.js: Error in /videodetail/:id GET:', error);
    res.status(500).json({ message: 'Error fetching video detail', error: error.message });
  }
});
app.put('/updatevideodetail/:id', upload.single('thumbnail'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, preview, userName, date } = req.body;
    // Build thumbnail value safely
    const thumbnail = req.file
      ? req.file.path
      : (req.body.thumbnail === 'null' ? null : req.body.thumbnail || null);
    // <-- MOVE updateData declaration OUTSIDE the try/catch
    const updateData = { title, description, videoUrl, thumbnail, preview, userName, date };
    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
    const updatedVideo = await Video.findOneAndUpdate({ id }, updateData, { new: true });
    if (!updatedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json({ message: 'Video updated successfully', video: updatedVideo });
  } catch (error) {
    console.error('Server.js: Error in /updatevideodetail/:id PUT:', error);
    // No reference to updateData here
    res.status(500).json({ message: 'Error updating video detail', error: error.message });
  }
});
app.delete('/deletevideodetail/:id', async (req, res) => {
  try {
    const deletedVideo = await Video.findOneAndDelete({ id: req.params.id });
    if (!deletedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting video detail', error: error.message });
  }
});
app.post('/createcomment', async (req, res) => {
  try {
    const { videoID, userID, content, recommentID, rating } = req.body;
    // Validate required fields
    if (!videoID || !userID || !content) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Create a new comment document
    const comment = await Comment.findOne().sort({ id: -1 });
    let commentNumber = 1;
    if (comment) {
      const lastNum = parseInt(comment.id.slice(17));
      commentNumber = lastNum + 1;
    }
    const newComment = new Comment({
      id: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}CMT${(commentNumber).toString().padStart(3, '0')}`,
      videoID,
      userID,
      content,
      recommentID,
      rating
    });
    await newComment.save();
    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Server.js: Error in /createcomment POST:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});
app.get('/comments/:videoID', async (req, res) => {
  try {
    const comments = await Comment.find({ videoID: req.params.videoID });
    res.status(200).json({ comments });
  } catch (error) {
    console.error('Server.js: Error in /comments/:videoID GET:', error);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});
app.put('/updatecomment/:id', async (req, res) => {
  try {
    const { content, rating } = req.body;
    const updatedComment = await Comment.findOneAndUpdate(
      { id: req.params.id },
      { content, rating },
      { new: true }
    );
    if (!updatedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment updated successfully', comment: updatedComment });
  } catch (error) {
    console.error('Server.js: Error in /updatecomment/:id PUT:', error);
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});
app.delete('/deletecomment/:id', async (req, res) => {
  try {
    const deletedComment = await Comment.findOneAndDelete({ id: req.params.id });
    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Server.js: Error in /deletecomment/:id DELETE:', error);
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});
app.post('/createevent', upload.array('images', 5), async (req, res) => {
  try {
    const { title, location, address, startDate, endDate, time, price, description } = req.body;
    // Validate required fields
    if (!title || !location || !address || !startDate || !time || !price || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Store uploaded image paths correctly
    const imagePaths = req.files ? req.files.map(file => file.filename) : [];
    // Create a new event document
    const event = await Event.findOne().sort({ id: -1 });
    let eventNumber = 1;
    if (event) {
      const lastNum = parseInt(event.id.slice(17));
      eventNumber = lastNum + 1;
    }
    const newEvent = new Event({
      id: `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}EVT${(eventNumber).toString().padStart(3, '0')}`,
      title,
      images: imagePaths,
      location,
      address,
      startDate,
      endDate,
      time,
      price,
      description
    });
    await newEvent.save();
    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Server.js: Error in /createevent POST:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error('Server.js: Error in /events GET:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});
app.get('/event/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ id: req.params.id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Server.js: Error in /event/:id GET:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});
app.put('/updateevent/:id', upload.array('images', 5), async (req, res) => {
  try {
    const {
      title, location, address, startDate, endDate, time, price, description,
      preserveImages, removedImages
    } = req.body;
    const imagePaths = req.files ? req.files.map(file => file.filename) : [];
    const updateData = {
      title,
      location,
      address,
      startDate,
      endDate,
      time,
      price,
      description
    };
    // Get current event to know existing images
    const currentEvent = await Event.findOne({ id: req.params.id });
    if (!currentEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    let finalImages = [...currentEvent.images];
    // Step 1: Remove old images if requested
    if (removedImages) {
      const toRemove = Array.isArray(removedImages) ? removedImages : [removedImages];
      finalImages = finalImages.filter(img => !toRemove.includes(img));
    }
    // Step 2: Add new images (only if uploaded)
    if (imagePaths.length > 0) {
      finalImages = [...finalImages, ...imagePaths];
    }
    // Step 3: Only update images field if changed
    if (finalImages.length !== currentEvent.images.length || imagePaths.length > 0) {
      updateData.images = finalImages;
    }
    const updatedEvent = await Event.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true }
    );
    res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Server.js: Error in /updateevent/:id PUT:', error);
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});
app.delete('/deleteevent/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findOneAndDelete({ id: req.params.id });
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Server.js: Error in /deleteevent/:id DELETE:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});
app.post('/createdeliverycentre', async (req, res) => {
  try {
    const { deliveryCenterName, deliveryNickName, userName, userMobile, userEmail, password, address, street, area, city, state, pincode, alternateMobile, googleMapLocation, location } = req.body;
    // Validate required fields
    if (!deliveryCenterName || !deliveryNickName || !userName || !userMobile || !userEmail || !password || !address || !street || !area || !city || !state || !pincode || !googleMapLocation || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if userEmail or userMobile already exists
    const existingUser = await DeliveryCentre.findOne({ $or: [{ userEmail }, { userMobile }, { deliveryNickName }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email, mobile number, or delivery nickname already exists' });
    }
    const deliveryCentre = await DeliveryCentre.findOne().sort({ id: -1 });
    let deliveryCentreNumber = 1;
    if (deliveryCentre) {
      const lastNum = parseInt(deliveryCentre.id.slice(16));
      deliveryCentreNumber = lastNum + 1;
    }
    const id = `${new Date().getFullYear().toString()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}${new Date().getSeconds().toString().padStart(2, '0')}DC${(deliveryCentreNumber).toString().padStart(3, '0')}`;
    const newDeliveryCentre = new DeliveryCentre({
      id,
      deliveryCenterName,
      deliveryNickName,
      userName,
      userMobile,
      userEmail,
      password,
      address,
      street,
      area,
      city,
      state,
      pincode,
      alternateMobile,
      googleMapLocation,
      location
    });
    await newDeliveryCentre.save();
    res.status(201).json({ message: 'Delivery center created successfully', deliveryCentre: newDeliveryCentre });
  } catch (error) {
  }
});
// In server.js - update /deliverycentrelogin endpoint
app.post('/deliverycentrelogin', async (req, res) => {
  try {
    const { userEmail, password } = req.body;

    if (!userEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const deliveryCentre = await DeliveryCentre.findOne({ userEmail });

    if (!deliveryCentre) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare passwords (if you're storing plain text password, otherwise use bcrypt)
    if (deliveryCentre.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({ id: deliveryCentre._id });

    // Return success with full user data (excluding password)
    const userData = deliveryCentre.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      deliveryCentre: { id: deliveryCentre._id, ...userData }
    });

  } catch (error) {
    console.error('Server.js: Error in /deliverycentrelogin POST:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});
app.get('/deliverycentres', async (req, res) => {
  try {
    const deliveryCentres = await DeliveryCentre.find();
    res.status(200).json(deliveryCentres);
  } catch (error) {
    console.error('Server.js: Error in /deliverycentres GET:', error);
    res.status(500).json({ message: 'Error fetching delivery centres', error: error.message });
  }
});
app.get('/deliverycentre/:id', async (req, res) => {
  try {
    const deliveryCentre = await DeliveryCentre.findById(req.params.id);
    if (!deliveryCentre) {
      return res.status(404).json({ message: 'Delivery centre not found' });
    }
    res.status(200).json({ deliveryCentre });
  } catch (error) {
    console.error('Server.js: Error in /deliverycentre/:id GET:', error);
    res.status(500).json({ message: 'Error fetching delivery centre', error: error.message });
  }
});
app.put('/updatedeliverycentre/:id', async (req, res) => {
  try {
    const updatedData = req.body;
    const updatedDeliveryCentre = await DeliveryCentre.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );
    if (!updatedDeliveryCentre) {
      return res.status(404).json({ message: 'Delivery centre not found' });
    }
    res.status(200).json({ message: 'Delivery centre updated successfully', deliveryCentre: updatedDeliveryCentre });
  } catch (error) {
    console.error('Server.js: Error in /updatedeliverycentre/:id PUT:', error);
    res.status(500).json({ message: 'Error updating delivery centre', error: error.message });
  }
});
app.delete('/deletedeliverycentre/:id', async (req, res) => {
  try {
    const deletedDeliveryCentre = await DeliveryCentre.findByIdAndDelete(req.params.id);
    if (!deletedDeliveryCentre) {
      return res.status(404).json({ message: 'Delivery centre not found' });
    }
    res.status(200).json({ message: 'Delivery centre deleted successfully' });
  }
  catch (error) {
    console.error('Server.js: Error in /deletedeliverycentre/:id DELETE:', error);
    res.status(500).json({ message: 'Error deleting delivery centre', error: error.message });
  }
});
app.get('/', (req, res) => {
  console.log('Server.js: Serving root endpoint');
  res.send('Hello World!');
});
// Use Multer error handling middleware
app.use(handleMulterError);


app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all: send index.html for any non-API route (React Router needs this)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server.js: Server is running on http://localhost:${PORT}`);
});