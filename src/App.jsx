import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import OTP from "./pages/OTP";
import Location from "./pages/Location";
import Onboarding from "./pages/Onboarding";
import { CartProvider, useCart } from "./context/CartContext";
import Account from './pages/Account';
import Explore from "./pages/Explore";
import OptimizedCart from "./pages/OptimizedCart";
import Favourites from "./pages/Favourites";

function DebugCart() {
  const { cartItems } = useCart();
  console.log("Cart items (from DebugCart):", cartItems);
  return null;  
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <DebugCart />
        <Routes>
        
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/otp" element={<OTP />} />
          <Route path="/location" element={<Location />} />
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/optimized-cart" element={<OptimizedCart />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/account" element={<Account />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}
