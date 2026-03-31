import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import BottomFooter from "../components/layout/BottomFooter";
import FloatingCartButton from "../components/FloatingCartButton";
import HomePage from "../pages/HomePage";
import ItemDetailPage from "../pages/ItemDetailPage";
import CartPage from "../pages/CartPage";
import PurchasePage from "../pages/PurchasePage";
import ProfilePage from "../pages/ProfilePage";
import AdminApp from "../pages/admin/AdminApp";
import MoreTagsModal from "../components/tags/MoreTagsModal";
import CartContext from "../contexts/AppCartContext";
import UserContext from "../contexts/AppUserContext";
import { CartItemWithDetails, Tag, UserInfo, Item } from "../types";
import { getCartFromCookie, saveCartToCookie, clearCartCookie } from "../utils/cookies";
import { apiClient } from "../api";

const { Content } = Layout;

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<CartItemWithDetails[]>(() => getCartFromCookie());
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [moreTagsModalVisible, setMoreTagsModalVisible] = useState(false);

  useEffect(() => {
    const savedCart = getCartFromCookie();
    if (savedCart.length > 0) {
      setCart(savedCart);
    }
  }, []);

  useEffect(() => {
    saveCartToCookie(cart);
  }, [cart]);

  const fetchTags = React.useCallback(async (categoryId: number | null = null) => {
    try {
      const [allTags, popular] = await Promise.all([
        apiClient.getTags(categoryId),
        apiClient.getPopularTags(5, categoryId),
      ]);
      setTags(allTags);
      setPopularTags(popular);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  }, []);

  useEffect(() => {
    fetchTags(null);
  }, [fetchTags]);

  const addToCart = (item: Item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem.item.id === item.id,
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prevCart, { item, item_id: item.id, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.item.id !== itemId));
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    setCart((prevCart) =>
      prevCart
        .map((cartItem) =>
          cartItem.item.id === itemId ? { ...cartItem, quantity } : cartItem,
        )
        .filter((cartItem) => cartItem.quantity > 0),
    );
  };

  const clearCart = () => {
    setCart([]);
    clearCartCookie();
  };

  const handleTagToggle = React.useCallback((tagName: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagName)) {
        return prev.filter((tag) => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  }, []);

  const handleClearSelection = React.useCallback(() => {
    setSelectedTags([]);
  }, []);

  const handleShowMoreTags = React.useCallback(() => {
    setMoreTagsModalVisible(true);
  }, []);

  const handleCloseMoreTags = React.useCallback(() => {
    setMoreTagsModalVisible(false);
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isCartPage = location.pathname === "/cart";
  const isPurchasePage = location.pathname === "/purchase";

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    navigate("/purchase");
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      <UserContext.Provider value={{ user, setUser }}>
        <Layout className={`modern-app-layout ${isCartPage || isPurchasePage ? "with-footer" : ""}`}>
          <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} onNavigate={navigate} />

          <Content className={`modern-content ${isCartPage || isPurchasePage ? "with-footer" : ""}`}>
            <Routes>
              <Route path="/" element={<HomePage selectedTags={selectedTags} popularTags={popularTags} onTagToggle={handleTagToggle} onShowMoreTags={handleShowMoreTags} allTags={tags} onTagsUpdate={fetchTags} />} />
              <Route path="/item/:id" element={<ItemDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/purchase" element={<PurchasePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminApp />} />
            </Routes>
          </Content>

          {location.pathname === "/cart" && (
            <BottomFooter cart={cart} onCheckout={handleCheckout} />
          )}
          
          {location.pathname === "/" && (
            <FloatingCartButton 
              cartItemCount={cartItemCount} 
              onCartClick={() => navigate("/cart")} 
            />
          )}
          
          <MoreTagsModal
            visible={moreTagsModalVisible}
            onClose={handleCloseMoreTags}
            allTags={tags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearSelection={handleClearSelection}
          />
        </Layout>
      </UserContext.Provider>
    </CartContext.Provider>
  );
};

export default AppContent;


