import axios from "axios";

const BASE_URL = "https://dailyneedstore2-0.onrender.com";
const AUTH_TOKEN_KEY = "shopkeeper_token";

axios.defaults.baseURL = BASE_URL;

// Restore saved token when application starts
const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);

if (savedToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}

export const getShopkeeperToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setShopkeeperToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
    localStorage.removeItem("shopkeeper_user");
  }
};

export { axios, BASE_URL };
