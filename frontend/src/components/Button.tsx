import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'cta';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick, 
  href, 
  className = '', 
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'button';
  const variantClasses = {
    primary: 'primary-button',
    secondary: 'secondary-button',
    cta: 'cta-button'
  };
  const sizeClasses = {
    small: 'small',
    medium: '',
    large: 'large'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

