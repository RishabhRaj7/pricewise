import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

const brandDetails = {
  blinkit: {
    name: "Blinkit",
    icon: "/logos/blinkit.png",
    time: "12 Mins",
    color: "border-yellow-300"
  },
  zepto: {
    name: "Zepto",
    icon: "/logos/zepto.png",
    time: "15 Mins",
    color: "border-purple-400"
  },
  instamart: {
    name: "Swiggy Instamart",
    icon: "/logos/instamart.png",
    time: "18 Mins",
    color: "border-orange-400"
  },
  jio: {
    name: "JioMart",
    icon: null,
    time: "35 Mins",
    color: "border-red-300"
  }
};

export default function OptimizedCart({ onBack }) {
  const { cartItems } = useCart();
  const [optimizedData, setOptimizedData] = useState({});

  useEffect(() => {
    const platformCart = {};
    const DELIVERY_THRESHOLD = 200;
    const DELIVERY_FEE = 30;

    cartItems.forEach((item) => {
      const best = [...item.prices].sort((a, b) => a.price - b.price)[0];
      if (!platformCart[best.brand]) platformCart[best.brand] = [];
      platformCart[best.brand].push({
        ...item,
        ...best,
      });
    });

    const summary = {};
    Object.entries(platformCart).forEach(([brand, items]) => {
      const item_total = items.reduce((acc, i) => acc + i.oldPrice * i.quantity, 0);
      const discount = items.reduce((acc, i) => acc + (i.oldPrice - i.price) * i.quantity, 0);
      const delivery = item_total < DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
      const savings = discount;
      const estimated_total = item_total - discount + delivery;

      summary[brand] = { item_total, discount, delivery, savings, estimated_total };
    });

    setOptimizedData(summary);
  }, [cartItems]);

  const lowest = Object.entries(optimizedData).sort((a, b) => a[1].estimated_total - b[1].estimated_total)[0]?.[0];

  return (
    <div className="p-4 pb-28 max-w-[420px] mx-auto">
      <button onClick={onBack} className="text-sm mb-4 text-gray-600">&larr; Back to Cart</button>
      <h2 className="text-lg font-bold mb-4 text-center">My Cart</h2>
      {Object.entries(optimizedData).map(([brand, data], idx) => {
        const isBest = brand === lowest;
        const b = brandDetails[brand];
        return (
          <div key={idx} className={`rounded-xl border p-4 mb-4 ${b.color} relative`}>
            {isBest && (
              <span className="absolute -top-2 -left-2 bg-green-500 text-white px-2 py-1 text-xs rounded-md rotate-[-10deg] shadow-md">
                ✅ Optimized Cart
              </span>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {b.icon ? (
                  <img src={b.icon} alt={b.name} className="w-[90px] object-contain" />
                ) : (
                  <span className="font-medium">{b.name}</span>
                )}
                <div className="text-xs text-gray-500">⏱ {b.time}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="font-medium">₹ {data.item_total}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount Applied</span>
                <span className="font-medium text-green-600">₹ {data.discount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-medium">₹ {data.delivery}</span>
              </div>
              <div className="flex justify-between">
                <span>Additional Savings Available</span>
                <span className="font-medium text-green-600">₹ {data.savings}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Estimated Total</span>
                <span>₹ {data.estimated_total}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}