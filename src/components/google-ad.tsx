'use client';

import React, { useEffect, useRef } from 'react';

interface GoogleAdProps {
  client?: string;
  slot?: string;
  format?: string;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function GoogleAd({
  client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-2962676217775659',
  slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || '7154365588',
  format = 'auto',
  responsive = true,
  className = '',
  style = { display: 'block' },
}: GoogleAdProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (err) {
      console.error('Google AdSense push error:', err);
    }
  }, []);

  if (!client || !slot) return null;

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
