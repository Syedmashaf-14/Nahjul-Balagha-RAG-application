'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isGuest: boolean;
}

interface AuthContextType {
  user: AuthUser;
  login: (email: string, name?: string) => void;
  logout: () => void;
  setGuest: () => void;
}

const DEFAULT_GUEST: AuthUser = {
  id: 'guest_user_101',
  name: 'Guest Seeker',
  email: 'guest@nahj-al-balagha.org',
  role: 'user',
  isGuest: true,
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_GUEST,
  login: () => {},
  logout: () => {},
  setGuest: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(DEFAULT_GUEST);

  useEffect(() => {
    // Check localStorage for saved session
    const saved = localStorage.getItem('nahj_auth_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(DEFAULT_GUEST);
      }
    }
  }, []);

  const login = (email: string, name?: string) => {
    const loggedUser: AuthUser = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      name: name || email.split('@')[0],
      email,
      role: 'user',
      isGuest: false,
    };
    setUser(loggedUser);
    localStorage.setItem('nahj_auth_user', JSON.stringify(loggedUser));
  };

  const logout = () => {
    setUser(DEFAULT_GUEST);
    localStorage.removeItem('nahj_auth_user');
  };

  const setGuest = () => {
    setUser(DEFAULT_GUEST);
    localStorage.setItem('nahj_auth_user', JSON.stringify(DEFAULT_GUEST));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
