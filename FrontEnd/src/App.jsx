import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Customer/Pages/Home';
import Login from './Customer/Components/Common Components/Login';
import SignUp from './Customer/Components/Common Components/SignUp';
import Product from './Customer/Pages/Product';
import DeliveryAddress from './Customer/Pages/DeliveryAddress';
import Contact from './Customer/Pages/Contact';
import Order from './Customer/Pages/Order';
import ProductDetail from './Customer/Pages/ProductDetail';
import Cart from './Customer/Pages/Cart';
import SearchPage from './Customer/Pages/SearchPage';
import History from './Customer/Pages/History';
import Footer from './Customer/Components/Common Components/Footer';
import Profile from './Customer/Pages/Profile';
import VideoCard from './Customer/Pages/VideoCard';
import VideoDetail from './Customer/Pages/VideoDetail';
import EventCard from './Customer/Pages/EventCard';
import EventDetail from './Customer/Pages/EventDetail';
import CreateProduct from './Admin/Pages/CreateProduct';
import CreateCategory from './Admin/Pages/CreateCategory';
import CreateEventDetail from './Admin/Pages/CreateEventDetail';
import CreateVideoDetail from './Admin/Pages/CreateVideoDetail';
import DeliverySignUp from './DeliveryCentre/Pages/DeliverySignUp';
import AdminHome from './Admin/Pages/AdminHome';
import DeliverySignIn from './DeliveryCentre/Pages/DeliverySignIn';
import DeliveryHome from './DeliveryCentre/Pages/DeliveryHome';
import AdminSignIn from './Admin/Pages/AdminSignIn';
import AdminProductDetail from './Admin/Pages/AdminProductDetail';
import AdminCategoryDetail from './Admin/Pages/AdminCategoryDetail';
import AdminEventDetail from './Admin/Pages/AdminEventDetail';
import AdminVideoPage from './Admin/Pages/AdminVideoDetail';
import AdminVideoDetail from './Admin/Pages/AdminVideoDetail';
import AdminEditProductPage from './Admin/Pages/AdminEditProductPage';
import AdminEditCategoryPage from './Admin/Pages/AdminEditCategoryPage';
import AdminEditEventPage from './Admin/Pages/AdminEditEventPage';
import AdminEditVideoPage from './Admin/Pages/AdminEditVideoPage';
import WhistList from './Customer/Pages/WhistList';
import AdminCustomerDetail from './Admin/Pages/AdminCustomerDetail';
import AdminDeliveryCentre from './Admin/Pages/AdminDeliveryCentre';
import AdminOrderDetail from './Admin/Pages/AdminOrderDetail';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/userlogin" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/products" element={<Product />} />
        <Route path="/whistlist" element={<WhistList />} />
        <Route path="/delivery-address" element={<DeliveryAddress />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/order" element={<Order />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path='/search' element={<SearchPage />} />
        <Route path='/history' element={<History />} />
        <Route path='/profile/:id' element={<Profile />} />
        <Route path='/video' element={<VideoCard />} />
        <Route path='/videofulldetail/:id' element={<VideoDetail />} />
        <Route path='/event' element={<EventCard />} />
        <Route path='/eventdetail/:id' element={<EventDetail />} />
        {/* Admin Routes */}
        <Route path='/adminuserlogin' element={<AdminSignIn />} />
        <Route path='/adminhome' element={<AdminHome />} />
        <Route path='/createproductdetail' element={<CreateProduct />} />
        <Route path='/createcategorydetail' element={<CreateCategory />} />
        <Route path='/createeventdetail' element={<CreateEventDetail />} />
        <Route path='/createvideo' element={<CreateVideoDetail />} />
        <Route path='/adminproductdetail' element={<AdminProductDetail />} />
        <Route path='/admincategorydetail' element={<AdminCategoryDetail />} />
        <Route path='/admineventdetail' element={<AdminEventDetail />} />
        <Route path='/adminvideodetail' element={<AdminVideoDetail />} />
        <Route path='/admincustomerdetail' element={<AdminCustomerDetail />} />
        <Route path='/admindeliverycentredetail' element={<AdminDeliveryCentre />} />
        <Route path='/adminorderdetail' element={<AdminOrderDetail />} />
        {/* Edit Routes */}
        <Route path='/admineditproduct/:id' element={<AdminEditProductPage />} />
        <Route path='/admineditcategory/:id' element={<AdminEditCategoryPage />} />
        <Route path='/admineditevent/:id' element={<AdminEditEventPage />} />
        <Route path='/admineditvideo/:id' element={<AdminEditVideoPage />} />
        {/* Delivery Routes */}
        <Route path='/deliverysignup' element={<DeliverySignUp />} />
        <Route path='/deliverysignin' element={<DeliverySignIn />} />
        <Route path='/deliveryhome' element={<DeliveryHome />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
