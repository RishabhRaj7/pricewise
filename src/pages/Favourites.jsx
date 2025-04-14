import { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase.js";
import platformLogos from "../utils/platformLogos";
import { useNavigate } from "react-router-dom";

export default function Favourites() {
  const [favouriteProducts, setFavouriteProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, cartItems, updateQuantity } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavouriteProducts();
  }, []);

  const fetchFavouriteProducts = async () => {
    try {
      setIsLoading(true);
      
      // Get user from localStorage
      const storedUser = localStorage.getItem("user");
      const userData = storedUser ? JSON.parse(storedUser) : null;
      
      if (!userData?.userid) {
        toast.error("User information not available");
        setIsLoading(false);
        return;
      }
      
      // Fetch order history for this user
      const { data, error } = await supabase
        .from('orderhistory')
        .select('productid, quantity')
        .eq('userid', userData.userid);
        
      if (error) {
        console.error("Error fetching order history:", error);
        toast.error("Failed to load favourite products");
        setIsLoading(false);
        return;
      }
      
      // Count product occurrences and total quantities
      const productCounts = data.reduce((acc, order) => {
        if (!acc[order.productid]) {
          acc[order.productid] = {
            count: 0,
            totalQuantity: 0
          };
        }
        acc[order.productid].count += 1;
        acc[order.productid].totalQuantity += order.quantity;
        return acc;
      }, {});
      
      // Filter to keep only products ordered multiple times (count > 1)
      const multipleOrderedProductIds = Object.keys(productCounts)
        .filter(id => productCounts[id].count > 1)
        .sort((a, b) => 
          productCounts[b].count - productCounts[a].count || 
          productCounts[b].totalQuantity - productCounts[a].totalQuantity
        );
      
      // Get product details from localStorage
      const allProductsJSON = localStorage.getItem("allProducts");
      if (!allProductsJSON) {
        toast.error("Product information not available");
        setIsLoading(false);
        return;
      }
      
      const allProducts = JSON.parse(allProductsJSON);
      
      // Match product IDs with product details
      const favourites = multipleOrderedProductIds
        .map(id => {
          const product = allProducts.find(p => p.productid == id);
          if (product) {
            return {
              ...product,
              orderCount: productCounts[id].count,
              totalOrdered: productCounts[id].totalQuantity
            };
          }
          return null;
        })
        .filter(Boolean);
      
      setFavouriteProducts(favourites);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching favourite products:", error);
      toast.error("Something went wrong while loading your favourites");
      setIsLoading(false);
    }
  };

  const renderCartControls = (product) => {
    const cartItem = cartItems.find((item) => item.name === product.name);
    return cartItem ? (
      <div className="flex items-center gap-2 mt-1">
        <button 
          onClick={() => updateQuantity(product.name, -1)} 
          className="w-8 h-8 border rounded-full text-lg"
        >
          −
        </button>
        <span>{cartItem.quantity}</span>
        <button 
          onClick={() => updateQuantity(product.name, 1)} 
          className="w-8 h-8 border rounded-full text-lg text-green-600"
        >
          +
        </button>
      </div>
    ) : (
      <button
        onClick={() =>
          addToCart({
            productid: product.productid,
            name: product.name,
            image: product.image,
            quantityText: product.quantityText,
            prices: product.prices,
          })
        }
        className="bg-green-500/80 hover:bg-green-500 text-white rounded-full w-8 h-8 block transition"
      >
        +
      </button>
    );
  };

  const renderPriceGrid = (product) => (
    <div className="mt-4 space-y-1 text-xs">
      {product.prices.map((p, i) => {
        const key = p.platform.toLowerCase().replace(/\s+/g, "");
        const logo = platformLogos[key];

        return (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {logo ? (
                <img
                  src={logo}
                  alt={p.platform}
                  title={`Show only ${p.platform}`}
                  className="w-[4rem] h-[4rem] object-contain"
                />
              ) : (
                <span className="text-xs text-gray-700">{p.platform}</span>
              )}
            </div>
            <div className="text-right">
              <div className="text-gray-400 line-through text-[11px]">₹{p.oldPrice}</div>
              <div className="font-semibold">₹{p.price}</div>
              <div className="text-[10px] text-gray-500">{p.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCard = (product, index) => (
    <div key={index} className="bg-white rounded-xl p-3 shadow-sm relative cursor-pointer">
      <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
        {product.orderCount}× ordered
      </div>
      
      <img
        src={product.image}
        alt={product.name}
        className="h-20 w-20 object-contain mx-auto mb-2 rounded cursor-pointer"
        onClick={() => navigate(`/product/${product.name}`)}
      />
      
      <div className="flex items-start justify-between relative">
        <div>
          <h4 className="text-sm font-semibold">
            {product.brand ? `${product.brand} ${product.name}` : product.name}
          </h4>
          <p className="text-xs text-gray-500">{product.quantityText}</p>
        </div>
        <div className="absolute right-[0.05rem] top-[26px]">
          {renderCartControls(product)}
        </div>
      </div>
      
      {renderPriceGrid(product)}
    </div>
  );

  return (
    <div className="max-w-[420px] mx-auto pb-24 bg-[#fbfbfb] min-h-screen">
      <div className="sticky top-0 bg-[#fbfbfb] z-10 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-center">Your Favourites</h2>
      </div>
      
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {favouriteProducts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-2">No frequently ordered products found</p>
                <p className="text-sm text-gray-400">
                  Products you order multiple times will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {favouriteProducts.map(renderCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}