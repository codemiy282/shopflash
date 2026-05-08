import React, { createContext, useState, useEffect } from "react";

// Create the context (for global sharing)
export const CartContext = createContext();

// Helper to get cart from localStorage
const getCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('shopflash_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error reading cart from localStorage:", error);
    return [];
  }
};

// Helper to save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('shopflash_cart', JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

// Provider wraps the whole app and manages cart state
export function CartProvider({ children }) {
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState(() => getCartFromStorage());

  // Save to localStorage whenever cart changes
  useEffect(() => {
    saveCartToStorage(cartItems);
    console.log("Cart saved to localStorage:", cartItems);
  }, [cartItems]);

  // Add item to cart (or increase quantity if it exists)
  const addToCart = (product, variant) => {
    console.log("Adding to cart:", product, variant);
    
    // Get variant name (could be variant.name or variant.color)
    const variantName = variant.name || variant.color || "Default";
    const productId = product.productId || product.product_id;
    
    setCartItems(prevItems => {
      // Look for existing product+variant in cart
      const existing = prevItems.find(
        item => item.id === productId && item.variant === variantName
      );
      
      let newItems;
      if (existing) {
        // If exists, increment quantity
        newItems = prevItems.map(item =>
          item.id === productId && item.variant === variantName
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // New item, add to cart
        const newItem = {
          id: productId,
          name: product.name,
          variant: variantName,
          price: variant.discountPrice || variant.discount_price || 0,
          listPrice: variant.listPrice || variant.list_price || 0,
          quantity: 1,
          thumbnail: product.thumbnail || '/default-product.png'
        };
        newItems = [...prevItems, newItem];
      }
      
      console.log("Cart updated:", newItems);
      return newItems;
    });
  };

  // Change the quantity of a product in cart (+1 or -1)
  // Called from Cart page when you click plus/minus buttons.
  // If quantity would drop below 1, keep it at 1.
  const changeQuantity = (id, variantName, delta) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id && item.variant === variantName
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  // Optionally, add removeItem if you want delete functionality:
  const removeItem = (id, variantName) => {
    setCartItems(items =>
      items.filter(item => !(item.id === id && item.variant === variantName))
    );
  };

  // Clear entire cart (useful after checkout)
  const clearCart = () => {
    setCartItems([]);
  };

  // Get total items count
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Provide these functions and data to the rest of the app
  return (
    <CartContext.Provider
      value={{
        cartItems,       // array of items in cart
        cartCount,       // total number of items
        addToCart,       // function to add
        changeQuantity,  // function to update amount
        removeItem,      // function to remove single item
        clearCart        // function to clear all
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartContext;
