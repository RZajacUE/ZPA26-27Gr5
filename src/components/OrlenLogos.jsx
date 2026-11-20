import React from 'react';
import eagleSvg from '../assets/Orlen_eagle_logo.svg';
import wordmarkSvg from '../assets/Orlen_wordmark_logo.svg';

export function OrlenAppLogo({ height = 36, className = '', alt = 'ORLEN App Logo' }) {
  return (
    <img 
      src={eagleSvg} 
      alt={alt} 
      height={height}
      style={{ height: `${height}px`, width: 'auto', display: 'block' }}
      className={`orlen-app-logo ${className}`}
    />
  );
}

export function OrlenMainLogo({ height = 34, className = '', alt = 'PKN ORLEN Main Logo' }) {
  return (
    <img 
      src={wordmarkSvg} 
      alt={alt} 
      height={height}
      style={{ height: `${height}px`, width: 'auto', display: 'block' }}
      className={`orlen-main-logo ${className}`}
    />
  );
}
