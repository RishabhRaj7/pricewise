import platformLogos from "../utils/platformLogos";

export default function HybridOptimizedCart({ hybridCart }) {
  if (!hybridCart) return null;

  const [p1, p2] = hybridCart.platforms;
  const breakdown = hybridCart.platformBreakdown;

  const renderSummary = (platform) => {
    const cart = breakdown[platform];
    const name = platform.charAt(0).toUpperCase() + platform.slice(1);

    return (
      <div className="flex items-center gap-2">
        <img src={platformLogos[platform]} alt={name} className="w-10 h-10 object-contain rounded" />
        <span className="text-sm font-medium capitalize">{name}</span>
        <span className="text-xs text-gray-500 ml-auto">
          Est. ₹{cart.estimatedTotal}
        </span>
      </div>
    );
  };

  return (
    <div className="p-4 mb-6 border rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 shadow-sm">
      <div className="text-xs absolute -top-3 -left-3 bg-green-500 text-white px-2 py-1 rounded-full shadow">
        ✅ Optimized Hybrid Cart
      </div>

      <div className="mb-4">
        {renderSummary(p1)}
        {renderSummary(p2)}
      </div>

      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Combined Estimated Total</span>
          <span className="font-semibold">₹{hybridCart.combinedEstimatedTotal.toFixed(0)}</span>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold mb-2 text-gray-700">Item Split</p>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-gray-500">
              <th className="pb-1">Item</th>
              <th className="pb-1 text-right">Platform</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(breakdown).flatMap(([platform, data]) =>
              data.items.map((item, idx) => (
                <tr key={`${platform}-${idx}`} className="border-t border-gray-100">
                  <td className="py-1">{item.name} × {item.quantity}</td>
                  <td className="py-1 text-right">
                    <span className="inline-flex items-center gap-1">
                      <img
                        src={platformLogos[platform]}
                        alt={platform}
                        className="w-4 h-4"
                      />
                      <span className="capitalize">{platform}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
