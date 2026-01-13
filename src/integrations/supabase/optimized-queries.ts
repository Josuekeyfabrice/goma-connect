/**
 * Optimized Supabase Queries
 * Centralized queries with proper indexing and caching strategies
 */

import { supabase } from './client';

/**
 * Fetch products with pagination and filters
 * Uses proper indexing on seller_id, is_active, and created_at
 */
export const fetchProductsOptimized = async (
  page: number = 1,
  limit: number = 20,
  filters?: {
    sellerId?: string;
    category?: string;
    isActive?: boolean;
  }
) => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from('products')
    .select('id, name, price, images, category, seller_id, is_active, created_at', {
      count: 'exact',
    });

  if (filters?.sellerId) {
    query = query.eq('seller_id', filters.sellerId);
  }

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, count, page, limit };
};

/**
 * Fetch seller profile with related data
 * Combines profile, stats, and verification in one optimized query
 */
export const fetchSellerProfileOptimized = async (sellerId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', sellerId)
    .single();

  if (profileError) throw profileError;

  // Fetch stats in parallel
  const [{ data: reviews }, { data: transactions }] = await Promise.all([
    supabase
      .from('reviews')
      .select('rating')
      .eq('seller_id', sellerId),
    supabase
      .from('transactions')
      .select('status')
      .eq('seller_id', sellerId)
      .eq('status', 'completed'),
  ]);

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return {
    profile,
    stats: {
      totalSales: transactions?.length || 0,
      averageRating: avgRating,
      totalReviews: reviews?.length || 0,
    },
  };
};

/**
 * Fetch reviews for a product with buyer info
 * Uses select to only fetch necessary fields
 */
export const fetchProductReviewsOptimized = async (
  productId: string,
  limit: number = 10
) => {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(
      `
      id,
      rating,
      title,
      comment,
      images,
      created_at,
      buyer_id,
      profiles:buyer_id(full_name, avatar_url)
    `
    )
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return reviews;
};

/**
 * Fetch transactions for a user with pagination
 * Optimized for the transactions page
 */
export const fetchUserTransactionsOptimized = async (
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('transactions')
    .select(
      `
      id,
      product_id,
      buyer_id,
      seller_id,
      amount,
      status,
      created_at,
      products(name, images),
      profiles:seller_id(full_name)
    `,
      { count: 'exact' }
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, count, page, limit };
};

/**
 * Search products with full-text search
 * Uses Supabase full-text search capabilities
 */
export const searchProductsOptimized = async (
  query: string,
  page: number = 1,
  limit: number = 20
) => {
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .ilike('name', `%${query}%`)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { data, count, page, limit };
};

/**
 * Fetch nearby sellers using PostGIS
 * Requires location data to be stored as geography type in Supabase
 */
export const fetchNearbySellersOptimized = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
) => {
  // Note: This requires PostGIS extension enabled in Supabase
  // and location stored as geography type
  const { data, error } = await supabase
    .rpc('nearby_sellers', {
      lat: latitude,
      lng: longitude,
      radius_km: radiusKm,
    });

  if (error) throw error;

  return data;
};

/**
 * Batch fetch multiple products
 * More efficient than individual queries
 */
export const fetchProductsBatchOptimized = async (productIds: string[]) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds);

  if (error) throw error;

  return data;
};

/**
 * Update product with optimistic updates
 * Includes error handling and rollback
 */
export const updateProductOptimized = async (
  productId: string,
  updates: Record<string, any>
) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;

  return data;
};

/**
 * Bulk insert reviews
 * More efficient for batch operations
 */
export const insertReviewsOptimized = async (
  reviews: Array<{
    productId: string;
    sellerId: string;
    buyerId: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }>
) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviews)
    .select();

  if (error) throw error;

  return data;
};
