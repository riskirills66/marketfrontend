import { CartItemWithDetails, UserInfo } from "../types";

const COOKIE_NAME = "dashmarket_user_info";
const CART_COOKIE_NAME = "dashmarket_cart";

const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const saveCartToCookie = (cart: CartItemWithDetails[]) => {
  try {
    const cartJson = JSON.stringify(cart);
    setCookie(CART_COOKIE_NAME, cartJson, 30);
  } catch (error) {
    console.error("Error saving cart to cookie:", error);
  }
};

export const getCartFromCookie = (): CartItemWithDetails[] => {
  try {
    const cartJson = getCookie(CART_COOKIE_NAME);
    if (cartJson) {
      return JSON.parse(cartJson);
    }
  } catch (error) {
    console.error("Error parsing cart from cookie:", error);
  }
  return [];
};

export const clearCartCookie = () => {
  try {
    document.cookie = `${CART_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  } catch (error) {
    console.error("Error clearing cart cookie:", error);
  }
};

export const saveUserInfoToCookie = (userInfo: UserInfo) => {
  try {
    const userInfoJson = JSON.stringify(userInfo);
    setCookie(COOKIE_NAME, userInfoJson);
  } catch (error) {
    console.error("Error saving user info to cookie:", error);
  }
};

export const getUserInfoFromCookie = (): UserInfo | null => {
  try {
    const userInfoJson = getCookie(COOKIE_NAME);
    if (userInfoJson) {
      return JSON.parse(userInfoJson);
    }
  } catch (error) {
    console.error("Error parsing user info from cookie:", error);
  }
  return null;
};


