'use client';

import { useState, useEffect } from 'react';
import { MapView } from './MapView';
import { AccessGate } from './AccessGate';
import type { Client, Location, Media } from '@/lib/types';

interface MapPageClientProps {
  client: Client;
  locations: Location[];
  media: Media[];
}

export function MapPageClient({ client, locations, media }: MapPageClientProps) {
  const [accessGranted, setAccessGranted] = useState(!client.password_protected);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (!client.password_protected) {
      setAccessGranted(true);
      setIsVerifying(false);
      return;
    }

    // Check session storage for existing token
    const token = sessionStorage.getItem(`journey_token_${client.slug}`);
    if (token) {
      // In a real app we might want to verify the token with the server here
      // but for UX we'll assume it's valid if it exists in sessionStorage
      setAccessGranted(true);
    }
    setIsVerifying(false);
  }, [client.password_protected, client.slug]);

  const handleVerify = async (password: string) => {
    try {
      const res = await fetch('/api/client/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: client.slug, password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        sessionStorage.setItem(`journey_token_${client.slug}`, data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Verification error:', err);
      return false;
    }
  };

  if (isVerifying) {
    return <div className="min-h-screen bg-[#0a0a0f]" />;
  }

  if (!accessGranted) {
    return (
      <AccessGate 
        title={client.title}
        subtitle="Private Journey Map"
        onAccessGranted={() => setAccessGranted(true)}
        onVerify={handleVerify}
      />
    );
  }

  return (
    <MapView 
      client={client} 
      locations={locations} 
      media={media}
    />
  );
}
