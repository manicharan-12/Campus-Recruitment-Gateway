// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Log the default value of userRole
console.log("Default value of userRole: null");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    userRole: null,
  },
  reducers: {
    setUserRole: (state, action) => {
      console.log("setUserRole action payload:", action.payload);
      state.userRole = action.payload;
    },
  },
});

export const { setUserRole } = authSlice.actions;

export default authSlice.reducer;
