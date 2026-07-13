/**
 * Admin API client — typed fetch helpers for all admin endpoints.
 * All calls go through Next.js API routes (service role key, server-side).
 * The admin-token cookie is sent automatically by the browser.
 */

import type { Client, Location, Media } from './types';

const BASE = '';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function listClients(): Promise<Client[]> {
  return apiFetch('/api/admin/clients');
}

export async function getClient(id: string): Promise<Client> {
  return apiFetch(`/api/admin/clients/${id}`);
}

export async function createClient(data: {
  name: string;
  slug: string;
  title: string;
  subtitle?: string;
  bio?: string;
  theme?: string;
  password_protected?: boolean;
  access_password?: string;
}): Promise<Client> {
  return apiFetch('/api/admin/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id: string, data: Partial<Client>): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/clients/${id}`, {
    method: 'DELETE',
  });
}

export async function togglePublish(id: string, is_published: boolean): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/clients/${id}/publish`, {
    method: 'PATCH',
    body: JSON.stringify({ is_published }),
  });
}

// ─── Locations ────────────────────────────────────────────────────────────────

export async function listLocations(clientId: string): Promise<Location[]> {
  return apiFetch(`/api/admin/locations?client_id=${clientId}`);
}

export async function createLocation(data: {
  client_id: string;
  title: string;
  location_name: string;
  latitude: number | string;
  longitude: number | string;
  description?: string;
  date_from?: string | null;
  date_to?: string | null;
  sort_order?: number | string;
  icon_type?: string;
}): Promise<Location> {
  return apiFetch('/api/admin/locations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLocation(id: string, data: Record<string, unknown>): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteLocation(id: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/locations/${id}`, {
    method: 'DELETE',
  });
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function listMedia(clientId: string): Promise<Media[]> {
  return apiFetch(`/api/admin/media?client_id=${clientId}`);
}

export async function deleteMedia(id: string, url: string): Promise<{ success: boolean }> {
  return apiFetch(`/api/admin/media?id=${id}&url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
  });
}

// ─── Uploads ──────────────────────────────────────────────────────────────────

export async function uploadFile(
  file: File,
  clientId: string,
  type: 'media' | 'intro_music' | 'journey_music',
  locationId?: string,
): Promise<{ publicUrl: string; media?: Media }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('client_id', clientId);
  formData.append('type', type);
  if (locationId) formData.append('location_id', locationId);

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Upload failed (${res.status})`);
  }

  return res.json();
}

// ─── Stats ────────────────────────────────────────────────────────────────────

/** Fetch locations for counting (used by dashboard stats) */
export async function listAllLocations(): Promise<Pick<Location, 'id' | 'client_id'>[]> {
  return apiFetch('/api/admin/locations');
}
