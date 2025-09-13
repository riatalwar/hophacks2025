import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { currentUser, signOut } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {currentUser?.displayName || currentUser?.email}!</h1>
      <button 
        onClick={signOut}
        className="primary-button"
        style={{
          padding: '0.5rem 1rem',
          cursor: 'pointer'
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
