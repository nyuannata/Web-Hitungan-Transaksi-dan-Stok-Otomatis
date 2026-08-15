import React from 'react';

/**
 * MengudaraLogo Component
 * Renders the official wavy/psychedelic MENGUDARA SCREEN PRINTING logo
 */
export const MengudaraLogo = ({ width = 280, height = 'auto', color = '#000000', className = '' }) => {
  return (
    <div className={`mengudara-logo-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <svg
        viewBox="0 0 800 280"
        width={width}
        {...(height !== 'auto' ? { height } : {})}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', maxWidth: '100%', height: height === 'auto' ? 'auto' : undefined }}
      >
        <defs>
          {/* Wavy Liquid Organic Filter for 70s Screen Printing Aesthetic */}
          <filter id="mengudara-wavy-effect" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="turbulence" baseFrequency="0.015 0.03" numOctaves="2" result="warp" />
            <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="12" in="SourceGraphic" in2="warp" />
          </filter>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Titan+One&display=swap');
            .logo-top-text {
              font-family: 'Titan One', 'Impact', sans-serif;
              font-size: 110px;
              font-weight: 900;
              letter-spacing: -2px;
              text-transform: uppercase;
              filter: url(#mengudara-wavy-effect);
            }
            .logo-sub-text {
              font-family: 'Titan One', 'Impact', sans-serif;
              font-size: 58px;
              font-weight: 900;
              letter-spacing: 2px;
              text-transform: uppercase;
              filter: url(#mengudara-wavy-effect);
            }
          `}</style>
        </defs>

        <g fill={color}>
          {/* Main Brand Title: MENGUDARA */}
          <text
            x="400"
            y="130"
            textAnchor="middle"
            className="logo-top-text"
          >
            MENGUDARA
          </text>

          {/* Subtitle: SCREEN PRINTING */}
          <text
            x="400"
            y="235"
            textAnchor="middle"
            className="logo-sub-text"
          >
            SCREEN PRINTING
          </text>
        </g>
      </svg>
    </div>
  );
};

export default MengudaraLogo;
