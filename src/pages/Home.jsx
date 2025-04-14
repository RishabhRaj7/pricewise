import { useEffect, useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase.js";
import { fetchGroupedProductsFromBackend } from "../utils/productService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const brandIcons = {
  blinkit: `${import.meta.env.BASE_URL}logos/blinkit.png`,
  zepto: `${import.meta.env.BASE_URL}logos/zepto.png`,
  instamart: `${import.meta.env.BASE_URL}logos/instamart.png`,
  swiggyinstamart: `${import.meta.env.BASE_URL}logos/instamart.png`,
  jiomart: `${import.meta.env.BASE_URL}logos/jiomart.png`,
  bigbasket: `${import.meta.env.BASE_URL}logos/bigbasket.png`,
};

export default function Home() {
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllPurchase, setShowAllPurchase] = useState(false);
  const [showAllGroceries, setShowAllGroceries] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, cartItems, updateQuantity } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const savedAddress = localStorage.getItem("selectedAddress");
    setLocation(savedAddress || "Unknown Location");
  }, []);

  useEffect(() => {
    async function fetchUserOrderHistory() {
      try {
        const storedUser = localStorage.getItem("user");
        const userData = storedUser ? JSON.parse(storedUser) : null;
        
        if (!userData?.userid) {
          console.log("User information not available for order history");
          return [];
        }
        
        const { data, error } = await supabase
          .from('orderhistory')
          .select('productid, quantity')
          .eq('userid', userData.userid);
          
        if (error) {
          console.error("Error fetching order history:", error);
          return [];
        }
        
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
        
        setOrderHistory(productCounts);
        return productCounts;
      } catch (error) {
        console.error("Error fetching user order history:", error);
        return [];
      }
    }

    async function fetchProducts() {
      try {
        setIsLoading(true);
        const stored = localStorage.getItem("allProducts");
        let productData = [];
        
        if (stored) {
          productData = JSON.parse(stored);
          setAllProducts(productData);
        } else {
          const { data: rawProducts, error: productError } = await supabase.rpc("get_products_with_prices");
          if (productError) throw productError;

          const { data: platforms, error: platformError } = await supabase.from("platform").select("*");
          if (platformError) throw platformError;

          const platformMap = {};
          platforms.forEach((p) => {
            platformMap[p.platformid] = p.name;
          });

          productData = rawProducts
            .map((row) => {
              const product = row.product;
              const validPrices = (product.prices || []).filter((p) => p.platformid !== null);
              if (validPrices.length === 0) return null;

              return {
                productid: product.productid,
                name: product.name,
                category: product.category,
                quantityText: "1 unit",
                image: `https://placehold.co/100x100?text=${encodeURIComponent(product.name)}`,
                prices: validPrices.map((p) => ({
                  platform: platformMap[p.platformid] || `Platform ${p.platformid}`,
                  price: p.discountedprice,
                  oldPrice: p.baseprice,
                  time: `⏱ ${Math.floor(Math.random() * 11) + 10} Mins`,
                  platformId: p.platformid
                })),
              };
            })
            .filter(Boolean);

          setAllProducts(productData);
          localStorage.setItem("allProducts", JSON.stringify(productData));
        }

        const productCounts = await fetchUserOrderHistory();
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading products and platforms:", error);
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const commonItems = useMemo(() => {
    if (Object.keys(orderHistory).length > 0) {
      return allProducts
        .filter(product => orderHistory[product.productid])
        .sort((a, b) => {
          const aCount = orderHistory[a.productid]?.count || 0;
          const bCount = orderHistory[b.productid]?.count || 0;
          
          if (aCount === bCount) {
            return (orderHistory[b.productid]?.totalQuantity || 0) - (orderHistory[a.productid]?.totalQuantity || 0);
          }
          
          return bCount - aCount;
        })
        .slice(0, 10);
    } 
    
    return allProducts.slice(0, 10);
  }, [allProducts, orderHistory]);

  const commonCategories = new Set(commonItems.map((p) => p.category));
  const grocerySpecific = allProducts.filter(
    (p) => p.category?.trim().toLowerCase() === "gourmet & world food"
  );

  const commonItemNames = new Set(commonItems.map((p) => p.name));
  const groceryNames = new Set(grocerySpecific.map((p) => p.name));

  const purchaseSpecific = allProducts.filter(
    (p) =>
      !commonItemNames.has(p.name) &&
      !groceryNames.has(p.name) &&
      commonCategories.has(p.category)
  );

  const purchaseAgainAll = [...commonItems];
  const groceryAll = [...grocerySpecific];

  const filteredPurchase = purchaseAgainAll.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedPlatforms.length === 0 ||
      product.prices.some((p) => selectedPlatforms.includes(p.platform.toLowerCase().replace(/\s+/g, ""))))
  );

  const filteredGrocery = groceryAll.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedPlatforms.length === 0 ||
      product.prices.some((p) => selectedPlatforms.includes(p.platform.toLowerCase().replace(/\s+/g, ""))))
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
            productid: product.productid,
            name: product.name,
            image: product.image,
            quantityText: product.quantityText,
            prices: product.prices,
          })
        }
        className="bg-green-500/80 hover:bg-green-500 text-white rounded-full w-8 h-8 mt-2 ml-auto block transition"
      >
        +
      </button>
    );
  };

  const renderPriceGrid = (product) => (
    <div className="mt-4 space-y-1 text-xs">
      {product.prices.map((p, i) => {
        const key = p.platform.toLowerCase().replace(/\s+/g, "");
        const logo = brandIcons[key];

        return (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {logo ? (
                <img
                  src={logo}
                  alt={p.platform}
                  title={`Show only ${p.platform}`}
                  className="w-[4rem] h-[4rem] object-contain cursor-pointer hover:scale-105 transition"
                  onClick={() => {
                    setSelectedPlatforms((prev) =>
                      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
                    );
                  }}
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
    <div className="bg-[#fbfbfb] min-h-screen flex flex-col relative">
      <div className="p-4 pb-28">
        <div className="text-sm text-gray-600 text-center mb-4">
          <div
            className="text-lg font-semibold flex justify-center items-center gap-1 cursor-pointer"
            onClick={() => navigate("/location")}
          >
            <span>📍</span>
            <span className="truncate max-w-[250px] underline underline-offset-4">
              {location}
            </span>
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

        {selectedPlatforms.length > 0 && (
          <div className="mb-4 text-center">
            <p className="text-sm mb-2 text-gray-700 font-medium">Filtering by:</p>
            <div className="flex justify-center flex-wrap gap-2">
              {selectedPlatforms.map((platform) => (
                <div
                  key={platform}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full shadow-sm"
                >
                  <img src={brandIcons[platform]} alt={platform} className="w-5 h-5 object-contain" />
                  <span className="text-xs capitalize">{platform}</span>
                  <button
                    onClick={() =>
                      setSelectedPlatforms((prev) => prev.filter((p) => p !== platform))
                    }
                    className="text-gray-400 text-sm hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedPlatforms([])}
              className="text-xs text-blue-600 underline mt-2"
            >
              Clear All Filters
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold">Purchase Again</h3>
          <button
            onClick={() => setShowAllPurchase(!showAllPurchase)}
            className="text-green-600 text-sm"
          >
            {showAllPurchase ? "Show less" : "See all"}
          </button>
        </div>
        
        {Object.keys(orderHistory).length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-4 text-center">
            <p className="text-gray-500 mb-2">You haven't ordered anything yet</p>
            <button 
              onClick={() => navigate("/explore")}
              className="text-green-600 font-medium"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {purchaseAgainProducts.map(renderCard)}
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold">Gourmet & World Food</h3>
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
