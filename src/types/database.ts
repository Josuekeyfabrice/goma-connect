export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  city: string;
  avenue: string | null;
  address: string | null;
  phone: string;
  images: string[];
  is_active: boolean;
  is_approved: boolean;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  product_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Call {
  id: string;
  caller_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ended' | 'missed';
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export const CATEGORIES = [
  'Électronique',
  'Véhicules',
  'Immobilier',
  'Mode & Vêtements',
  'Maison & Jardin',
  'Sports & Loisirs',
  'Services',
  'Emploi',
  'Alimentation',
  'Autres',
] as const;

export const CITIES = [
  'Goma',
  'Bukavu',
  'Beni',
  'Butembo',
  'Uvira',
  'Kalemie',
  'Kindu',
] as const;
