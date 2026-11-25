import { useState } from 'react';

export function IsoImageCard({
  src,
  alt,
  className = '',
  fallbackIcon,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-emerald-50 text-sky-600 ${className}`}
        role="img"
        aria-label={alt}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

/** 3D Isometric Ambulance Icon for Coral KPI Card */
export function IsoAmbulanceIcon({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ambTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFE4E6" />
        </linearGradient>
        <linearGradient id="ambSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDA4AF" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="32" cy="52" rx="22" ry="7" fill="#FB7185" fillOpacity="0.22" />
      {/* Isometric van body */}
      <polygon points="10,33 32,21 54,32 32,44" fill="url(#ambTop)" stroke="#F43F5E" strokeWidth="1.2" />
      <polygon points="10,33 32,44 32,51 10,40" fill="#FECDD3" stroke="#E11D48" strokeWidth="1" />
      <polygon points="32,44 54,32 54,40 32,51" fill="url(#ambSide)" stroke="#BE123C" strokeWidth="1" />
      {/* Cabin roof + red cross + siren */}
      <polygon points="19,27 32,20 45,26 32,33" fill="#FFFFFF" stroke="#FDA4AF" strokeWidth="1" />
      <rect x="30" y="16" width="5" height="4" rx="1.5" fill="#EF4444" />
      <path d="M39 39 L45 36 M42 34.5 L42 40.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
      {/* Wheels */}
      <circle cx="20" cy="46" r="3.4" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="43" cy="45" r="3.4" fill="#1E293B" stroke="#E2E8F0" strokeWidth="1" />
    </svg>
  );
}

/** 3D Isometric Traffic Signal Icon for Mint KPI Card */
export function IsoTrafficSignalIcon({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="54" rx="14" ry="5" fill="#10B981" fillOpacity="0.22" />
      {/* Pole */}
      <rect x="29.5" y="37" width="5" height="16" rx="2" fill="#334155" />
      {/* Isometric housing */}
      <polygon points="21,14 32,9 43,14 43,39 32,44 21,39" fill="#1E293B" stroke="#0F172A" strokeWidth="1.2" />
      <polygon points="32,9 43,14 43,39 32,44" fill="#334155" />
      {/* Signal lenses */}
      <circle cx="27.5" cy="18" r="3.3" fill="#F43F5E" opacity="0.45" />
      <circle cx="27.5" cy="26.5" r="3.3" fill="#F59E0B" opacity="0.5" />
      <circle cx="27.5" cy="35" r="4.1" fill="#10B981" stroke="#A7F3D0" strokeWidth="1.4" />
    </svg>
  );
}

/** 3D Isometric Location Pin Icon for Sky Blue KPI Card */
export function IsoLocationPinIcon({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="52" rx="17" ry="6" fill="#3B82F6" fillOpacity="0.22" />
      {/* Base isometric tile */}
      <polygon points="14,47 32,39 50,47 32,55" fill="#DBEAFE" stroke="#60A5FA" strokeWidth="1.2" />
      {/* 3D Pin */}
      <path
        d="M32 10 C22.5 10 16 17 16 25.5 C16 36.5 32 48 32 48 C32 48 48 36.5 48 25.5 C48 17 41.5 10 32 10 Z"
        fill="#2563EB"
        stroke="#1D4ED8"
        strokeWidth="1.2"
      />
      <path
        d="M32 10 C39 10 46 15.5 46 25.5 C46 34.5 34 45.5 32 47.5 L32 10 Z"
        fill="#3B82F6"
      />
      <circle cx="32" cy="24.5" r="6" fill="#FFFFFF" />
      <circle cx="32" cy="24.5" r="2.8" fill="#06B6D4" />
    </svg>
  );
}

/** 3D Isometric Clock / Speed Timer Icon for Lavender KPI Card */
export function IsoClockIcon({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="53" rx="18" ry="6" fill="#8B5CF6" fillOpacity="0.2" />
      {/* 3D cylindrical rim */}
      <ellipse cx="33" cy="33" rx="18" ry="18" fill="#6D28D9" />
      <circle cx="30" cy="30" r="18" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2.5" />
      <circle cx="30" cy="30" r="13.5" fill="#F5F3FF" />
      {/* Clock hands */}
      <path d="M30 20 V30 L37.5 34" fill="none" stroke="#6D28D9" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30" cy="30" r="2.2" fill="#10B981" />
      {/* Top stopwatch crown */}
      <rect x="27" y="8" width="6" height="4" rx="1.2" fill="#7C3AED" />
    </svg>
  );
}
