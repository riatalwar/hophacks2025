import { createContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock authentication - in real app, this would call Firebase
    const user: User = {
      uid: Date.now().toString(),
      email,
      displayName: email.split('@')[0]
    };
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    // Mock authentication - in real app, this would call Firebase
    const user: User = {
      uid: Date.now().toString(),
      email,
      displayName: displayName || email.split('@')[0]
    };
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const signOut = async () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
