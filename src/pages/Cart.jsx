import { useState } from "react";
import { useCart } from "../context/CartContext";
import OptimizedCart from "./OptimizedCart";

export default function Cart() {
  const { cartItems, updateQuantity } = useCart();
  const [showOptimized, setShowOptimized] = useState(false);

  if (showOptimized) {
    return <OptimizedCart onBack={() => setShowOptimized(false)} />;
  }

  return (
    <div className="p-4 pb-28 max-w-[420px] mx-auto">
      <h2 className="text-lg font-bold mb-4 text-center">My Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">Your cart is empty.</div>
      ) : (
        <div className="space-y-3">
          {cartItems.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-500">{item.quantityText}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.name, -1)}
                    className="w-8 h-8 border rounded-full"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.name, 1)}
                    className="w-8 h-8 border rounded-full text-green-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowOptimized(true)}
            className="bg-green-500 text-white py-3 rounded-xl w-full mt-4 font-semibold"
          >
            Optimize My Cart
          </button>
        </div>
      )}
    </div>
  );
}
