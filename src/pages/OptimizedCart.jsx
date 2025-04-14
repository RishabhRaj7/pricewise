import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { buildPlatformCarts } from "../utils/optimizeCart";
import { buildBestHybridCart } from "../utils/optimizeHybridCart";
import HybridOptimizedCart from "../components/HybridOptimizedCart";
import platformLogos from "../utils/platformLogos";
import { supabase } from "../supabase.js";
import { toast } from "react-toastify";

export default function OptimizedCart() {
  const { cartItems, clearCart } = useCart();
  const [platformCarts, setPlatformCarts] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [hybridCart, setHybridCart] = useState(null);
  const [showHybrid, setShowHybrid] = useState(false);
  const [clickedCarts, setClickedCarts] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
    
    // Build carts
    const singlePlatformResults = buildPlatformCarts(cartItems);
    // Sort: complete carts first, then by estimated total
    singlePlatformResults.sort((a, b) => {
      if (a.isComplete !== b.isComplete) return b.isComplete - a.isComplete;
      return a.estimatedTotal - b.estimatedTotal;
    });
    setPlatformCarts(singlePlatformResults);

    const hybrid = buildBestHybridCart(cartItems);
    if (
      hybrid &&
      hybrid.combinedEstimatedTotal < (singlePlatformResults[0]?.estimatedTotal || Infinity)
    ) {
      setHybridCart(hybrid);
    }
  }, [cartItems]);

  const toggleExpanded = (platformKey) => {
    setExpanded((prev) => ({
      ...prev,
      [platformKey]: !prev[platformKey],
    }));
  };

  const addToOrderHistory = async (userId, cart, platformKey) => {
    try {
      if (!userId) {
        console.log("No user ID found, skipping order history update");
        return false;
      }
      
      // First, get the highest orderid from the entire table
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('orderhistory')
        .select('orderid')
        .order('orderid', { ascending: false })
        .limit(1);
      
      if (maxOrderError) {
        console.error("Error fetching max orderid:", maxOrderError);
        return false;
      }
      
      // Determine the next orderid (global highest + 1)
      let nextOrderId = 1; // Default to 1 if no existing orders
      if (maxOrderData && maxOrderData.length > 0) {
        nextOrderId = maxOrderData[0].orderid + 1;
      }
      
      console.log("Next order ID:", nextOrderId);
      
      const now = new Date().toISOString();
      const platformVariantId = parseInt(platformKey.replace(/\D/g, '')) || 1;
      
      // Process each item in the cart with individual API calls
      let allSuccessful = true;
      
      // Debug the cart items to see if they have productid
      console.log("Cart items to process:", cart.items);
      
      for (const item of cart.items) {
        // Find the original cart item with its ID
        const originalCartItem = cartItems.find(cartItem => cartItem.name === item.name);
        console.log("Original cart item:", originalCartItem);
        
        // Use the ID from the original cart item or default to 1
        const productId = originalCartItem?.productid || item.productid || 1;
        
        console.log(`Product ID for ${item.name}:`, productId);
        
        const orderEntry = {
          orderid: nextOrderId,
          userid: userId,
          productid: productId,
          quantity: item.quantity,
          totalprice: item.price * item.quantity,
          orderdate: now,
          deliverystatus: "Delivered",
          created_at: now,
          updated_at: now,
          variantid: platformVariantId
        };
        
        console.log(`Sending to Supabase for product ${item.name}:`, orderEntry);
        
        // Individual API call for each product
        const { data, error } = await supabase
          .from('orderhistory')
          .insert([orderEntry]);
          
        if (error) {
          console.error(`Error adding product ${item.name} to order history:`, error);
          allSuccessful = false;
        } else {
          console.log(`Successfully added product ${item.name} to order history:`, data);
        }
      }
      
      return allSuccessful;
      
    } catch (error) {
      console.error("Error in addToOrderHistory:", error);
      return false;
    }
  };

  const renderCartCard = (cart, index) => {
    const platformKey = cart.platform.toLowerCase().replace(/\s+/g, "");
    const isBest = cart.isComplete && cart.estimatedTotal === platformCarts[0]?.estimatedTotal;

    const gradientMap = {
      blinkit: "from-[#FFF9E6] to-[#FFF3C2]",
      zepto: "from-[#FDF2FF] to-[#F7E8FF]",
      instamart: "from-[#FEEFEA] to-[#FCDDD3]",
      swiggyinstamart: "from-[#FEEFEA] to-[#FCDDD3]",
      jiomart: "from-[#F4F2FF] to-[#E3E1FF]",
      bigbasket: "from-[#ECFDF3] to-[#D1FADF]",
    };

    const gradient = gradientMap[platformKey] || "from-gray-100 to-gray-50";

    const handleCardClick = async (e) => {
      // Stop propagation for inner button clicks (like "Show Items")
      if (e.target.closest('button:not(.cart-card)')) {
        console.log("Inner button clicked, not processing cart click");
        return;
      }
      
      console.log(`${cart.platform} cart clicked!`);
      
      // Skip if already clicked
      if (clickedCarts[platformKey]) {
        console.log("Cart already clicked, skipping");
        return;
      }
      
      try {
        // Get user from localStorage if not in state
        let currentUser = user;
        if (!currentUser) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            try {
              currentUser = JSON.parse(storedUser);
              setUser(currentUser);
              console.log("Retrieved user from localStorage:", currentUser);
            } catch (error) {
              console.error("Error parsing user from localStorage:", error);
              return;
            }
          } else {
            console.error("No user found in localStorage");
            return;
          }
        }
        
        if (!currentUser?.userid) {
          console.error("User object doesn't contain userid:", currentUser);
          return;
        }
        
        // Call the function to add to order history
        const success = await addToOrderHistory(currentUser.userid, cart, platformKey);
        
        if (success) {
          console.log("Successfully added all items to order history");
          toast.info(`Successfully added all items to order list`);
          clearCart();
          // Mark this cart as clicked to prevent duplicate entries
          setClickedCarts(prev => ({
            ...prev,
            [platformKey]: true
          }));
        } else {
          console.error("Failed to add items to order history");
        }
      } catch (error) {
        console.error("Error in handleCardClick:", error);
      }
    };

    return (
      <button
        key={index}
        onClick={handleCardClick}
        className={`cart-card relative p-4 mb-4 border rounded-xl bg-gradient-to-br ${gradient} ${
          isBest ? "border-green-500" : "border-gray-200"
        } w-full text-left cursor-pointer`}
      >
        {isBest && (
          <div className="absolute -top-3 -left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
            ✅ Optimized Cart
          </div>
        )}
        {!isBest && !cart.isComplete && (
          <div className="absolute -top-3 -left-3 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full shadow">
            ⚠️ Partial Match
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="w-16 h-16 rounded-full bg-white shadow flex items-center justify-center">
            <img
              src={platformLogos[platformKey]}
              alt={cart.platform}
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="text-xs text-gray-600">{cart.time}</span>
        </div>

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Items Total</span>
            <span>₹{cart.itemTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount Applied</span>
            <span className="text-green-600">₹{cart.discount.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
  <span>Delivery Fee</span>
  <span className="text-gray-700">
    ₹{cart.deliveryFee > 0 ? cart.deliveryFee : 0}
    {cart.deliveryFee > 0 && (
      <span className="text-xs text-gray-400 ml-1">(Free over ₹200)</span>
    )}
  </span>
</div>
          <div className="flex justify-between">
            <span>Additional Savings Available</span>
            <span className="text-gray-500">₹{cart.additionalSavings}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold">
            <span>Estimated Total</span>
            <span>₹{cart.estimatedTotal.toFixed(0)}</span>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={() => toggleExpanded(platformKey)}
            className="text-xs text-blue-600 underline"
          >
            {expanded[platformKey] ? "Hide Items" : "Show Items"}
          </button>

          {expanded[platformKey] && (
            <div className="mt-2 space-y-3">
              <div>
                <p className="text-xs font-semibold mb-1 text-gray-700">Included Items</p>
                <ul className="text-xs text-gray-700 space-y-[2px]">
                  {cart.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} <span className="text-gray-500">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {cart.missing.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-1 text-red-600">Missing Items</p>
                  <ul className="text-xs text-red-500 space-y-[2px]">
                    {cart.missing.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-[420px] mx-auto p-4 pb-24 bg-[#fbfbfb] min-h-screen">
      <div className="sticky top-0 bg-[#fbfbfb] z-10 p-4 shadow-sm -mx-4 mb-4">
        <h2 className="text-lg font-semibold text-center">My Cart</h2>
      </div>

      {hybridCart && (
        <div className="mb-4">
          <button
            onClick={() => setShowHybrid((prev) => !prev)}
            className="bg-green-600 text-white px-4 py-2 rounded-full text-sm shadow"
          >
            {showHybrid ? "Back to Single Platform Carts" : "Compare Hybrid Split"}
          </button>
        </div>
      )}

      {showHybrid && hybridCart ? (
        <HybridOptimizedCart hybridCart={hybridCart} />
      ) : (
        <>
          {platformCarts.map(renderCartCard)}
          {platformCarts.length === 0 && (
            <div className="text-center text-gray-500 mt-16">
              🛒 No items to optimize
            </div>
          )}
        </>
      )}
    </div>
  );
}
