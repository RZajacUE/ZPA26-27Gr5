import React from 'react';

/**
 * GUS (Główny Urząd Statystyczny) Official Emblem Logo
 * Features the signature GUS geometric crest: 
 * Stylized square shield in official GUS green (#007B3B) with statistical bar symbolics
 */
export function GusEmblem({ height = 36, className = '', alt = 'GUS Logo Emblem' }) {
  return (
    <svg
      width={height}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`gus-emblem-svg ${className}`}
      aria-label={alt}
      role="img"
    >
      {/* Background Rounded Shield */}
      <rect width="100" height="100" rx="20" fill="#007B3B" />
      
      {/* Inner Statistical Bars / Crest Motif */}
      <g fill="#FFFFFF">
        {/* Column 1 - Base */}
        <rect x="20" y="52" width="12" height="28" rx="3" />
        {/* Column 2 - Mid */}
        <rect x="36" y="38" width="12" height="42" rx="3" />
        {/* Column 3 - High */}
        <rect x="52" y="24" width="12" height="56" rx="3" />
        {/* Column 4 - Dynamic Peak */}
        <rect x="68" y="32" width="12" height="48" rx="3" />
      </g>
      
      {/* Accent Line / Trend Arrow Top Accent */}
      <path
        d="M26 46L42 32L58 18L74 26"
        stroke="#A4E5B8"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="74" cy="26" r="3.5" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * GUS (Główny Urząd Statystyczny) Full Official Wordmark & Institution Name
 */
export function GusWordmark({ height = 34, className = '', alt = 'GUS Główny Urząd Statystyczny' }) {
  return (
    <div 
      className={`gus-wordmark-container ${className}`} 
      style={{ display: 'flex', alignItems: 'center', gap: '8px', height: `${height}px` }}
      aria-label={alt}
    >
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span 
            style={{ 
              fontSize: '22px', 
              fontWeight: 900, 
              color: '#007B3B', 
              letterSpacing: '-0.03em',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
            }}
          >
            GUS
          </span>
          <span 
            style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              color: '#005C2C', 
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            BDL API
          </span>
        </div>
        <span 
          style={{ 
            fontSize: '9px', 
            fontWeight: 600, 
            color: '#4B5563', 
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}
        >
          Główny Urząd Statystyczny
        </span>
      </div>
    </div>
  );
}

/**
 * GUS Bank Danych Lokalnych Badge Logo
 */
export function GusBdlBadge({ className = '' }) {
  return (
    <div className={`gus-bdl-badge ${className}`}>
      <span className="gus-badge-dot"></span>
      <span className="gus-badge-text">Bank Danych Lokalnych (BDL)</span>
    </div>
  );
}

