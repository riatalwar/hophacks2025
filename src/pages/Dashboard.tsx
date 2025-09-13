import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const { currentUser, signOut } = useAuth();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {currentUser?.displayName || currentUser?.email}!</h1>
      <button 
        onClick={signOut}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
