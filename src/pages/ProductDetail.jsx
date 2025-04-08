import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import platformLogos from "../utils/platformLogos";

const generateChartData = (currentPrices) => {
  const labels = {
    day: ["Today"],
    week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    month: ["Week 1", "Week 2", "Week 3", "Week 4"],
    "3months": ["Apr", "May", "Jun"],
    "6months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  };

  const platforms = ["blinkit", "zepto", "swiggyinstamart", "jiomart", "bigbasket"];
  const basePrices = Object.fromEntries(
    platforms.map((p) => [
      p,
      currentPrices.find((x) => x.platform?.toLowerCase().replace(/\s+/g, "") === p)?.price || 300,
    ])
  );

  const chartData = {};
  Object.entries(labels).forEach(([key, periods]) => {
    chartData[key] = periods.map((label) => {
      const entry = { label };
      platforms.forEach((p) => {
        const base = basePrices[p];
        entry[p] = Math.round(base + (Math.random() * 50 - 25)); // ±25 variation
      });
      return entry;
    });
  });

  return chartData;
};

export default function ProductDetail() {
  const { id } = useParams();
  const [location, setLocation] = useState("Unknown Location");
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [duration, setDuration] = useState("6months");
  const [fullChartData, setFullChartData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const savedAddress = localStorage.getItem("selectedAddress");
    setLocation(savedAddress || "Unknown Location");

    const storedProducts = JSON.parse(localStorage.getItem("allProducts"));
    if (storedProducts) {
      const found = storedProducts.find((p) => p.name === id);
      setProduct(found || null);
      if (found?.prices) {
        const generated = generateChartData(found.prices);
        setFullChartData(generated);
      }
    }
  }, [id]);

  if (!product) {
    return <div className="p-4 text-center">Product not found</div>;
  }

  const inCart = cartItems.find((item) => item.name === product.name);

  return (
    <div className="bg-[#fbfbfb] min-h-screen p-4 pb-28 max-w-[420px] mx-auto">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-3 py-1 rounded-full bg-gray-200"
        >
          ← Back
        </button>
      </div>

      <div className="text-center mb-4">
        <img src={product.image} alt={product.name} className="h-28 object-contain mx-auto mb-2" />
        <h2 className="text-md font-semibold">{product.name}</h2>
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
            <button onClick={() => updateQuantity(product.name, -1)} className="w-8 h-8 border rounded-full text-lg">−</button>
            <span>{inCart.quantity}</span>
            <button onClick={() => updateQuantity(product.name, 1)} className="w-8 h-8 border rounded-full text-lg text-green-600">+</button>
          </div>
        )}
      </div>

      <div className="bg-white p-3 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-600">🔔 Notify Me on Price Drop</span>
        </div>

        <div className="mb-3">
          {["day", "week", "month", "3months", "6months"].map((key) => (
            <button
              key={key}
              onClick={() => setDuration(key)}
              className={`text-xs px-2 py-1 border rounded-full mr-1 mb-2 ${duration === key ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              {key === "3months"
                ? "3 Months"
                : key === "6months"
                ? "6 Months"
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={180}>
  <LineChart data={fullChartData[duration]}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="label" />
    <YAxis />
    <Tooltip />
    <Legend />
    {product.prices.map((p, i) => {
  const key = p.platform?.toLowerCase().replace(/\s+/g, "");
  const colors = {
    blinkit: "#facc15",
    zepto: "#a855f7",
    instamart: "#f97316",
    swiggyinstamart: "#f97316",
    jiomart: "#3b82f6",
    bigbasket: "#22c55e",
  };
  return (
    <Line
      key={i}
      type="monotone"
      dataKey={key}
      stroke={colors[key] || "#000"}
      dot={false}
    />
  );
})}

  </LineChart>
</ResponsiveContainer>

      </div>

      <div className="mt-4 space-y-2">
        {product.prices.map((p, i) => {
          const key = p.platform?.toLowerCase().replace(/\s+/g, "");
          const logo = platformLogos[key];
          return (
            <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm">
              <div>
                {logo ? (
                  <img src={logo} alt={p.platform} className="w-[4rem] h-[4rem] object-contain" />
                ) : (
                  <span className="text-xs font-medium text-gray-700">{p.platform}</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-gray-400 line-through text-sm">₹{p.oldPrice}</div>
                <div className="font-semibold text-md">₹{p.price}</div>
                <div className="text-xs text-gray-500">{p.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
