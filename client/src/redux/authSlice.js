// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import {jwtDecode} from "jwt-decode";

const initialState = {
  token: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokenAndRole(state, action) {
      const token = action.payload;
      if (token) {
        const decoded = jwtDecode(token);
        state.token = token;
        state.role = decoded.role;
      }
    },
    clearAuth(state) {
      state.token = null;
      state.role = null;
    },
  },
});

export const { setTokenAndRole, clearAuth } = authSlice.actions;
export default authSlice.reducer;

// Helper to initialize auth from cookies
export const initializeAuth = () => (dispatch) => {
  const token = Cookies.get("userCookie");
  if (token) {
    dispatch(setTokenAndRole(token));
  }
};
