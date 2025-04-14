import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart from localStorage on initial load
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
      }
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.name === product.name);
      if (existingItem) {
        return prev.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            name: product.name,
            image: product.image,
            quantityText: product.quantityText,
            prices: product.prices,
            quantity: 1,
            productid: product.productid // Use productid instead of id
          },
        ];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (itemName, change) => {
    setCartItems((prev) => {
      const newCart = prev.map((item) => {
        if (item.name === itemName) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0
            ? { ...item, quantity: newQuantity }
            : null;
        }
        return item;
      });
      return newCart.filter(Boolean); // Remove items with quantity 0
    });
  };

  // Remove item from cart
  const removeFromCart = (itemName) => {
    setCartItems((prev) => prev.filter((item) => item.name !== itemName));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
