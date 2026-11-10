import React from 'react';
import gusNameSvg from '../assets/GUS_name_logo.svg';
import gusOnlySvg from '../assets/GUS_only_logo.svg';

export function GusLogo({ height = 36, className = '', alt = 'Główny Urząd Statystyczny' }) {
  return (
    <div className="gus-logo-container" title="Główny Urząd Statystyczny">
      <img 
        src={gusNameSvg} 
        alt={alt} 
        height={height}
        style={{ height: `${height}px`, width: 'auto', display: 'block' }}
        className={`gus-main-logo ${className}`}
      />
    </div>
  );
}

export function GusEmblem({ height = 32, className = '', alt = 'GUS Logo' }) {
  return (
    <div className="gus-emblem-container" title="GUS Emblem">
      <img 
        src={gusOnlySvg} 
        alt={alt} 
        height={height}
        style={{ height: `${height}px`, width: 'auto', display: 'block' }}
        className={`gus-emblem-logo ${className}`}
      />
    </div>
  );
}

export function GusBdlBadge({ className = '' }) {
  return (
    <div className={`gus-bdl-badge ${className}`}>
      <span className="gus-badge-dot"></span>
      <span className="gus-badge-text">GUS BDL</span>
    </div>
  );
}
