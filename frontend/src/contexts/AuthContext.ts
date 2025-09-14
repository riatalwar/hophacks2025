import { createContext } from 'react';
import type { AuthContextType } from '@shared/types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);