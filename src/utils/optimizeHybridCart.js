const savingsPercent = {
  blinkit: 0.12,
  zepto: 0.07,
  swiggyinstamart: 0.1,
  jiomart: 0.05,
  bigbasket: 0.15,
};

const DELIVERY_THRESHOLD = 200;
const SAVINGS_THRESHOLD = 800;
const DELIVERY_FEE = 30;

export function buildBestHybridCart(cartItems) {
  const platforms = new Set();
  for (const item of cartItems) {
    for (const price of item.prices) {
      platforms.add(price.platform.toLowerCase().replace(/\s+/g, ""));
    }
  }

  const platformList = [...platforms];
  let bestCombo = null;
  let lowestTotal = Infinity;

  for (let i = 0; i < platformList.length; i++) {
    for (let j = i + 1; j < platformList.length; j++) {
      const [p1, p2] = [platformList[i], platformList[j]];
      const platformCart = {
        [p1]: initPlatformCart(p1),
        [p2]: initPlatformCart(p2),
      };

      let validCombo = true;

      for (const item of cartItems) {
        const candidates = item.prices.filter(
          (p) =>
            p.platform.toLowerCase().replace(/\s+/g, "") === p1 ||
            p.platform.toLowerCase().replace(/\s+/g, "") === p2
        );

        if (candidates.length === 0) {
          validCombo = false;
          break;
        }

        const best = candidates.reduce((a, b) => (a.price < b.price ? a : b));
        const key = best.platform.toLowerCase().replace(/\s+/g, "");
        const cart = platformCart[key];

        cart.items.push({
          name: item.name,
          quantity: item.quantity,
          price: best.price,
          oldPrice: best.oldPrice,
        });

        cart.itemTotal += best.oldPrice * item.quantity;
        cart.discount += (best.oldPrice - best.price) * item.quantity;
        cart.subtotal += best.price * item.quantity;
      }

      if (!validCombo) continue;

      let combinedTotal = 0;

      for (const key of [p1, p2]) {
        const cart = platformCart[key];
        cart.deliveryFee =
          cart.subtotal < DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;

        const postDiscount = cart.itemTotal - cart.discount;
        cart.additionalSavings =
          cart.subtotal >= SAVINGS_THRESHOLD
            ? Math.floor(postDiscount * (savingsPercent[key] || 0))
            : 0;

        cart.estimatedTotal =
          cart.itemTotal -
          cart.discount -
          cart.additionalSavings +
          cart.deliveryFee;

        combinedTotal += cart.estimatedTotal;
      }

      if (combinedTotal < lowestTotal) {
        lowestTotal = combinedTotal;
        bestCombo = {
          platforms: [p1, p2],
          platformBreakdown: platformCart,
          combinedEstimatedTotal: combinedTotal,
        };
      }
    }
  }

  return bestCombo;
}

function initPlatformCart(key) {
  return {
    platform: key,
    items: [],
    itemTotal: 0,
    discount: 0,
    subtotal: 0,
    deliveryFee: 0,
    additionalSavings: 0,
    estimatedTotal: 0,
  };
}
