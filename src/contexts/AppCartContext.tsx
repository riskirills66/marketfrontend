import React from "react";
import { CartItemWithDetails, Item } from "../types";

const CartContext = React.createContext<{
  cart: CartItemWithDetails[];
  addToCart: (item: Item) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
}>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

export default CartContext;


