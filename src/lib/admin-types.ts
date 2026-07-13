import type { Location } from './types';

/** Form data shape for creating/editing a location in the admin UI */
export interface EditingLocation {
  id?: string;
  title: string;
  location_name: string;
  latitude: string | number;
  longitude: string | number;
  description: string;
  date_from: string;
  date_to: string;
  sort_order: string | number;
  icon_type: string;
}

/** Convert an existing Location to the editing form shape */
export function locationToEditing(location: Location): EditingLocation {
  return {
    id: location.id,
    title: location.title,
    location_name: location.location_name,
    latitude: location.latitude,
    longitude: location.longitude,
    description: location.description || '',
    date_from: location.date_from || '',
    date_to: location.date_to || '',
    sort_order: location.sort_order,
    icon_type: location.icon_type || 'home',
  };
}

/** Create a blank editing location for the "add new" modal */
export function blankEditingLocation(nextSortOrder: number): EditingLocation {
  return {
    title: '',
    location_name: '',
    latitude: '',
    longitude: '',
    description: '',
    date_from: '',
    date_to: '',
    sort_order: nextSortOrder.toString(),
    icon_type: 'home',
  };
}
