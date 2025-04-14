import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Calculate cart totals
  const subtotal = cartItems.reduce(
    (total, item) => total + item.prices[0].price * item.quantity,
    0
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-[420px] mx-auto p-4 pb-24 bg-[#fbfbfb] min-h-screen">
        <div className="sticky top-0 bg-[#fbfbfb] z-10 p-4 shadow-sm mb-4">
          <h2 className="text-lg font-semibold text-center">My Cart</h2>
        </div>
        
        <div className="text-center mt-16">
          <p className="text-gray-400 text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-green-500 text-white px-6 py-2 rounded-full"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const renderCartItem = (item, index) => {
    const prices = item.prices.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;
    console.log(item);
    return (
      <div key={index} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
        <img
          src={item.image}
          alt={item.name}
          className="h-20 w-20 object-contain rounded"
        />
        <div className="flex-1">
          <h4 className="text-sm font-semibold">{item.name}</h4>
          <p className="text-xs text-gray-500">{item.quantityText}</p>
          <p className="text-sm font-medium mt-1">{priceRange}</p>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={() => updateQuantity(item.name, -1)} className="w-8 h-8 border rounded-full text-lg">−</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.name, 1)} className="w-8 h-8 border rounded-full text-lg text-green-600">+</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[420px] mx-auto p-4 pb-24 bg-[#fbfbfb] min-h-screen">
      <div className="sticky top-0 bg-[#fbfbfb] z-10 p-4 shadow-sm -mx-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">My Cart</h2>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-sm text-red-500"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-[300px]">
            <p className="mb-4">Are you sure you want to clear your cart?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {cartItems.map(renderCartItem)}
      </div>
      {cartItems.length > 0 && (
        <button
          onClick={() => navigate("/optimized-cart")}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg"
        >
          Optimize My Cart
        </button>
      )}
    </div>
  );
}
