"use client";
import { useEffect, createContext, useContext } from "react";
import { useAuthStore } from "@/store/auth.store";

var AuthContext = createContext(null);

export function AuthProvider({ children }) {
  var token     = useAuthStore(function(s) { return s.token; });
  var user      = useAuthStore(function(s) { return s.user; });
  var clearAuth = useAuthStore(function(s) { return s.clearAuth; });

  useEffect(function() {
    if (token && user) {
      var maxAge = 7 * 24 * 60 * 60;
      document.cookie = "shotlin_token=" + token + "; path=/; max-age=" + maxAge + "; SameSite=Lax";
      document.cookie = "shotlin_user=" + JSON.stringify(user) + "; path=/; max-age=" + maxAge + "; SameSite=Lax";
    } else {
      document.cookie = "shotlin_token=; path=/; max-age=0";
      document.cookie = "shotlin_user=; path=/; max-age=0";
    }
  }, [token, user]);

  useEffect(function() {
    if (!token) return;
    try {
      var payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) clearAuth();
    } catch(e) { clearAuth(); }
  }, [token, clearAuth]);

  return (
    <AuthContext.Provider value={{ token: token, user: user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  var ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be inside AuthProvider");
  return ctx;
}