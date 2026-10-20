import React, { createContext, useContext, useState, useCallback } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 1,
    name: 'Finance Admin',
    email: 'admin@yash.test',
    role: 'ADMIN',
  });

  const [token, setToken] = useState('direct-finance-token');
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    // No-op for direct finance module
  }, []);

  const login = async () => user;
  const signup = async () => user;

  const hasPermission = () => true;

  const value = {
    user,
    token,
    isAuthenticated: true,
    loading,
    login,
    signup,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default Providers;
