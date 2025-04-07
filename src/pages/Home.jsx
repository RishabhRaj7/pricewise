import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";

const brandIcons = {
  blinkit: `${import.meta.env.BASE_URL}logos/blinkit.png`,
  zepto: `${import.meta.env.BASE_URL}logos/zepto.png`,
  instamart: `${import.meta.env.BASE_URL}logos/instamart.png`,
  jio: null,
};

import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllPurchase, setShowAllPurchase] = useState(false);
  const [showAllGroceries, setShowAllGroceries] = useState(false);
  const { addToCart, cartItems, updateQuantity } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const savedAddress = localStorage.getItem("selectedAddress");
    setLocation(savedAddress || "Unknown Location");
  }, []);

  const allProducts = useMemo(() => {
    return [
      "Bananas", "Maggi", "Apples", "Bread", "Eggs", "Milk",
      "Rice", "Tomatoes", "Onions", "Juice", "Soap", "Shampoo", "Butter", "Paneer", "Cheese"
    ].map((name, index) => {
      const prices = [
        { brand: "blinkit", price: Math.floor(Math.random() * 50 + 20), oldPrice: Math.floor(Math.random() * 50 + 70), time: "⏱ 12 Mins" },
        { brand: "zepto", price: Math.floor(Math.random() * 50 + 20), oldPrice: Math.floor(Math.random() * 50 + 70), time: "⏱ 15 Mins" },
        { brand: "instamart", price: Math.floor(Math.random() * 50 + 20), oldPrice: Math.floor(Math.random() * 50 + 70), time: "⏱ 18 Mins" },
        { brand: "jio", price: Math.floor(Math.random() * 50 + 20), oldPrice: Math.floor(Math.random() * 50 + 70), time: "⏱ 35 Mins" },
      ];
      return {
        name,
        quantityText: "1 unit",
        image: `https://placehold.co/100x100?text=${encodeURIComponent(name)}`,
        prices
      };
    });
  }, []);

  const commonItems = allProducts.slice(0, 2); // Common items shared in both sections
  const purchaseSpecific = allProducts.slice(2, 8);
  const grocerySpecific = allProducts.slice(8, 14);

  const purchaseAgainAll = [...commonItems, ...purchaseSpecific];
  const groceryAll = [...commonItems, ...grocerySpecific];

  const filteredPurchase = purchaseAgainAll.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGrocery = groceryAll.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const purchaseAgainProducts = filteredPurchase.slice(0, showAllPurchase ? filteredPurchase.length : 2);
  const groceryProducts = filteredGrocery.slice(0, showAllGroceries ? filteredGrocery.length : 2);

  const renderCartControls = (product) => {
    const cartItem = cartItems.find((item) => item.name === product.name);
    return cartItem ? (
      <div className="flex items-center gap-2 mt-1">
        <button onClick={() => updateQuantity(product.name, -1)} className="w-8 h-8 border rounded-full text-lg">−</button>
        <span>{cartItem.quantity}</span>
        <button onClick={() => updateQuantity(product.name, 1)} className="w-8 h-8 border rounded-full text-lg text-green-600">+</button>
      </div>
    ) : (
      <button
        onClick={() =>
          addToCart({
            name: product.name,
            image: product.image,
            quantityText: product.quantityText,
            prices: product.prices,
          })
        }
        className="bg-green-500 text-white rounded-full w-8 h-8 mt-2 ml-auto block"
      >
        +
      </button>
    );
  };

  const renderPriceGrid = (product) => (
    <div className="mt-4 space-y-1 text-xs">
      {product.prices.map((p, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="capitalize font-medium">
            {brandIcons[p.brand] ? (
              <img src={brandIcons[p.brand]} alt={p.brand} className="w-[90px] object-contain" />
            ) : (
              p.brand
            )}
          </div>
          <div className="text-right">
            <div className="text-gray-400 line-through text-[11px]">₹{p.oldPrice}</div>
            <div className="font-semibold">₹{p.price}</div>
            <div className="text-[10px] text-gray-500">{p.time}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCard = (product, index) => (
    <div key={index} className="bg-white rounded-xl p-3 shadow-sm relative cursor-pointer" >
      <img src={product.image} alt={product.name} className="h-20 w-20 object-contain mx-auto mb-2 rounded cursor-pointer" onClick={() => navigate(`/product/${product.name}`)} />
      <div className="flex items-start justify-between relative">
        <div>
          <h4 className="text-sm font-semibold">{product.name}</h4>
          <p className="text-xs text-gray-500">{product.quantityText}</p>
        </div>
        <div className="absolute right-3 top-0">{renderCartControls(product)}</div>
      </div>
      {renderPriceGrid(product)}
    </div>
  );

  return (
    <div className="bg-[#fbfbfb] min-h-screen flex flex-col relative">
      <div className="p-4 pb-28">
        <div className="text-sm text-gray-600 text-center mb-4">
          <div className="text-lg font-semibold flex justify-center items-center gap-1">
            <span>📍</span>
            <span className="truncate max-w-[250px]">{location}</span>
          </div>
        </div>

        <div className="bg-gray-100 rounded-full px-4 py-2 mb-4 flex items-center">
          <span className="text-gray-500 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Search Store"
            className="bg-transparent outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold">Purchase Again</h3>
          <button
            onClick={() => setShowAllPurchase(!showAllPurchase)}
            className="text-green-600 text-sm"
          >
            {showAllPurchase ? "Show less" : "See all"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {purchaseAgainProducts.map(renderCard)}
        </div>

        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold">Groceries</h3>
          <button
            onClick={() => setShowAllGroceries(!showAllGroceries)}
            className="text-green-600 text-sm"
          >
            {showAllGroceries ? "Show less" : "See all"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {groceryProducts.map(renderCard)}
        </div>
      </div>
    </div>
  );
}
