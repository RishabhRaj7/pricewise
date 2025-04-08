// src/utils/optimizeCart.js

export function buildPlatformCarts(cartItems) {
  const platformMap = {};

  cartItems.forEach((item) => {
    item.prices.forEach((price) => {
      const key = price.platform.toLowerCase().replace(/\s+/g, "");
      if (!platformMap[key]) {
        platformMap[key] = {
          platform: price.platform,
          time: price.time,
          itemTotal: 0,
          discount: 0,
          additionalSavings: 0,
          items: [],
          missing: [],
        };
      }

      platformMap[key].items.push({
        name: item.name,
        price: price.price,
        oldPrice: price.oldPrice,
        quantity: item.quantity || 1,
      });

      platformMap[key].itemTotal += price.oldPrice * (item.quantity || 1);
      platformMap[key].discount +=
        (price.oldPrice - price.price) * (item.quantity || 1);
    });
  });

  const result = Object.entries(platformMap).map(([key, cart]) => {
    const itemCount = cart.items.reduce((acc, cur) => acc + cur.quantity, 0);
    const included = cart.items.map((i) => i.name);
    const missing = cartItems
      .map((item) => item.name)
      .filter((name) => !included.includes(name));
    const isComplete = missing.length === 0;

    cart.missing = missing;

    const postDiscount = cart.itemTotal - cart.discount;

    // Delivery fee logic
    const deliveryFee = postDiscount < 200 ? 30 : 0;

    // Additional savings logic
    let additionalSavings = 0;
    if (postDiscount >= 800) {
      if (key === "jiomart")
        additionalSavings = 0.05 * (postDiscount - cart.discount);
      else if (key === "swiggyinstamart")
        additionalSavings = 0.1 * (postDiscount - cart.discount);
      else if (key === "zepto")
        additionalSavings = 0.07 * (postDiscount - cart.discount);
      else if (key === "blinkit")
        additionalSavings = 0.12 * (postDiscount - cart.discount);
      else if (key === "bigbasket")
        additionalSavings = 0.15 * (postDiscount - cart.discount);
    }

    const estimatedTotal = postDiscount - additionalSavings + deliveryFee;

    return {
      ...cart,
      itemCount,
      isComplete,
      included,
      missing,
      additionalSavings,
      deliveryFee,
      estimatedTotal,
    };
  });

  return result.sort((a, b) => a.estimatedTotal - b.estimatedTotal);
}

function getLogoForPlatform(platform) {
  const normalized = platform.toLowerCase().replace(/\s+/g, "");

  const filenameMap = {
    blinkit: "blinkit.png",
    zepto: "zepto.png",
    instamart: "instamart.png",
    swiggyinstamart: "instamart.png",
    jiomart: "jiomart.png",
    jio: "jiomart.png",
    bigbasket: "bigbasket.png",
  };

  const filename = filenameMap[normalized];
  return filename ? `/logos/${filename}` : "/logos/default.png";
}
