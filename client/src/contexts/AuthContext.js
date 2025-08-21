import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Normalize API user shape (snake_case) to client shape (camelCase)
  const mapApiUserToClient = (apiUser) => {
    if (!apiUser) return null;
    return {
      id: apiUser.id,
      email: apiUser.email,
      firstName: apiUser.first_name ?? apiUser.firstName,
      lastName: apiUser.last_name ?? apiUser.lastName,
      phone: apiUser.phone,
      address: apiUser.address,
      city: apiUser.city,
      postcode: apiUser.postcode,
      profileImage: apiUser.profile_image ?? apiUser.profileImage,
      created_at: apiUser.created_at ?? apiUser.createdAt,
      tradesperson_id: apiUser.tradesperson_id, // keep snake_case as ID key used elsewhere
    };
  };

  // Set auth token for axios requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      setUser(mapApiUserToClient(res.data));
    } catch (err) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['x-auth-token'];
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      const { token: newToken } = res.data;
      
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['x-auth-token'] = newToken;
      
      await loadUser();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.msg || 'Registration failed' 
      };
    }
  };

  const login = async (credentials) => {
    try {
      const res = await axios.post('/api/auth/login', credentials);
      const { token: newToken } = res.data;
      
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['x-auth-token'] = newToken;
      
      await loadUser();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.msg || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/users/profile', profileData);
      setUser(mapApiUserToClient(res.data));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.msg || 'Profile update failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    loadUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
