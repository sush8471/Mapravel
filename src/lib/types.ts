export interface Client {
  id: string;
  name: string;
  slug: string;
  title: string;
  subtitle?: string;
  background_music_url?: string;
  journey_music_url?: string;
  bio?: string;
  theme?: string;
  is_published: boolean;
  password_protected: boolean;
  access_password?: string | null;
  created_at?: string;
}

export interface Location {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  location_name: string;
  date_from?: string;
  date_to?: string;
  sort_order: number;
  icon_type?: string;
  created_at?: string;
}

export interface Media {
  id: string;
  client_id: string;
  location_id: string;
  url: string;
  type: string;
  created_at?: string;
}
