export interface BaseDBEntry {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User extends BaseDBEntry {
  email: string;
  username: string;
  displayName: string;
  firebaseUid: string;
}

export interface Collection<T extends BaseDBEntry = BaseDBEntry> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

export type CreateInput<T extends BaseDBEntry> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T extends BaseDBEntry> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
export type QueryResult<T extends BaseDBEntry> = T & { id: string };