import type { User } from 'firebase/auth';

/**
 * Authentication context type for React context
 */
export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
