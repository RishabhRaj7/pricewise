import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";

const brandIcons = {
  blinkit: `${import.meta.env.BASE_URL}logos/blinkit.png`,
  zepto: `${import.meta.env.BASE_URL}logos/zepto.png`,
  instamart: `${import.meta.env.BASE_URL}logos/instamart.png`,
  swiggyinstamart: `${import.meta.env.BASE_URL}logos/instamart.png`,
  jiomart: `${import.meta.env.BASE_URL}logos/jiomart.png`,
  bigbasket: `${import.meta.env.BASE_URL}logos/bigbasket.png`,
};

export default function Explore() {
  const { addToCart, cartItems, updateQuantity } = useCart();
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data: rawProducts, error } = await supabase.rpc("get_products_with_prices");
      if (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
        return;
      }

      const { data: platforms } = await supabase.from("platform").select("*");
      const platformMap = {};
      platforms.forEach((p) => {
        platformMap[p.platformid] = p.name;
      });

      const groupedByCategory = {};

      rawProducts.forEach((row) => {
        const product = row.product;
        const platformPrices = (product.prices || []).filter((p) => p.platformid !== null);
        if (!platformPrices.length) return;

        const productData = {
          name: product.name,
          category: product.category,
          quantityText: "1 unit",
          image: `https://placehold.co/100x100?text=${encodeURIComponent(product.name)}`,
          prices: platformPrices.map((p) => ({
            platform: platformMap[p.platformid] || `Platform ${p.platformid}`,
            price: p.discountedprice,
            oldPrice: p.baseprice,
            time: `⏱ ${Math.floor(Math.random() * 11) + 10} Mins`,
          })),
        };

        if (!groupedByCategory[product.category]) {
          groupedByCategory[product.category] = [];
        }
        groupedByCategory[product.category].push(productData);
      });

      setProductsByCategory(groupedByCategory);
      setLoading(false);
    }

    fetchProducts();
  }, []);

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

  const renderCard = (product, index) => {
    const cartItem = cartItems.find((item) => item.name === product.name);

    const renderCartControls = () => {
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
          className="bg-green-500/80 hover:bg-green-500 text-white rounded-full w-8 h-8 mt-2 ml-auto block transition"
        >
          +
        </button>
      );
    };

    return (
      <div key={index} className="bg-white rounded-xl p-3 shadow-sm">
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
            {renderCartControls()}
          </div>
        </div>
        {renderPriceGrid(product)}
      </div>
    );
  };

  const categoryColors = [
    "bg-green-100",
    "bg-yellow-100",
    "bg-pink-100",
    "bg-blue-100",
    "bg-purple-100",
    "bg-lime-100",
    "bg-red-100",
    "bg-indigo-100",
  ];

  const renderCategoryGrid = () => {
    const categories = Object.keys(productsByCategory);
    return (
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <div
            key={category}
            className={`rounded-xl px-4 py-6 text-center font-semibold text-sm shadow-sm cursor-pointer ${categoryColors[index % categoryColors.length]}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#fbfbfb] min-h-screen p-4">
      <div className="flex items-center mb-4">
  {selectedCategory && (
    <button
      onClick={() => setSelectedCategory(null)}
      className="text-sm px-2 py-1 rounded-full bg-gray-200 mr-2"
    >
      ← Back
    </button>
  )}
  <h2 className="text-lg font-semibold">
    {selectedCategory ? selectedCategory : "Explore Categories"}
  </h2>
</div>

      {loading ? (
        <div className="text-center text-gray-500 mt-16">Loading...</div>
      ) : selectedCategory ? (
        <div className="grid grid-cols-2 gap-4">
          {productsByCategory[selectedCategory].map(renderCard)}
        </div>
      ) : (
        renderCategoryGrid()
      )}
    </div>
  );
}
