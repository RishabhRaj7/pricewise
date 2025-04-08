import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cartItems, updateQuantity } = useCart();
  const navigate = useNavigate();

  const renderCartItem = (item, index) => {
    const prices = item.prices.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`;

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
      <h2 className="text-lg font-semibold mb-4">Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">
          <p className="mb-4">🛒 Your cart is empty</p>
          <button
            onClick={() => navigate("/explore")}
            className="bg-green-500 text-white px-4 py-2 rounded-full"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map(renderCartItem)}
        </div>
      )}
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
