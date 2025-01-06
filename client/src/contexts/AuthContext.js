import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { ROLE_PERMISSIONS } from "../constants/permissions";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    try {
      const token = Cookies.get("userCookie");
      if (token) {
        const decodedToken = jwtDecode(token);
        return {
          userRole: decodedToken.role,
          token,
          isAuthenticated: true,
        };
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      Cookies.remove("userCookie");
    }
    return {
      userRole: null,
      token: null,
      isAuthenticated: false,
    };
  });

  const login = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      Cookies.set("userCookie", token);
      setAuthState({
        userRole: decodedToken.role,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error during login:", error);
      throw new Error("Invalid token");
    }
  };

  const logout = () => {
    Cookies.remove("userCookie");
    setAuthState({
      userRole: null,
      token: null,
      isAuthenticated: false,
    });
  };

  const hasPermission = (permission) => {
    return ROLE_PERMISSIONS[authState.userRole]?.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
