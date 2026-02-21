import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getServiceSupabase } from '@/lib/supabase';
import { MapPageClient } from '@/components/map/MapPageClient';
import type { Client, Location, Media } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getServiceSupabase();
  
  const { data: client } = await supabase
    .from('clients')
    .select('id, title, name, subtitle, bio, slug')
    .eq('slug', slug)
    .single();

  if (!client) return {};

  // Fetch first available image media for the client to use as OG image
  const { data: media } = await supabase
    .from('media')
    .select('url')
    .eq('client_id', client.id)
    .eq('type', 'image')
    .order('created_at', { ascending: true })
    .limit(1);

  const description = client.bio || client.subtitle || client.name;
  const imageUrl = media?.[0]?.url;

  return {
    title: `${client.title} | Digital Journey`,
    description,
    openGraph: {
      title: client.title,
      description,
      type: 'website',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: client.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: client.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function MapPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getServiceSupabase();

  // Fetch client by slug — exclude sensitive fields (like access_password)
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, name, slug, title, subtitle, bio, theme, background_music_url, journey_music_url, is_published, password_protected, created_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (clientError || !client) {
    return notFound();
  }

  // Fetch locations by client_id ordered by sort_order
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('*')
    .eq('client_id', client.id)
    .order('sort_order', { ascending: true });

  if (locationsError) {
    console.error('Error fetching locations:', locationsError);
  }

  // Fetch media for this client
  const { data: media, error: mediaError } = await supabase
    .from('media')
    .select('*')
    .eq('client_id', client.id);

  if (mediaError) {
    console.error('Error fetching media:', mediaError);
  }

  console.log(`MapPage: Rendering with ${locations?.length || 0} locations and ${media?.length || 0} media items for client ${client.id}`);

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <MapPageClient 
        client={client} 
        locations={locations || []} 
        media={media || []}
      />
    </main>
  );
}
