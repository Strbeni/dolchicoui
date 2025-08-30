// hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isProfileComplete: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/profile', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAuth({
          user: data.user,
          loading: false,
          error: null
        });
      } else {
        setAuth({
          user: null,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      setAuth({
        user: null,
        loading: false,
        error: 'Failed to check authentication'
      });
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      setAuth({
        user: null,
        loading: false,
        error: null
      });
      
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    ...auth,
    checkAuth,
    logout
  };
};
