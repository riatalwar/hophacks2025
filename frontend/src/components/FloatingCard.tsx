import React from 'react';

interface FloatingCardProps {
  icon: string;
  text: string;
  position: 'card-1' | 'card-2' | 'card-3';
}

export function FloatingCard({ icon, text, position }: FloatingCardProps) {
  return (
    <div className={`floating-card ${position}`}>
      <div className="card-icon">{icon}</div>
      <span>{text}</span>
    </div>
  );
}

