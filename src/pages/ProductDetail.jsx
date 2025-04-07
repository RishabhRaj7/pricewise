import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const dummyProducts = Array.from({ length: 10 }).map((_, index) => ({
  name: ["Bananas", "Maggi", "Apples", "Bread", "Eggs", "Milk", "Rice", "Tomatoes", "Onions", "Juice"][index],
  quantityText: ["7pcs", "4pcs", "6pcs", "1 pack", "12pcs", "1L", "1kg", "1kg", "1kg", "1L"][index],
  image: `https://placehold.co/200x200?text=Item+${index + 1}`,
  prices: [
    { brand: "blinkit", price: 50 + index, oldPrice: 60 + index, time: "12 Mins" },
    { brand: "zepto", price: 52 + index, oldPrice: 62 + index, time: "15 Mins" },
    { brand: "instamart", price: 55 + index, oldPrice: 65 + index, time: "18 Mins" },
    { brand: "jio", price: 58 + index, oldPrice: 68 + index, time: "35 Mins" },
  ],
}));

const brandIcons = {
  blinkit: "/logos/blinkit.png",
  zepto: "/logos/zepto.png",
  instamart: "/logos/instamart.png",
  jio: null,
};

const fullChartData = {
  day: [{ month: "Today", blinkit: 315, zepto: 310, instamart: 341, jio: 321 }],
  week: [
    { month: "Mon", blinkit: 310, zepto: 305, instamart: 320, jio: 300 },
    { month: "Tue", blinkit: 330, zepto: 315, instamart: 340, jio: 310 },
    { month: "Wed", blinkit: 325, zepto: 310, instamart: 335, jio: 320 },
    { month: "Thu", blinkit: 335, zepto: 320, instamart: 345, jio: 310 },
    { month: "Fri", blinkit: 320, zepto: 305, instamart: 330, jio: 295 },
    { month: "Sat", blinkit: 315, zepto: 310, instamart: 341, jio: 321 },
  ],
  month: [
    { month: "Week 1", blinkit: 305, zepto: 300, instamart: 310, jio: 305 },
    { month: "Week 2", blinkit: 320, zepto: 315, instamart: 325, jio: 310 },
    { month: "Week 3", blinkit: 315, zepto: 305, instamart: 330, jio: 315 },
    { month: "Week 4", blinkit: 318, zepto: 312, instamart: 333, jio: 318 },
  ],
  '3months': [
    { month: "Apr", blinkit: 310, zepto: 300, instamart: 320, jio: 300 },
    { month: "May", blinkit: 330, zepto: 320, instamart: 340, jio: 310 },
    { month: "Jun", blinkit: 325, zepto: 315, instamart: 335, jio: 320 },
  ],
  '6months': [
    { month: "Jan", blinkit: 310, zepto: 305, instamart: 320, jio: 300 },
    { month: "Feb", blinkit: 330, zepto: 315, instamart: 340, jio: 310 },
    { month: "Mar", blinkit: 325, zepto: 310, instamart: 335, jio: 320 },
    { month: "Apr", blinkit: 335, zepto: 320, instamart: 345, jio: 310 },
    { month: "May", blinkit: 320, zepto: 305, instamart: 330, jio: 295 },
    { month: "Jun", blinkit: 315, zepto: 310, instamart: 341, jio: 321 },
  ]
};

import { useNavigate } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  const [location, setLocation] = useState("Unknown Location");
  const { addToCart, cartItems, updateQuantity } = useCart();

  const product = dummyProducts.find((p) => p.name === id);
  const inCart = product ? cartItems.find((item) => item.name === product.name) : null;
  const navigate = useNavigate();
  const [duration, setDuration] = useState('6months');

  useEffect(() => {
    const savedAddress = localStorage.getItem("selectedAddress");
    setLocation(savedAddress || "Unknown Location");
  }, []);

  if (!product) {
    return <div className="p-6 text-center">Product not found</div>;
  }

  return (
    <div className="max-w-[420px] mx-auto p-4 pb-28">
      <button onClick={() => navigate(-1)} className="text-sm mb-2 text-gray-600">&larr; Back</button>
      <div className="text-center">
        <img src={product.image} alt={product.name} className="h-28 object-contain mx-auto mb-3" />
        <h2 className="font-semibold text-md">{product.name}</h2>
        <p className="text-xs text-gray-500">{product.quantityText}</p>
        {!inCart ? (
          <button
            onClick={() => addToCart({ ...product, quantity: 1 })}
            className="bg-green-500 text-white w-10 h-10 mt-2 rounded-full"
          >
            +
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => updateQuantity(product.name, -1)}
              className="w-8 h-8 border rounded-full text-lg"
            >
              −
            </button>
            <span>{inCart.quantity}</span>
            <button
              onClick={() => updateQuantity(product.name, 1)}
              className="w-8 h-8 border rounded-full text-lg text-green-600"
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="bg-white mt-6 p-3 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <span>🔔</span> Notify Me on Price Drop
          </div>
        </div>
        {['day','week','month','3months','6months'].map((key) => (
          <button
            key={key}
            className={`text-xs px-2 py-1 border rounded-full mr-1 mb-2 ${duration === key ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setDuration(key)}
          >
            {key === '3months' ? '3 Months' : key === '6months' ? '6 Months' : key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}

        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={fullChartData[duration]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="blinkit" stroke="#facc15" />
            <Line type="monotone" dataKey="zepto" stroke="#a855f7" />
            <Line type="monotone" dataKey="instamart" stroke="#f97316" />
            <Line type="monotone" dataKey="jio" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-2">
        {product.prices.map((p, i) => (
          <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm">
            <div>
              {brandIcons[p.brand] ? (
                <img src={brandIcons[p.brand]} alt={p.brand} className="w-24 object-contain" />
              ) : (
                <span className="font-medium">{p.brand}</span>
              )}
            </div>
            <div className="text-right">
              <div className="text-gray-400 line-through text-sm">₹{p.oldPrice}</div>
              <div className="font-semibold text-md">₹{p.price}</div>
              <div className="text-xs text-gray-500">{p.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
