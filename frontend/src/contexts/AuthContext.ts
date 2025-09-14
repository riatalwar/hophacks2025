import { createContext } from 'react';
import type { User } from 'firebase/auth';

/**
 * Authentication context type for React context
 */
export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);